import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import HeroSlider from '@/components/HeroSlider';
import HorizontalSection from '@/components/HorizontalSection';
import Footer from '@/components/Footer';
import { useAllContent, useContentByFeature, useContentByGenre } from '@/hooks/useContentQueries';
import { Loader2 } from 'lucide-react';

const TvShows = () => {
  const navigate = useNavigate();
  
  // Fetch all content
  const { data: allContent, isLoading: isLoadingAll } = useAllContent();

  // Fetch content by features for shows
  const { data: heroContent } = useContentByFeature('Type Hero');
  const { data: newReleaseContent } = useContentByFeature('Type New Release');
  const { data: popularContent } = useContentByFeature('Type Popular');
  const { data: entertainmentContent } = useContentByFeature('Entertainment');
  const { data: fictionalContent } = useContentByFeature('Fictional');

  // Fetch content by genre
  const { data: dramaContent } = useContentByGenre('Drama');

  const isLoading = isLoadingAll;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2 text-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading shows...</span>
        </div>
      </div>
    );
  }

  // Transform show content for display
  const transformShowContent = (content: any) => {
    return {
      id: content.id,
      content_id: content.content_id || content.show?.content_id || content.show?.id,
      title: content.title || content.show?.title,
      rating: content.show?.rating_type || 'TV-PG',
      score: content.show?.rating?.toString() || '8.0',
      image: content.show?.thumbnail_url || '',
      year: content.show?.release_year?.toString() || content.created_at?.split('-')[0],
      description: content.show?.description || content.description,
      type: 'show',
      videoUrl: content.show?.trailer_url,
      originalData: content,
      // Add essential fields for details page
      content_type: 'Show',
      show: content.show,
      genre: content.genre
    };
  };

  // Get shows from all content with specific feature
  const getShowsByFeature = (feature: string) => {
    if (!allContent?.shows) return [];

    return allContent.shows
      .filter(content => 
        content.content_type === 'Show' && 
        content.show?.feature_in?.includes(feature)
      )
      .map(transformShowContent);
  };

  const transformToShows = (contentArray: any[] | undefined) => {
    if (!contentArray) return [];
    return contentArray
      .filter(content => content.content_type === 'Show')
      .map(transformShowContent);
  };
  
  const getShowsFromContent = (contentArray: any[] | undefined) => {
    if (!contentArray) return [];

    return contentArray
      .filter(content => content.content_type === 'Show')
      .map(transformShowContent);
  };
  

  // Get shows for hero - using Type Hero feature from all content
  const heroShows = getShowsByFeature('Type Hero').slice(0, 5);

  // Get shows from specific content arrays (for drama section)


  const sections = [
    {
      title: "New Release",
      contents: transformToShows(newReleaseContent || []),
    },
    { title: "Popular", contents: transformToShows(popularContent || []) },
    {
      title: "Entertainment", 
      contents: getShowsFromContent(entertainmentContent || []),
    },
    { title: "Drama", contents: getShowsFromContent(dramaContent || []) },
    { title: "Fictional", contents: getShowsFromContent(fictionalContent || []) },
  ].filter(section => section.contents && section.contents.length > 0);

  console.log('Show page data:', {
    allContent: allContent?.shows?.length || 0,
    heroShows: heroShows.length,
    sections: sections.map(s => ({ title: s.title, count: s.contents.length }))
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <div className="w-full">
        {heroShows.length > 0 && (
          <HeroSlider contents={heroShows} />
        )}
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-6 py-8 space-y-8 min-h-[80vh]">
        {sections.map((section, index) => (
          section.contents.length > 0 && (
            <HorizontalSection
              key={index}
              title={section.title}
              contents={section.contents}
              onSeeMore={() => {
                navigate("/see-more", { 
                  state: { 
                    title: `${section.title} Shows`, 
                    contents: section.contents 
                  } 
                });
              }}
            />
          )
        ))}

        {sections.every(section => section.contents.length === 0) && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Shows Available</h2>
            <p className="text-muted-foreground">Check back later for new show content.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TvShows;