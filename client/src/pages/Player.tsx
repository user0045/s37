import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Play, Calendar, Clock } from 'lucide-react';

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const episodeId = searchParams.get('episode');
  const content = location.state || {};
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [currentSeasonDetails, setCurrentSeasonDetails] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);

  // Comprehensive debugging
  console.log('=== PLAYER DEBUG INFO ===');
  console.log('Location state:', location.state);
  console.log('Content object:', content);
  console.log('Episode ID from URL:', episodeId);
  console.log('Content.content_type:', content.content_type);
  console.log('========================');

  // Fetch episode details if episodeId is provided
  useEffect(() => {
    const fetchEpisodeDetails = async () => {
      if (episodeId) {
        setIsVideoLoading(true);
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: episodeData, error } = await supabase
            .from('episode')
            .select('*')
            .eq('episode_id', episodeId)
            .single();

          if (!error && episodeData) {
            setCurrentEpisode(episodeData);
          }
        } catch (err) {
          console.error('Error fetching episode details:', err);
        } finally {
          setIsVideoLoading(false);
        }
      } else {
        setIsVideoLoading(false);
      }
    };

    fetchEpisodeDetails();
    // Reset video error when episode changes
    setVideoError(false);
  }, [episodeId]);

  // Get season details for web series
  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (content.content_type === 'Web Series' && content.web_series?.season_id_list) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const seasonId = content.web_series.season_id_list[0]; // Default to first season

          if (seasonId) {
            const { data: seasonData, error } = await supabase
              .from('season')
              .select('*')
              .eq('season_id', seasonId)
              .single();

            if (!error && seasonData) {
              setCurrentSeasonDetails(seasonData);
            }
          }
        } catch (err) {
          console.error('Error fetching season details:', err);
        }
      }
    };

    fetchSeasonDetails();
  }, [content]);

  // Get the actual video URL based on content type
  const getVideoUrl = () => {
    console.log('Getting video URL for content:', content);
    console.log('Content type:', content.content_type);
    console.log('Current episode:', currentEpisode);

    // If we have an episode, try to get its video URL
    if (currentEpisode?.video_url) {
      console.log('Episode video URL found:', currentEpisode.video_url);
      return currentEpisode.video_url;
    }

    if (content.content_type === 'Movie' && content.movie?.video_url) {
      console.log('Movie video URL found:', content.movie.video_url);
      return content.movie.video_url;
    } else if (content.content_type === 'Web Series' && content.web_series?.seasons?.[0]?.episodes?.[0]?.video_url) {
      console.log('Web Series video URL found:', content.web_series.seasons[0].episodes[0].video_url);
      return content.web_series.seasons[0].episodes[0].video_url;
    } else if (content.content_type === 'Show' && content.show?.episode_id_list?.length > 0) {
      const showVideoUrl = content.videoUrl || content.video_url;
      console.log('Show video URL found:', showVideoUrl);
      return showVideoUrl;
    }

    // Fallback to any video URL in the content object
    const fallbackUrl = content.videoUrl || content.video_url || content.movie?.video_url;
    console.log('Using fallback video URL:', fallbackUrl);
    return fallbackUrl || '';
  };

  const videoUrl = getVideoUrl();

  console.log('Final video URL for player:', videoUrl, 'for content type:', content.content_type);

  // Convert video page URLs to embed URLs
  const getEmbedUrl = (url) => {
    console.log('Converting URL to embed format:', url);

    // Bitchute
    if (url.includes('bitchute.com/video/')) {
      const videoId = url.split('/video/')[1];
      return `https://www.bitchute.com/embed/${videoId}?disable_download=1&hide_share=1`;
    }

    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // Vimeo
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Dailymotion
    if (url.includes('dailymotion.com/video/')) {
      const videoId = url.split('/video/')[1];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Return original URL if no conversion needed
    return url;
  };

  // Handle video end - restart video and refresh content
  const handleVideoEnd = () => {
    console.log('Video ended, restarting video...');
    // For iframe videos, we can't directly control restart, so we'll refresh the iframe src
    const videoContainer = document.querySelector('.custom-video-container iframe');
    if (videoContainer) {
      const currentSrc = videoContainer.getAttribute('src');
      videoContainer.src = '';
      setTimeout(() => {
        videoContainer.src = currentSrc;
      }, 100);
    }

    // Reset video error state to ensure clean restart
    setVideoError(false);
  };

  // Handle video restart for regular video elements
  const handleVideoRestart = (videoElement) => {
    if (videoElement) {
      videoElement.currentTime = 0;
      videoElement.play().catch((error) => {
        console.warn('Video restart failed:', error);
      });
    }
  };

  // Auto-restart functionality for Bitchute and other iframe videos
  React.useEffect(() => {
    if (videoUrl && (videoUrl.includes('bitchute.com') || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com'))) {
      const interval = setInterval(() => {
        // Check if we need to restart the video (this is a workaround since we can't detect iframe video end)
        handleVideoEnd();
      }, 60000); // Restart every 60 seconds for continuous playback

      return () => clearInterval(interval);
    }
  }, [videoUrl]);

  const getContentTypeDisplay = () => {
    switch (content.content_type) {
      case 'Movie': return 'Movie';
      case 'Web Series': return 'Web Series';
      case 'Show': return 'TV Show';
      default: 
        // Fallback for legacy data
        if (content.type === 'series') return 'Web Series';
        if (content.type === 'show') return 'TV Show';
        return content.content_type || content.type || 'Content';
    }
  };

  // Get episode number for web series and shows
  const getEpisodeInfo = () => {
    if (currentEpisode) {
      // Try to extract episode number from title or use a default
      const episodeMatch = currentEpisode.title?.match(/episode\s*(\d+)/i);
      if (episodeMatch) {
        return `Episode ${episodeMatch[1]}`;
      }
      // Fallback: use episode order if available
      return `Episode ${currentEpisode.episode_number || '1'}`;
    }
    return null;
  };

  // Get season number for web series
  const getSeasonInfo = () => {
    if (content.content_type === 'Web Series') {
      if (currentSeasonDetails?.season_number) {
        return `Season ${currentSeasonDetails.season_number}`;
      } else if (content.seasonNumber) {
        return `Season ${content.seasonNumber}`;
      }
      return 'Season 1'; // Default fallback
    }
    return null;
  };

  // Get duration - prioritize episode duration
  const getDuration = () => {
    if (currentEpisode?.duration) {
      return `${currentEpisode.duration} min`;
    }
    if (content.content_type === 'Movie' && content.movie?.duration) {
      return `${content.movie.duration} min`;
    }
    return null;
  };

  // Get description - prioritize episode description
  const getDescription = () => {
    if (currentEpisode?.description) {
      return currentEpisode.description;
    }
    if (content.content_type === 'Movie' && content.movie?.description) {
      return content.movie.description;
    } else if (content.content_type === 'Web Series' && currentSeasonDetails?.season_description) {
      return currentSeasonDetails.season_description;
    } else if (content.content_type === 'Show' && content.show?.description) {
      return content.show.description;
    }
    return content.description || 'No description available';
  };

  // Get rating information
  const getRatingInfo = () => {
    if (content.content_type === 'Movie' && content.movie) {
      return {
        rating_type: content.movie.rating_type,
        rating: content.movie.rating,
        release_year: content.movie.release_year
      };
    } else if (content.content_type === 'Web Series' && currentSeasonDetails) {
      return {
        rating_type: currentSeasonDetails.rating_type,
        rating: currentSeasonDetails.rating,
        release_year: currentSeasonDetails.release_year
      };
    } else if (content.content_type === 'Show' && content.show) {
      return {
        rating_type: content.show.rating_type,
        rating: content.show.rating,
        release_year: content.show.release_year
      };
    }
    return {
      rating_type: content.rating_type || content.rating || 'Not Rated',
      rating: content.score || content.rating || 0,
      release_year: content.year || content.release_year || new Date().getFullYear()
    };
  };

  const ratingInfo = getRatingInfo();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-[#0A7D4B]/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Main Content Layout */}
          <div className="space-y-8">
            {/* Video Player Section */}
            <Card className="bg-gradient-to-br from-black/90 via-[#0A7D4B]/20 to-black/90 backdrop-blur-sm border border-border/50 wave-transition relative overflow-hidden">
              {/* Animated Background Waves */}
              <div className="absolute inset-0">
                <div className="player-wave-bg-1"></div>
                <div className="player-wave-bg-2"></div>
                <div className="player-wave-bg-3"></div>
              </div>

              <CardContent className="p-8 relative z-10">
                {/* Video Player */}
                <div className="w-full max-w-4xl mx-auto mb-8">
                  <div className="aspect-video bg-gradient-to-br from-black/95 via-[#0A7D4B]/10 to-black/95 rounded-xl relative border border-primary/20 shadow-2xl overflow-hidden custom-video-container">
                    {isVideoLoading ? (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-black/95 via-[#0A7D4B]/10 to-black/95 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30 animate-pulse">
                            <Play className="w-8 h-8 text-primary fill-current animate-spin" />
                          </div>
                          <div className="text-primary text-xl font-semibold mb-2 animate-pulse">
                            Loading Content...
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Please wait while we prepare your video
                          </p>
                        </div>
                      </div>
                    ) : videoUrl && !videoError ? (
                      <div className="relative w-full h-full">
                        {/* Check if URL is from external video platforms */}
                        {videoUrl.includes('bitchute.com') || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com') || videoUrl.includes('dailymotion.com') ? (
                          <iframe
                            className="w-full h-full rounded-xl"
                            src={`${getEmbedUrl(videoUrl)}${videoUrl.includes('youtube.com') ? '&autoplay=1&loop=1&playlist=' + videoUrl.split('v=')[1]?.split('&')[0] : ''}${videoUrl.includes('vimeo.com') ? '&autoplay=1&loop=1' : ''}${videoUrl.includes('bitchute.com') ? '&autoplay=1' : ''}`}
                            title="Video Player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => setIsVideoLoading(false)}
                            onError={() => {
                              setVideoError(true);
                              setIsVideoLoading(false);
                            }}
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                              outline: 'none',
                              transition: 'opacity 0.3s ease'
                            }}
                          />
                        ) : (
                          <video
                            className="w-full h-full rounded-xl object-cover custom-video-player"
                            controls
                            poster={content.image || content.thumbnail_url || content.movie?.thumbnail_url}
                            preload="metadata"
                            onLoadStart={() => setIsVideoLoading(true)}
                            onCanPlay={() => setIsVideoLoading(false)}
                            onError={() => {
                              setVideoError(true);
                              setIsVideoLoading(false);
                            }}
                            onEnded={handleVideoEnd}
                            style={{
                              filter: 'contrast(1.1) brightness(1.05)',
                              outline: 'none',
                              transition: 'opacity 0.3s ease'
                            }}
                          >
                            <source src={videoUrl} type="video/mp4" />
                            <source src={videoUrl} type="video/webm" />
                            <source src={videoUrl} type="video/ogg" />
                            Your browser does not support the video tag.
                          </video>
                        )}

                        {/* Subtle theme-integrated borders */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 pointer-events-none"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-black/95 via-[#0A7D4B]/10 to-black/95 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
                            <Play className="w-8 h-8 text-primary fill-current" />
                          </div>
                          <div className="text-primary text-xl font-semibold mb-2">
                            {videoError ? "Unable to Play Content" : "⚠️ Video Not Available"}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {videoError ? "The video could not be loaded or played" : "No video URL found for this content"}
                          </p>
                          {!videoError && (
                            <p className="text-xs text-muted-foreground/70 mt-2">
                              Content Type: {getContentTypeDisplay()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Information */}
                <div className="max-w-4xl mx-auto space-y-4">
                  {/* Title and Season/Episode Info */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-3xl font-bold text-foreground">
                      {content.content_type === 'Web Series' ? content.title : 
                       content.content_type === 'Show' ? content.show?.title || content.title :
                       currentEpisode?.title || content.title}
                    </h1>
                    <div className="flex items-center space-x-3">
                      {content.content_type === 'Web Series' && getSeasonInfo() && (
                        <span className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-3 py-1 rounded-md border border-blue-500/30 text-sm font-medium">
                          {getSeasonInfo()}
                        </span>
                      )}
                      {(content.content_type === 'Web Series' || content.content_type === 'Show') && getEpisodeInfo() && (
                        <span className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 px-3 py-1 rounded-md border border-purple-500/30 text-sm font-medium">
                          {getEpisodeInfo()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating and Year Info */}
                  <div className="flex items-center space-x-4 flex-wrap">
                    {ratingInfo.rating_type && (
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-md border border-primary/30 text-sm font-medium">
                        {ratingInfo.rating_type}
                      </span>
                    )}
                    {ratingInfo.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-foreground text-sm font-medium">
                          {ratingInfo.rating}
                        </span>
                      </div>
                    )}
                    {ratingInfo.release_year && (
                      <span className="text-muted-foreground text-sm font-medium">
                        {ratingInfo.release_year}
                      </span>
                    )}
                    {getDuration() && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground text-sm font-medium">
                          {getDuration()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">Description</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {getDescription()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertisement Section */}
            <div className="w-full">
              <Card className="bg-gradient-to-br from-black/40 via-[#0A7D4B]/10 to-black/40 backdrop-blur-sm border border-border/30 min-h-[200px]">
                <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="text-muted-foreground/50 text-xl mb-2">Advertisement Space</div>
                    <div className="text-muted-foreground/30 text-sm">Full Width Banner</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;