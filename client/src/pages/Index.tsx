import React from 'react';
import Header from '@/components/Header';
import HomeHero from '@/components/HomeHero';
import HorizontalSection from '@/components/HorizontalSection';
import Footer from '@/components/Footer';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  useAllContent,
  useContentByFeature,
  useContentByGenre,
} from "@/hooks/useContentQueries";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: allContent, isLoading: allContentLoading } = useAllContent();
  const { data: heroContent } = useContentByFeature("Home Hero");
  const { data: newReleases } = useContentByFeature("Home New Release");
  const { data: popular } = useContentByFeature("Home Popular");
  const { data: actionContent } = useContentByGenre("Action & Adventure");
  const { data: comedyContent } = useContentByGenre("Comedy");
  const { data: crimeContent } = useContentByGenre("Crime");
  const { data: dramaContent } = useContentByGenre("Drama");
  const { data: horrorContent } = useContentByGenre("Horror");
  const { data: familyContent } = useContentByGenre("Family");
  const { data: thrillerContent } = useContentByGenre("Thriller");
  const { data: sciFiContent } = useContentByGenre("Sci-Fi");

  if (allContentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading content...</div>
      </div>
    );
  }

  // Transform content for display
  const transformContentForDisplay = (
    content: any[],
    type: "movie" | "webseries",
  ) => {
    return content
      .map((item) => {
        if (type === "movie" && item.movie) {
          return {
            id: item.content_id || item.id,
            title: item.title,
            rating: item.movie.rating_type || "R",
            score: item.movie.rating?.toString() || "8.0",
            image: item.movie.thumbnail_url || "",
            year:
              item.movie.release_year?.toString() ||
              item.created_at?.split("-")[0],
            description: item.movie.description || "",
            type: "movie",
          };
        } else if (type === "webseries" && item.web_series) {
          return {
            id: item.content_id || item.id,
            title: item.title,
            rating: item.web_series.seasons?.[0]?.rating_type || "TV-PG",
            score: item.web_series.seasons?.[0]?.rating?.toString() || "8.0",
            image: item.web_series.seasons?.[0]?.thumbnail_url || "",
            year:
              item.web_series.seasons?.[0]?.release_year?.toString() ||
              item.created_at?.split("-")[0],
            description: item.web_series.seasons?.[0]?.season_description || "",
            type: "webseries",
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Transform genre content for display (mixed movies and web series)
  const getContentFromGenre = (genreContent: any[] | undefined) => {
    if (!genreContent) return [];

    // Sort by created_at date (newest first) before transforming
    const sortedContent = genreContent.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return sortedContent
      .map((content) => {
        if (content.content_type === "Movie" && content.movie) {
          return {
            id: content.content_id || content.id,
            title: content.title,
            rating: content.movie.rating_type || "R",
            score: content.movie.rating?.toString() || "8.0",
            image: content.movie.thumbnail_url || "",
            year:
              content.movie.release_year?.toString() ||
              content.created_at?.split("-")[0],
            description: content.movie.description || "",
            type: "movie",
          };
        } else if (
          content.content_type === "Web Series" &&
          content.web_series
        ) {
          return {
            id: content.content_id || content.id,
            title: content.title,
            rating: content.web_series.seasons?.[0]?.rating_type || "TV-PG",
            score: content.web_series.seasons?.[0]?.rating?.toString() || "8.0",
            image: content.web_series.seasons?.[0]?.thumbnail_url || "",
            year:
              content.web_series.seasons?.[0]?.release_year?.toString() ||
              content.created_at?.split("-")[0],
            description:
              content.web_series.seasons?.[0]?.season_description || "",
            type: "webseries",
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  // Transform database content to display format
  const transformContent = (contentArray: any[]) => {
    const transformedContent = [];

    // Sort content by created_at date (newest first) before processing
    const sortedContent =
      contentArray?.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ) || [];

    sortedContent.forEach((content) => {
      if (content.content_type === "Movie") {
        transformedContent.push({
          id: content.id,
          content_id: content.content_id,
          title: content.title,
          rating: content.movie?.rating_type || "PG-13",
          score: content.movie?.rating?.toString() || "8.0",
          image: content.movie?.thumbnail_url || "",
          year:
            content.movie?.release_year?.toString() ||
            content.created_at?.split("-")[0],
          description: content.movie?.description || content.description,
          type: "movie",
          content_type: content.content_type,
          genre: content.genre,
          movie: content.movie,
          originalData: content,
        });
      } else if (content.content_type === "Web Series") {
        // If content already has seasonNumber (pre-transformed from queries), use it directly
        if (content.seasonNumber && content.web_series?.seasons) {
          const seasonData = content.web_series.seasons[0]; // Already filtered to single season
          transformedContent.push({
            id: content.id, // Already includes season info
            content_id: content.content_id,
            title: content.title,
            rating: seasonData?.rating_type || "TV-MA",
            score: seasonData?.rating?.toString() || "8.0",
            image: seasonData?.thumbnail_url || "",
            year:
              seasonData?.release_year?.toString() ||
              content.created_at?.split("-")[0],
            description:
              seasonData?.season_description ||
              content.description,
            type: "series",
            seasonNumber: content.seasonNumber,
            content_type: content.content_type,
            genre: content.genre,
            web_series: content.web_series,
            originalData: content,
          });
        } else if (content.web_series?.seasons) {
          // Fallback: Create a card for each season (for any content not pre-transformed)
          content.web_series.seasons.forEach((season: any, index: number) => {
            transformedContent.push({
              id: `${content.id}-season-${index + 1}`,
              content_id: content.content_id,
              title: content.title,
              rating: season.rating_type || "TV-MA",
              score: season.rating?.toString() || "8.0",
              image: season.thumbnail_url || "",
              year:
                season.release_year?.toString() ||
                content.created_at?.split("-")[0],
              description:
                season.season_description ||
                content.web_series?.description ||
                content.description,
              type: "series",
              seasonNumber: index + 1,
              content_type: content.content_type,
              genre: content.genre,
              web_series: content.web_series,
              originalData: content,
            });
          });
        }
      } else if (content.content_type === "Show") {
        transformedContent.push({
          id: content.id,
          content_id: content.content_id,
          title: content.title,
          rating: content.show?.rating_type || "TV-PG",
          score: content.show?.rating?.toString() || "8.0",
          image: content.show?.thumbnail_url || "",
          year:
            content.show?.release_year?.toString() ||
            content.created_at?.split("-")[0],
          description: content.show?.description || content.description,
          type: "show",
          content_type: content.content_type,
          genre: content.genre,
          show: content.show,
          originalData: content,
        });
      }
    });

    return transformedContent;
  };

  // Filter content for home page based on features (Movies and Web Series only)
  const filterHomeContentByFeature = (
    contentArray: any[],
    featureType: string,
  ) => {
    return (
      contentArray?.filter((content) => {
        if (content.content_type === "Movie") {
          return content.movie?.feature_in?.includes(featureType);
        } else if (content.content_type === "Web Series") {
          return content.web_series?.seasons?.some((season) =>
            season.feature_in?.includes(featureType),
          );
        }
        return false;
      }) || []
    );
  };

  // Filter content for home page by genre (Movies and Web Series only)
  const filterHomeContentByGenre = (contentArray: any[]) => {
    return (
      contentArray?.filter(
        (content) =>
          content.content_type === "Movie" ||
          content.content_type === "Web Series",
      ) || []
    );
  };

  // Get latest content for hero (newest content with "Home Hero" feature)
  const getLatestHeroContent = () => {
    const heroContentArray =
      heroContent
        ?.filter((content) => {
          if (content.content_type === "Movie") {
            return content.movie?.feature_in?.includes("Home Hero");
          } else if (content.content_type === "Web Series") {
            return content.web_series?.seasons?.some((season) =>
              season.feature_in?.includes("Home Hero"),
            );
          }
          return false;
        })
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ) || [];

    return heroContentArray.length > 0 ? [heroContentArray[0]] : [];
  };

  const sections = [
    {
      title: "New Release",
      contents: transformContent(
        filterHomeContentByFeature(
          allContent
            ? [...(allContent.movies || []), ...(allContent.webSeries || [])]
            : [],
          "Home New Release",
        ),
      ),
    },
    {
      title: "Popular",
      contents: transformContent(
        filterHomeContentByFeature(
          allContent
            ? [...(allContent.movies || []), ...(allContent.webSeries || [])]
            : [],
          "Home Popular",
        ),
      ),
    },
    {
      title: "Action & Adventure",
      contents: transformContent(filterHomeContentByGenre(actionContent)),
    },
    {
      title: "Comedy",
      contents: transformContent(filterHomeContentByGenre(comedyContent)),
    },
    {
      title: "Crime",
      contents: transformContent(filterHomeContentByGenre(crimeContent)),
    },
    {
      title: "Drama",
      contents: transformContent(filterHomeContentByGenre(dramaContent)),
    },
    {
      title: "Horror",
      contents: transformContent(filterHomeContentByGenre(horrorContent)),
    },
    {
      title: "Family",
      contents: transformContent(filterHomeContentByGenre(familyContent)),
    },
    {
      title: "Thriller",
      contents: transformContent(filterHomeContentByGenre(thrillerContent)),
    },
    {
      title: "Sci-Fi",
      contents: transformContent(filterHomeContentByGenre(sciFiContent)),
    },
  ].filter(section => section.contents && section.contents.length > 0);

  const handleSeeMore = (title: string, contents: any[]) => {
    navigate("/see-more", { state: { title, contents } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HomeHero content={transformContent(getLatestHeroContent())} />

      <div className="container mx-auto px-6 py-8 space-y-8 min-h-[80vh]">
        {sections.map((section) => (
          <HorizontalSection
            key={section.title}
            title={section.title}
            contents={section.contents}
            onSeeMore={() => handleSeeMore(section.title, section.contents)}
          />
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default Index;