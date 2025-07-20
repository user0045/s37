import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Film, Tv, Calendar, Search, X, Monitor } from 'lucide-react';
import { useAllContent } from '@/hooks/useContentQueries';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get real content data
  const { data: contentData } = useAllContent();

  // Hide header on admin page
  if (location.pathname === '/admin') {
    return null;
  }

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Movies', path: '/movies', icon: Film },
    { name: 'Web Series', path: '/web-series', icon: Tv },
    { name: 'Shows', path: '/tv-shows', icon: Monitor },
    { name: 'Upcoming', path: '/upcoming', icon: Calendar },
  ];

  // Transform real content data for search
  const searchableContent = useMemo(() => {
    if (!contentData) return [];

    const allContent = [];

    // Process movies
    contentData.movies?.forEach((movieItem) => {
      if (movieItem.movie) {
        allContent.push({
          id: movieItem.id,
          content_id: movieItem.content_id,
          title: movieItem.title,
          type: 'Movie',
          year: movieItem.movie.release_year?.toString() || movieItem.created_at?.split('-')[0] || '',
          image: movieItem.movie.thumbnail_url || '',
          description: movieItem.movie.description || '',
          genre: movieItem.genre || [],
          originalData: movieItem
        });
      }
    });

    // Process web series (each season as separate item)
    contentData.webSeries?.forEach((seriesItem) => {
      if (seriesItem.web_series?.seasons?.[0]) {
        const season = seriesItem.web_series.seasons[0];
        allContent.push({
          id: seriesItem.id,
          content_id: seriesItem.content_id,
          title: seriesItem.title,
          type: 'Web Series',
          year: season.release_year?.toString() || seriesItem.created_at?.split('-')[0] || '',
          image: season.thumbnail_url || '',
          description: season.season_description || '',
          genre: seriesItem.genre || [],
          seasonNumber: seriesItem.seasonNumber,
          originalData: seriesItem
        });
      }
    });

    // Process shows
    contentData.shows?.forEach((showItem) => {
      if (showItem.show) {
        allContent.push({
          id: showItem.id,
          content_id: showItem.content_id,
          title: showItem.title,
          type: 'Show',
          year: showItem.show.release_year?.toString() || showItem.created_at?.split('-')[0] || '',
          image: showItem.show.thumbnail_url || '',
          description: showItem.show.description || '',
          genre: showItem.genre || [],
          originalData: showItem
        });
      }
    });

    return allContent;
  }, [contentData]);

  // Filter content based on search query
  const searchResults = searchQuery.length > 0 ? 
    searchableContent.filter(content => 
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (content.description && content.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (content.genre && Array.isArray(content.genre) && content.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase())))
    ).slice(0, 5) : [];

  const handleSearchItemClick = (content: any) => {
    // Navigate to details page with the content ID and pass the original data
    navigate(`/details/${content.content_id}`, { state: content.originalData });
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary">
            <img 
              src="/logo.png" 
              alt="GreenFlix Logo" 
              className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain"
            />
            <span className="text-lg sm:text-xl md:text-2xl">GreenFlix</span>
          </Link>

          <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 text-sm font-medium transition-all duration-200 hover:text-primary ${
                    location.pathname === item.path
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="relative">
            {!isSearchOpen ? (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-5 h-5 stroke-1" />
              </button>
            ) : (
              <div className="flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search content..."
                    className="w-64 bg-background/80 border border-border/50 rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                    autoFocus
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background/90 backdrop-blur-md border border-border/50 rounded-lg max-h-64 overflow-y-auto z-50">
                      {searchResults.map((content, index) => (
                        <div
                          key={content.id || index}
                          onClick={() => handleSearchItemClick(content)}
                          className="px-4 py-3 text-sm text-foreground hover:bg-card/50 cursor-pointer border-b border-border/30 last:border-b-0 flex items-center space-x-3"
                        >
                          <img 
                            src={content.image} 
                            alt={content.title}
                            className="w-10 h-6 object-cover rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium">
                              {content.title}
                              {content.seasonNumber && ` (Season ${content.seasonNumber})`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {content.type} • {content.year}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="ml-2 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <X className="w-4 h-4 stroke-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;