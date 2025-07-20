
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl: string;
  title: string;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, trailerUrl, title }) => {
  const [hasError, setHasError] = useState(false);

  // Function to extract video ID from various video URL formats
  const getEmbedUrl = (url: string) => {
    if (!url) return '';

    // YouTube URLs
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0` : '';
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&rel=0` : '';
    }
    
    // Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=0` : '';
    }

    // Dailymotion URLs
    if (url.includes('dailymotion.com/video/')) {
      const videoId = url.split('dailymotion.com/video/')[1]?.split('?')[0];
      return videoId ? `https://www.dailymotion.com/embed/video/${videoId}?autoplay=0` : '';
    }

    // If it's already an embed URL or direct video URL, use it as is
    if (url.includes('embed') || url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) {
      return url;
    }

    // For other URLs, return empty string to show "not available" message
    return '';
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  const handleIframeError = () => {
    setHasError(true);
  };

  const handleVideoError = () => {
    setHasError(true);
  };

  const resetError = () => {
    setHasError(false);
  };

  // Reset error when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetError();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-gradient-to-br from-black/95 via-[#0A7D4B]/20 to-black/95 backdrop-blur-sm border border-border/50 p-6">
        <div className="space-y-4">
          <h2 className="text-foreground text-xl font-semibold">
            {title} - Trailer
          </h2>
          
          <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
            {embedUrl && !hasError ? (
              embedUrl.includes('.mp4') || embedUrl.includes('.webm') || embedUrl.includes('.ogg') ? (
                // For direct video files
                <video
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  controls
                  src={embedUrl}
                  onError={handleVideoError}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                // For embedded videos (YouTube, Vimeo, etc.)
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={embedUrl}
                  title={`${title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={handleIframeError}
                ></iframe>
              )
            ) : (
              // Show message when no valid URL is available or error occurred
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-black/80 via-[#0A7D4B]/10 to-black/80 rounded-lg border border-border/30">
                <div className="text-center">
                  <div className="text-6xl mb-4 text-primary/30">🎬</div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Currently Trailer Is Not Available</h3>
                  <p className="text-muted-foreground">Please check back later for the trailer.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;
