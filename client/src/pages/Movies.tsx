import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import HorizontalSection from "@/components/HorizontalSection";
import Footer from "@/components/Footer";
import {
  useAllContent,
  useContentByFeature,
  useContentByGenre,
} from "@/hooks/useContentQueries";

const Movies = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const { data: allContent, isLoading: allContentLoading } = useAllContent();
  const { data: heroContent } = useContentByFeature("Type Hero");
  const { data: newReleases } = useContentByFeature("Type New Release");
  const { data: popular } = useContentByFeature("Type Popular");
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
        <div className="text-foreground">Loading movies...</div>
      </div>
    );
  }

  const movies = allContent?.movies || [];

  // Filter movies for hero content (top 5 newest movies sorted by created_at)
  const heroMovies =
    movies
      ?.filter((content) => content.content_type === "Movie")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 5)
      .map((content) => ({
        id: content.id,
        title: content.title,
        description: content.movie?.description || content.description,
        rating: content.movie?.rating_type || "R",
        year:
          content.movie?.release_year?.toString() ||
          content.created_at?.split("-")[0],
        score: content.movie?.rating?.toString() || "8.0",
        image: content.movie?.thumbnail_url || "",
        videoUrl: content.movie?.video_url,
        type: "movie",
        // Include all original data for MoreInfo page
        originalData: content,
        content_type: content.content_type,
        genre: content.genre,
        content_id: content.content_id,
        movie: content.movie,
        created_at: content.created_at,
        updated_at: content.updated_at
      })) || [];

  // Filter movies for sections
  const getMoviesByFeature = (featureType: string) => {
    return (
      movies
        ?.filter((content) => {
          return (
            content.content_type === "Movie" &&
            content.movie?.feature_in?.includes(featureType)
          );
        })
        .map((content) => ({
          id: content.id,
          title: content.title,
          rating: content.movie?.rating_type || "R",
          score: content.movie?.rating?.toString() || "8.0",
          image: content.movie?.thumbnail_url || "",
          year:
            content.movie?.release_year?.toString() ||
            content.created_at?.split("-")[0],
          description: content.movie?.description || content.description,
          type: "movie",
          // Include all original data for MoreInfo page
          originalData: content,
          content_type: content.content_type,
          genre: content.genre,
          content_id: content.content_id,
          movie: content.movie,
          created_at: content.created_at,
          updated_at: content.updated_at
        })) || []
    );
  };

  // Transform movies for display (Movies only)
  const getMoviesFromContent = (genreContent: any[] | undefined) => {
    if (!genreContent) return [];

    return (
      genreContent
        .filter((content) => content.content_type === "Movie")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((content) => ({
          id: content.content_id || content.id,
          title: content.title,
          rating: content.movie?.rating_type || "R",
          score: content.movie?.rating?.toString() || "8.0",
          image: content.movie?.thumbnail_url || "",
          year:
            content.movie?.release_year?.toString() ||
            content.created_at?.split("-")[0],
          description: content.movie?.description || content.description,
          type: "movie",
          // Include all original data for MoreInfo page
          originalData: content,
          content_type: content.content_type,
          genre: content.genre,
          content_id: content.content_id,
          movie: content.movie,
          created_at: content.created_at,
          updated_at: content.updated_at
        })) || []
    );
  };

  const transformToMovies = (contentList: any[] | undefined) => {
    if (!contentList) return [];

    return contentList
      .filter((content) => content.content_type === "Movie")
      .map((content) => ({
        id: content.id,
        title: content.title,
        rating: content.movie?.rating_type || "R",
        score: content.movie?.rating?.toString() || "8.0",
        image: content.movie?.thumbnail_url || "",
        year: content.movie?.release_year?.toString() || content.created_at?.split("-")[0],
        description: content.movie?.description || content.description,
        type: "movie",
        originalData: content,
        content_type: content.content_type,
        genre: content.genre,
        content_id: content.content_id,
        movie: content.movie,
        created_at: content.created_at,
        updated_at: content.updated_at
      }));
  };

  const sections = [
    {
      title: "New Release",
      contents: transformToMovies(newReleases || []),
    },
    { title: "Popular", contents: transformToMovies(popular || []) },
    {
      title: "Action & Adventure",
      contents: getMoviesFromContent(actionContent || []),
    },
    { title: "Comedy", contents: getMoviesFromContent(comedyContent || []) },
    { title: "Crime", contents: getMoviesFromContent(crimeContent || []) },
    { title: "Drama", contents: getMoviesFromContent(dramaContent || []) },
    { title: "Horror", contents: getMoviesFromContent(horrorContent || []) },
    { title: "Family", contents: getMoviesFromContent(familyContent || []) },
    { title: "Thriller", contents: getMoviesFromContent(thrillerContent || []) },
    { title: "Sci-Fi", contents: getMoviesFromContent(sciFiContent || []) },
  ].filter(section => section.contents && section.contents.length > 0);

  const handleSeeMore = (title: string, contents: any[]) => {
    navigate("/see-more", { state: { title, contents } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlider contents={heroMovies} />

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

export default Movies;