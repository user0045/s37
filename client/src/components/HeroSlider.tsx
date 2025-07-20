import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Content {
  id: string | number;
  title: string;
  rating: string;
  score: string;
  image: string;
  year: string;
  description: string;
  type?: string;
  seasonNumber?: number;
  videoUrl?: string;
  content_id?: string;
  originalData?: any;
}

interface HeroSliderProps {
  contents: Content[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ contents }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);
  const [isInfoCardHovered, setIsInfoCardHovered] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (contents.length === 0) return;

    const interval = setInterval(() => {
      if (!isInfoCardHovered) {
        setCurrentSlide((prev) => (prev + 1) % contents.length);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [contents.length, isInfoCardHovered]);

  useEffect(() => {
    setShowLeftArrow(currentSlide > 0);
    setShowRightArrow(currentSlide < contents.length - 1);
  }, [currentSlide, contents.length]);

  const handleVideoPlay = (video: HTMLVideoElement) => {
    if (video && video.isConnected) {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Auto-play prevented:', error);
          });
        }
      } catch (error) {
        console.warn('Video play error:', error);
      }
    }
  };

  const handleSliderMouseEnter = () => {
    setHoveredSlide(currentSlide);
  };

  const handleSliderMouseLeave = () => {
    setHoveredSlide(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Improved hover detection with debounce to prevent image blinking
    if (containerRef.current && infoCardRef.current) {
      const infoCardRect = infoCardRef.current.getBoundingClientRect();
      
      // Check if cursor is over the info card area with some padding
      const padding = 20; // Add padding to prevent edge cases
      const isOverInfoCard = (
        e.clientX >= (infoCardRect.left - padding) &&
        e.clientX <= (infoCardRect.right + padding) &&
        e.clientY >= (infoCardRect.top - padding) &&
        e.clientY <= (infoCardRect.bottom + padding)
      );
      
      // Only set hover if not over info card area
      if (!isOverInfoCard) {
        setHoveredSlide(currentSlide);
      } else {
        // If over info card, ensure hover is cleared to show thumbnail
        setHoveredSlide(null);
      }
    }
  };

  const handleInfoCardMouseEnter = () => {
    setIsInfoCardHovered(true);
  };

  const handleInfoCardMouseLeave = () => {
    setIsInfoCardHovered(false);
  };

  const nextSlide = () => {
    if (currentSlide < contents.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handlePlayClick = () => {
    const content = contents[currentSlide];
    if (!content) return;

    const fullContentData = content.originalData || {
      ...content,
      content_id: content.content_id || content.id
    };

    console.log('HeroSlider navigating to details with full data:', fullContentData);
    const navigationId = content.content_id || content.id;
    navigate(`/details/${navigationId}`, { state: fullContentData });
  };

  if (!contents || contents.length === 0) {
    return <div className="h-[50vh] bg-background"></div>;
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden flex items-center cursor-pointer mx-auto rounded-xl"
      style={{ 
        width: '95vw', 
        height: '38vw', 
        minHeight: '38vw',
        marginTop: '0',
        marginBottom: '4vw'
      }}
      
      onClick={handlePlayClick}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {contents.map((content, index) => (
          <div
            key={content.id}
            className={`absolute inset-0 transition-all duration-700 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={content.image}
              alt={content.title}
              className="w-full h-full object-cover"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block'
              }}
            />

            {/* Vintage Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at center, transparent 20%, rgba(0, 0, 0, 0.3) 80%)',
                backdropFilter: 'sepia(0.2) contrast(1.2)'
              }}
            />

            <div className="absolute inset-0 flex items-center justify-start">
              <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center min-h-full">
                <div 
                  ref={infoCardRef}
                  className={`w-full max-w-[281px] sm:max-w-[374px] md:max-w-[450px] lg:max-w-[524px] xl:max-w-[599px] 2xl:max-w-[749px] backdrop-blur-sm rounded-lg transition-all duration-700 ease-out pointer-events-auto cursor-pointer border border-primary/30 shadow-lg shadow-primary/20 ${
                    isInfoCardHovered 
                      ? 'transform scale-100 opacity-100 bg-black/30 backdrop-blur-md border-primary/50 p-1.5 sm:p-2.5 md:p-3 lg:p-4 xl:p-5 2xl:p-6' 
                      : 'transform scale-85 sm:scale-90 md:scale-95 opacity-50 bg-black/20 border-primary/20 p-1 sm:p-1.5 md:p-2.5 lg:p-3 xl:p-4'
                  }`}
                  onMouseEnter={handleInfoCardMouseEnter}
                  onMouseLeave={handleInfoCardMouseLeave}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayClick();
                  }}
                >
                  <h1 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-thin mb-2 text-foreground animate-fade-in line-clamp-2">
                    {content.title}
                  </h1>

                  <div className="flex items-center flex-wrap gap-1 sm:gap-1.5 mb-1.5 text-xs sm:text-xs text-muted-foreground animate-slide-up">
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 text-xs">
                      {content.rating}
                    </span>
                    {content.type === 'series' && content.seasonNumber && (
                      <span className="px-1.5 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#009C5B' }}>
                        Season {content.seasonNumber}
                      </span>
                    )}
                    <span className="font-thin text-xs">{content.year}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="font-thin text-xs">{content.score}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm md:text-base font-thin text-foreground/90 mb-3 sm:mb-4 leading-relaxed animate-slide-up line-clamp-1 truncate">
                    {content.description}
                  </p>

                  <div className="flex justify-start animate-scale-in">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayClick();
                      }}
                      className="bg-transparent backdrop-blur-sm border border-primary/60 text-primary hover:bg-primary hover:text-white hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 font-semibold text-xs sm:text-xs md:text-sm lg:text-base px-2 sm:px-2.5 md:px-4 lg:px-5 py-1 sm:py-2 min-w-[64px] sm:min-w-[76px] md:min-w-[88px] lg:min-w-[104px] rounded-lg shadow-lg group"
                    >
                      <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-300 fill-current" />
                      Play Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          className="absolute left-1 sm:left-2 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 p-1 sm:p-2 md:p-3 lg:p-4 border border-primary/30 rounded-full hover:bg-primary/30 hover:border-primary/60 hover:scale-110 transition-all duration-300 text-primary bg-black/40 backdrop-blur-sm z-20"
        >
          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 stroke-2" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          className="absolute right-1 sm:right-2 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 p-1 sm:p-2 md:p-3 lg:p-4 border border-primary/30 rounded-full hover:bg-primary/30 hover:border-primary/60 hover:scale-110 transition-all duration-300 text-primary bg-black/40 backdrop-blur-sm z-20"
        >
          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 stroke-2" />
        </button>
      )}

      {/* Slide Indicators */}
      <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 flex space-x-1 sm:space-x-2 md:space-x-3 bg-black/30 backdrop-blur-sm rounded-full px-2 sm:px-3 md:px-4 py-1 sm:py-2">
        {contents.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              goToSlide(index);
            }}
            onMouseEnter={() => setHoveredSlide(index)}
            className={`w-6 sm:w-8 md:w-10 lg:w-12 h-1 sm:h-1.5 md:h-2 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-primary shadow-lg shadow-primary/50' 
                : 'bg-white/40 hover:bg-primary/60 hover:scale-110'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;