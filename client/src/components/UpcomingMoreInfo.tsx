import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TrailerModal from '@/components/TrailerModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Play, Calendar, Clock } from 'lucide-react';

const UpcomingMoreInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const content = location.state;
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  // Debug thumbnail URL
  console.log('UpcomingMoreInfo content:', content);
  console.log('UpcomingMoreInfo thumbnail_url:', content?.thumbnail_url);

  const handleTrailerClick = () => {
    setIsTrailerModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <TrailerModal
        isOpen={isTrailerModalOpen}
        onClose={() => setIsTrailerModalOpen(false)}
        trailerUrl={content?.trailer_url || ''}
        title={content?.title || 'Upcoming Content'}
      />

      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-dark-green/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <Card className="bg-gradient-to-br from-black/90 via-dark-green/20 to-black/90 backdrop-blur-sm border border-border/50 wave-transition relative overflow-hidden">
            {/* Animated Background Waves */}
            <div className="absolute inset-0">
              <div className="upcoming-wave-bg-1"></div>
              <div className="upcoming-wave-bg-2"></div>
              <div className="upcoming-wave-bg-3"></div>
            </div>

            <CardHeader className="relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="w-full aspect-[16/9] relative overflow-hidden rounded-lg">
                    <img 
                      src={content.thumbnail_url || content.image || '/placeholder.svg'} 
                      alt={content.title} 
                      className="w-full h-full object-cover object-center" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder.svg') {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </div>

                  {/* Watch Trailer Button below thumbnail */}
                  <div className="mt-4 flex justify-center">
                    <Button 
                      onClick={handleTrailerClick} 
                      className="bg-transparent backdrop-blur-sm border border-primary/60 text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all duration-300 font-semibold text-base px-12 py-3 min-w-[180px] rounded-lg shadow-lg"
                    >
                      <Play className="w-5 h-5 mr-3" />
                      Watch Trailer
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">
                    {content.title}
                  </h1>

                  <div className="flex items-center space-x-3 flex-wrap">
                    {content.rating_type && (
                      <span className="bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 text-xs font-medium">
                        {content.rating_type}
                      </span>
                    )}
                    {content.content_type && (
                      <span className="bg-blue-900/25 text-blue-200 px-2 py-1 rounded border border-blue-800/40 text-xs font-medium">
                        {content.content_type}
                      </span>
                    )}
                    {content.release_date && (
                      <div className="flex items-center space-x-2 bg-emerald-800/20 px-2 py-1 rounded-md border border-emerald-700/30">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-100 font-medium text-xs">
                          {new Date(content.release_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {content.description && (
                    <div className="mt-4">
                      <p className="text-foreground/90 leading-relaxed text-sm font-normal whitespace-pre-line break-words">
                        {content.description}
                      </p>
                    </div>
                  )}

                  {/* See More Button */}
                  <div className="mt-4">
                    <button 
                      onClick={() => setShowAllDetails(!showAllDetails)}
                      className="text-primary hover:text-primary/80 text-sm font-medium bg-transparent border-none p-0 cursor-pointer transition-colors duration-300"
                    >
                      {showAllDetails ? 'Show Less' : 'See More'}
                    </button>
                  </div>

                  {/* Additional Details shown inline when expanded */}
                  {showAllDetails && (
                    <div className="space-y-4 mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.genre && content.genre.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Genres</h3>
                            <div className="flex flex-wrap gap-2">
                              {content.genre.map((g, index) => (
                                <span key={index} className="bg-purple-800/20 text-purple-300 px-2 py-1 rounded border border-purple-700/30 text-xs">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {content.directors && content.directors.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Directors</h3>
                          <div className="flex flex-wrap gap-2">
                            {content.directors.map((director, index) => (
                              <span key={index} className="bg-orange-800/20 text-orange-300 px-2 py-1 rounded border border-orange-700/30 text-xs">
                                {director}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {content.writers && content.writers.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Writers</h3>
                          <div className="flex flex-wrap gap-2">
                            {content.writers.map((writer, index) => (
                              <span key={index} className="bg-teal-800/20 text-teal-300 px-2 py-1 rounded border border-teal-700/30 text-xs">
                                {writer}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {content.cast_members && content.cast_members.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Cast Members</h3>
                          <div className="flex flex-wrap gap-2">
                            {content.cast_members.map((cast, index) => (
                              <span key={index} className="bg-pink-800/20 text-pink-300 px-2 py-1 rounded border border-pink-700/30 text-xs">
                                {cast}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Advertisement Section */}
          <div className="w-full mt-8">
            <Card className="bg-gradient-to-br from-black/40 via-[#0A7D4B]/10 to-black/40 backdrop-blur-sm border border-border/30 min-h-[200px]">
              <CardContent className="p-8 flex items-center justify-center h-full">
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
  );
};

export default UpcomingMoreInfo;