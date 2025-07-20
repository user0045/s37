import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAllContent = () => {
  return useQuery({
    queryKey: ['all-content'],
    staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      console.log('Fetching all content...');

      // First, get all upload_content entries ordered by updated_at then created_at (newest first)
      const { data: uploadContent, error: uploadError } = await supabase
        .from('upload_content')
        .select('*')
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (uploadError) throw uploadError;

      const movies: any[] = [];
      const webSeries: any[] = [];

      // Process each upload_content entry (only Movies and Web Series)
      for (const content of uploadContent || []) {
        if (content.content_type === 'Movie') {
          // Fetch movie details
          const { data: movieData, error: movieError } = await supabase
            .from('movie')
            .select('*')
            .eq('content_id', content.content_id)
            .single();

          if (!movieError && movieData) {
            movies.push({
              ...content,
              movie: movieData
            });
          }
        } else if (content.content_type === 'Web Series') {
          // Fetch web series details
          const { data: webSeriesData, error: webSeriesError } = await supabase
            .from('web_series')
            .select('*')
            .eq('content_id', content.content_id)
            .single();

          if (!webSeriesError && webSeriesData) {
            // Fetch seasons for this web series and create separate entries for each season
            if (webSeriesData.season_id_list && webSeriesData.season_id_list.length > 0) {
              for (let seasonIndex = 0; seasonIndex < webSeriesData.season_id_list.length; seasonIndex++) {
                const seasonId = webSeriesData.season_id_list[seasonIndex];
                const { data: seasonData, error: seasonError } = await supabase
                  .from('season')
                  .select('*')
                  .eq('season_id', seasonId)
                  .single();

                if (!seasonError && seasonData) {
                  // Fetch episodes for this season
                  const episodes: any[] = [];
                  if (seasonData.episode_id_list && seasonData.episode_id_list.length > 0) {
                    for (const episodeId of seasonData.episode_id_list) {
                      const { data: episodeData, error: episodeError } = await supabase
                        .from('episode')
                        .select('*')
                        .eq('episode_id', episodeId)
                        .single();

                      if (!episodeError && episodeData) {
                        episodes.push(episodeData);
                      }
                    }
                  }

                  // Create a separate entry for each season
                  webSeries.push({
                    ...content,
                    id: `${content.id}-season-${seasonIndex + 1}`, // Unique ID for each season
                    seasonNumber: seasonIndex + 1,
                    content_type: 'Web Series', // Ensure correct content type
                    web_series: {
                      ...webSeriesData,
                      seasons: [{
                        ...seasonData,
                        episodes
                      }]
                    },
                    // Use season creation time for sorting
                    created_at: seasonData.created_at || content.created_at,
                    updated_at: seasonData.updated_at || content.updated_at
                  });
                }
              }
            }
          }
        }
      }

      // Get all show content
      const shows: any[] = [];
      for (const content of uploadContent || []) {
        if (content.content_type === 'Show') {
          // Fetch show details using show.id = content.content_id
          const { data: showData, error: showError } = await supabase
            .from('show')
            .select('*')
            .eq('id', content.content_id)
            .single();

          if (!showError && showData) {
            shows.push({
              ...content,
              show: showData
            });
          } else {
            console.error('Error fetching show data:', showError, 'for content_id:', content.content_id);
          }
        }
      }

      console.log('Fetched content:', { movies, webSeries, shows });

      return {
        movies,
        webSeries,
        shows
      };
    },
  });
};

