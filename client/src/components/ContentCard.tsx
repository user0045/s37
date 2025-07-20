import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

interface ContentCardProps {
  id?: number | string;
  title: string;
  rating: string;
  score: string;
  image: string;
  year?: string;
  description?: string;
  type?: string;
  seasonNumber?: number;
  originalData?: any;
  // New props to handle full database objects
  content_type?: string;
  genre?: string[];
  content_id?: string;
  movie?: any;
  web_series?: any;
  show?: any;
  created_at?: string;
  updated_at?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  id, 
  title, 
  rating, 
  score, 
  image, 
  year, 
  description, 
  type, 
  seasonNumber, 
  originalData,
  content_type,
  genre,
  content_id,
  movie,
  web_series,
  show,
  created_at,
  updated_at,
  ...otherProps 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handlePlayClick = () => {
    // Pass the complete database object with all nested data
    const fullContentData = originalData || {
      id,
      title,
      content_type: content_type || type,
      genre: genre || [],
      content_id,
      movie,
      web_series,
      show,
      created_at,
      updated_at,
      rating,
      score,
      image,
      year,
      description,
      type,
      seasonNumber,
      ...otherProps
    };

    console.log('ContentCard navigating to details with full data:', fullContentData);
    // Use the content_id for navigation as it's more reliable
    const navigationId = content_id || id;
    navigate(`/details/${navigationId}`, { state: fullContentData });
  };

  const handleInfoClick = () => {
    // Pass the complete database object with all nested data
    const fullContentData = originalData || {
      id,
      title,
      content_type: content_type || type,
      genre: genre || [],
      content_id,
      movie,
      web_series,
      show,
      created_at,
      updated_at,
      // Include the simplified fields for backward compatibility
      rating,
      score,
      image,
      year,
      description,
      type,
      seasonNumber,
      ...otherProps
    };

    console.log('ContentCard navigating to info with full data:', fullContentData);
    // Use the content_id for navigation as it's more reliable
    const navigationId = content_id || id;
    navigate(`/details/${navigationId}`, { state: fullContentData });
  };

  return (
    <div
      className={`min-w-[320px] h-[180px] relative cursor-pointer transition-all duration-300 ${
        isHovered ? 'card-hover-wave' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlayClick}
    >
      <div className="relative h-full overflow-hidden rounded-lg content-card">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Season Badge */}
        {(type === 'Web Series' || type === 'series') && seasonNumber && (
          <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white" style={{ backgroundColor: '#009C5B' }}>
            Season {seasonNumber}
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick();
            }} 
            className="bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-dark-green/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300 rounded-full p-4 group"
          >
            <Play className="w-6 h-6 transition-transform duration-200 group-hover:scale-125" />
          </button>
        </div>

        {/* Content Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
          <h3 className="font-thin text-foreground text-sm mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs border border-primary/30 font-thin">
                {rating}
              </span>
              {year && <span className="text-muted-foreground font-thin">{year}</span>}
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-yellow-400">★</span>
              <span className="text-muted-foreground font-thin">{score}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;