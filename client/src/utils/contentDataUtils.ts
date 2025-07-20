
// Utility functions for consistent content data access across the application
export interface ContentData {
  id: string;
  title: string;
  content_type: string;
  genre: string[];
  content_id: string;
  movie?: any;
  web_series?: any;
  show?: any;
  originalData?: any;
  [key: string]: any;
}

export const getContentDetails = (content: ContentData) => {
  console.log('Getting content details for content type:', content.content_type);
  
  const contentType = content.content_type || content.originalData?.content_type || content.type;
  
  const details = {
    id: content.id,
    title: content.title,
    contentType,
    genre: content.genre || content.originalData?.genre || [],
    directors: [] as string[],
    writers: [] as string[],
    castMembers: [] as string[],
    description: '',
    year: '',
    rating: '',
    score: '',
    image: '',
    duration: null as string | null,
    episodeCount: null as string | null,
  };

  if (contentType === 'Movie') {
    // For movies, prioritize direct movie object access
    const movieData = content.movie || content.originalData?.movie;
    
    console.log('Processing movie with data:', !!movieData);
    
    if (movieData) {
      details.directors = Array.isArray(movieData.director) ? movieData.director : (movieData.director ? [movieData.director] : []);
      details.writers = Array.isArray(movieData.writer) ? movieData.writer : (movieData.writer ? [movieData.writer] : []);
      details.castMembers = Array.isArray(movieData.cast_members) ? movieData.cast_members : (movieData.cast_members ? [movieData.cast_members] : []);
      details.description = movieData.description || '';
      details.year = movieData.release_year?.toString() || '';
      details.rating = movieData.rating_type || '';
      details.score = movieData.rating?.toString() || '';
      details.image = movieData.thumbnail_url || '';
      details.duration = movieData.duration ? `${movieData.duration} min` : null;
      
      console.log('Movie details extracted:', {
        directors: details.directors.length,
        writers: details.writers.length,
        castMembers: details.castMembers.length,
        rating: details.rating,
        year: details.year
      });
    }
  } else if (contentType === 'Web Series') {
    // For web series, access season data
    const seasonData = content.web_series?.seasons?.[0] || content.originalData?.web_series?.seasons?.[0];
    
    if (seasonData) {
      console.log('Processing web series season data:', seasonData);
      
      details.directors = Array.isArray(seasonData.director) ? seasonData.director : (seasonData.director ? [seasonData.director] : []);
      details.writers = Array.isArray(seasonData.writer) ? seasonData.writer : (seasonData.writer ? [seasonData.writer] : []);
      details.castMembers = Array.isArray(seasonData.cast_members) ? seasonData.cast_members : (seasonData.cast_members ? [seasonData.cast_members] : []);
      details.description = seasonData.season_description || '';
      details.year = seasonData.release_year?.toString() || '';
      details.rating = seasonData.rating_type || '';
      details.score = seasonData.rating?.toString() || '';
      details.image = seasonData.thumbnail_url || '';
      
      const episodes = seasonData.episodes || seasonData.episode_id_list || [];
      details.episodeCount = episodes.length ? `${episodes.length} Episode${episodes.length > 1 ? 's' : ''}` : null;
    }
  } else if (contentType === 'Show') {
    // For shows, access show data
    const showData = content.show || content.originalData?.show;
    
    if (showData) {
      console.log('Processing show data:', showData);
      
      details.directors = Array.isArray(showData.directors) ? showData.directors : (showData.directors ? [showData.directors] : []);
      details.writers = Array.isArray(showData.writers) ? showData.writers : (showData.writers ? [showData.writers] : []);
      details.castMembers = Array.isArray(showData.cast_members) ? showData.cast_members : (showData.cast_members ? [showData.cast_members] : []);
      details.description = showData.description || '';
      details.year = showData.release_year?.toString() || '';
      details.rating = showData.rating_type || '';
      details.score = showData.rating?.toString() || '';
      details.image = showData.thumbnail_url || '';
      
      const episodes = showData.episode_id_list || [];
      details.episodeCount = episodes.length ? `${episodes.length} Episode${episodes.length > 1 ? 's' : ''}` : null;
    }
  }

  console.log('Final content details:', details);
  return details;
};

export const getSeasonInfo = (content: ContentData) => {
  const contentType = content.content_type || content.originalData?.content_type || content.type;
  
  if (contentType === 'Web Series') {
    return content.seasonNumber ? `Season ${content.seasonNumber}` : 'Season 1';
  }
  
  return null;
};