export const useContentByFeature = (feature: string) => {
  return useQuery({
    queryKey: ['content-by-feature', feature],
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      console.log('Fetching content by feature:', feature);

      if (!feature) {
        return [];
      }

      try {
        // Get all upload_content entries
        const { data: uploadContent, error: uploadError } = await supabase
          .from('upload_content')
          .select('*');

        if (uploadError) {
          console.error('Error fetching upload content:', uploadError);
          throw uploadError;
        }

        const filteredContent: any[] = [];

        // Process each upload_content entry
        for (const content of uploadContent || []) {
          if (content.content_type === 'Movie') {
            // Fetch movie details
            const { data: movieData, error: movieError } = await supabase
              .from('movie')
              .select('*')
              .eq('content_id', content.content_id)
              .single();

            if (!movieError && movieData && movieData.feature_in?.includes(feature)) {
              filteredContent.push({
                ...content,
                movie: movieData
              });
            }
          } else if (content.content_type === 'Web Series') {
            // Fetch web series details
            const { data: webSeriesData, error: webSeriesError } = await supabase
              .from('web_series')
              .select('*')
              .eq('content_id', content.content_id)
              .single();

            if (!webSeriesError && webSeriesData) {
              // Check each season individually for the feature
              if (webSeriesData.season_id_list && webSeriesData.season_id_list.length > 0) {
                for (let seasonIndex = 0; seasonIndex < webSeriesData.season_id_list.length; seasonIndex++) {
                  const seasonId = webSeriesData.season_id_list[seasonIndex];
                  const { data: seasonData, error: seasonError } = await supabase
                    .from('season')
                    .select('*')
                    .eq('season_id', seasonId)
                    .single();

                  if (!seasonError && seasonData && seasonData.feature_in?.includes(feature)) {
                    // Create separate entry for this season
                    filteredContent.push({
                      ...content,
                      id: `${content.id}-season-${seasonIndex + 1}`,
                      seasonNumber: seasonIndex + 1,
                      content_type: 'Web Series', // Ensure correct content type
                      web_series: {
                        ...webSeriesData,
                        seasons: [seasonData]
                      },
                      // Use season creation time for sorting
                      created_at: seasonData.created_at || content.created_at,
                      updated_at: seasonData.updated_at || content.updated_at
                    });
                  }
                }
              }
            }
          } else if (content.content_type === 'Show') {
            // Fetch show details
            const { data: showData, error: showError } = await supabase
              .from('show')
              .select('*')
              .eq('id', content.content_id)
              .single();

            if (!showError && showData && showData.feature_in?.includes(feature)) {
              filteredContent.push({
                ...content,
                show: showData
              });
            }
          }
        }

        return filteredContent;
      } catch (error) {
        console.error('Error in useContentByFeature:', error);
        throw error;
      }
    },
    enabled: !!feature,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};

export const useContentByGenre = (genre: string) => {
  return useQuery({
    queryKey: ['content-by-genre', genre],
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    queryFn: async () => {
      console.log('Fetching content by genre:', genre);

      if (!genre) {
        return [];
      }

      try {
        // Handle Action & Adventure special case
        const genresToCheck = genre === 'Action & Adventure' 
          ? ['Action', 'Adventure'] 
          : [genre];

        // Start from upload_content table and filter by genre first
        const { data: uploadContent, error: uploadError } = await supabase
          .from('upload_content')
          .select('*');

        if (uploadError) {
          console.error('Error fetching upload content:', uploadError);
          throw uploadError;
        }

        const filteredContent: any[] = [];

        // Filter upload_content by genre first, then follow foreign keys
        const genreFilteredContent = uploadContent?.filter(content => 
          content.genre && content.genre.some((g: string) => genresToCheck.includes(g))
        ) || [];

        console.log(`Upload content filtered by genre "${genre}":`, genreFilteredContent);

        // Now process each filtered content entry and fetch related data
        for (const content of genreFilteredContent) {
          if (content.content_type === 'Movie') {
            // Fetch movie details using content_id foreign key
            const { data: movieData, error: movieError } = await supabase
              .from('movie')
              .select('*')
              .eq('content_id', content.content_id)
              .single();

            if (!movieError && movieData) {
              filteredContent.push({
                ...content,
                movie: movieData
              });
            }
          } else if (content.content_type === 'Web Series') {
            // Fetch web series details using content_id foreign key
            const { data: webSeriesData, error: webSeriesError } = await supabase
              .from('web_series')
              .select('*')
              .eq('content_id', content.content_id)
              .single();

            if (!webSeriesError && webSeriesData) {
              // Create separate entries for each season
              if (webSeriesData.season_id_list && webSeriesData.season_id_list.length > 0) {
                for (let seasonIndex = 0; seasonIndex < webSeriesData.season_id_list.length; seasonIndex++) {
                  const seasonId = webSeriesData.season_id_list[seasonIndex];
                  const { data: seasonData, error: seasonError } = await supabase
                    .from('season')
                    .select('*')
                    .eq('season_id', seasonId)
                    .single();

                  if (!seasonError && seasonData) {
                    // Fetch episodes using episode_id_list foreign keys
                    const episodes: any[] = [];
                    if (seasonData.episode_id_list && seasonData.episode_id_list.length > 0) {
                      for (const episodeId of seasonData.episode_id_list) {
                        const { data: episodeData, error: episodeError } = await supabase
                          .from('episode')
                          .select('*')
                          .eq('episode_id', episodeId)
                          .single();

                        if (!episodeError && episodeData) {
                          episodes.push(episodeData);
                        }
                      }
                    }

                    // Create separate entry for this season
                    filteredContent.push({
                      ...content,
                      id: `${content.id}-season-${seasonIndex + 1}`,
                      seasonNumber: seasonIndex + 1,
                      content_type: 'Web Series', // Ensure correct content type
                      web_series: {
                        ...webSeriesData,
                        seasons: [{
                          ...seasonData,
                          episodes
                        }]
                      },
                      // Use season creation time for sorting
                      created_at: seasonData.created_at || content.created_at,
                      updated_at: seasonData.updated_at || content.updated_at
                    });
                  }
                }
              }
            }
          } else if (content.content_type === 'Show') {
            // Fetch show details using show.id = content.content_id
            const { data: showData, error: showError } = await supabase
              .from('show')
              .select('*')
              .eq('id', content.content_id)
              .single();

            if (!showError && showData) {
              filteredContent.push({
                ...content,
                show: showData
              });
            }
          }
        }

        console.log(`Final filtered content for genre "${genre}":`, filteredContent);
        return filteredContent;
      } catch (error) {
        console.error('Error in useContentByGenre:', error);
        throw error;
      }
    },
    enabled: !!genre,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
  });
};