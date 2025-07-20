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

const WebSeries = () => {
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

  // Transform feature content to web series format (Web Series only)
  const transformToWebSeries = (featureContent: any[]) => {
    return (
      featureContent
        ?.filter((content) => content.content_type === "Web Series")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((content) => {
          const seasonData = content.web_series?.seasons?.[0];
          return {
            id: content.id, // Already includes season info
            content_id: content.content_id || content.web_series?.content_id,
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
            seasonNumber: content.seasonNumber || 1,
            videoUrl: seasonData?.episodes?.[0]?.video_url || "",
            originalData: content, // Include the full original data
            // Add essential fields for details page
            content_type: "Web Series",
            web_series: content.web_series,
            genre: content.genre
          };
        }) || []
    );
  };

  if (allContentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading web series...</div>
      </div>
    );
  }

  const webSeries = allContent?.webSeries || [];

  // Get hero content for web series (Type Hero feature) - now each entry is a separate season
  const heroWebSeries = transformToWebSeries(heroContent || []).slice(0, 5);

  // Filter web series from content (now each entry is already a separate season)
  const getWebSeriesFromContent = (genreContent: any[]) => {
    return (
      (genreContent || [])
        .filter((content) => content.content_type === "Web Series")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((content) => {
          const seasonData = content.web_series?.seasons?.[0];
          return {
            id: content.id, // Already includes season info
            content_id: content.content_id || content.web_series?.content_id,
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
            seasonNumber: content.seasonNumber || 1,
            originalData: content, // Include the full original data
          };
        }) || []
    );
  };

  const sections = [
    {
      title: "New Release",
      contents: transformToWebSeries(newReleases || []),
    },
    { title: "Popular", contents: transformToWebSeries(popular || []) },
    {
      title: "Action & Adventure",
      contents: getWebSeriesFromContent(actionContent || []),
    },
    { title: "Comedy", contents: getWebSeriesFromContent(comedyContent || []) },
    { title: "Crime", contents: getWebSeriesFromContent(crimeContent || []) },
    { title: "Drama", contents: getWebSeriesFromContent(dramaContent || []) },
    { title: "Horror", contents: getWebSeriesFromContent(horrorContent || []) },
    { title: "Family", contents: getWebSeriesFromContent(familyContent || []) },
    { title: "Thriller", contents: getWebSeriesFromContent(thrillerContent || []) },
    { title: "Sci-Fi", contents: getWebSeriesFromContent(sciFiContent || []) },
  ].filter(section => section.contents && section.contents.length > 0);

  const handleSeeMore = (title: string, contents: any[]) => {
    navigate("/see-more", { state: { title, contents } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSlider contents={heroWebSeries} />

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

export default WebSeries;