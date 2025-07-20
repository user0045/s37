
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import TrailerModal from '@/components/TrailerModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Play, Star, Calendar, Clock } from 'lucide-react';
import { getContentDetails, getSeasonInfo, type ContentData } from '@/utils/contentDataUtils';

const MoreInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const content: ContentData = location.state || {};
  const [isTrailerModalOpen, setIsTrailerModalOpen] = useState(false);

  console.log('MoreInfo received content:', content.title, 'Type:', content.content_type);

  // Use the new utility function to get all content details
  const details = getContentDetails(content);
  const seasonInfo = getSeasonInfo(content);

  console.log('Final details:', {
    title: details.title,
    directors: details.directors,
    writers: details.writers,
    castMembers: details.castMembers,
    genres: details.genre
  });

  const handlePlayClick = () => {
    navigate('/player', {
      state: content
    });
  };

  const handleTrailerClick = () => {
    setIsTrailerModalOpen(true);
  };

  // Filter out empty values
  const filteredDirectors = details.directors.filter(d => d && d.trim() !== '');
  const filteredWriters = details.writers.filter(w => w && w.trim() !== '');
  const filteredCastMembers = details.castMembers.filter(c => c && c.trim() !== '');
  const filteredGenres = details.genre.filter(g => g && g.trim() !== '');

  console.log('Filtered data - Directors:', filteredDirectors, 'Writers:', filteredWriters, 'Cast:', filteredCastMembers);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="pt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              size="sm" 
              className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-dark-green/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300"
            >
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
                      src={details.image || '/placeholder.svg'} 
                      alt={details.title} 
                      className="w-full h-full object-cover object-center" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/placeholder.svg') {
                          target.src = '/placeholder.svg';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6 min-w-0">
                  <h1 className="text-xl font-bold text-foreground">
                    {details.title}
                  </h1>

                  <div className="flex items-center space-x-3 flex-wrap">
                    <span className="bg-primary/20 text-primary px-2 py-1 rounded border border-primary/30 text-xs font-medium">
                      {details.rating || 'Not Rated'}
                    </span>
                    <span className="bg-blue-900/25 text-blue-200 px-2 py-1 rounded border border-blue-800/40 text-xs font-medium">
                      {details.contentType}
                    </span>
                    {details.year && (
                      <div className="flex items-center space-x-2 bg-emerald-800/20 px-2 py-1 rounded-md border border-emerald-700/30">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-100 font-medium text-xs">
                          {details.year}
                        </span>
                      </div>
                    )}
                    {details.score && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-foreground font-medium text-xs">{details.score}</span>
                      </div>
                    )}
                    {details.duration && (
                      <div className="flex items-center space-x-2 bg-violet-800/20 px-2 py-1 rounded-md border border-violet-700/30">
                        <Clock className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-100 font-medium text-xs highlight-glow">
                          {details.duration}
                        </span>
                      </div>
                    )}
                    {seasonInfo && (
                      <div className="flex items-center space-x-2 bg-violet-800/20 px-2 py-1 rounded-md border border-violet-700/30">
                        <Clock className="w-3 h-3 text-violet-400" />
                        <span className="text-violet-100 font-medium text-xs highlight-glow">
                          {seasonInfo}
                        </span>
                      </div>
                    )}
                    {details.episodeCount && details.contentType !== 'Movie' && (
                      <div className="flex items-center space-x-2 bg-amber-800/20 px-2 py-1 rounded-md border border-amber-700/30">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-amber-100 font-medium text-xs">
                          {details.episodeCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {details.description && (
                    <div className="mt-4">
                      <p className="text-foreground/90 leading-relaxed text-sm font-normal whitespace-pre-line break-words">
                        {details.description}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-start gap-3 mt-6">
                    <Button 
                      onClick={handlePlayClick} 
                      className="bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-dark-green/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300 px-3 py-1.5 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Play
                    </Button>
                    <Button 
                      onClick={handleTrailerClick} 
                      className="bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-dark-green/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300 px-3 py-1.5 text-xs"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Trailer
                    </Button>
                  </div>

                  {/* Additional Content Details */}
                  <div className="space-y-4 border-t border-border/30 pt-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Additional Details</h2>

                    <div className="space-y-4">
                      {filteredGenres.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {filteredGenres.map((genre, index) => (
                              <span 
                                key={index} 
                                className="bg-purple-800/20 text-purple-300 px-2 py-1 rounded border border-purple-700/30 text-xs"
                              >
                                {genre}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredDirectors.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Directors</h3>
                          <div className="flex flex-wrap gap-2">
                            {filteredDirectors.map((director, index) => (
                              <span 
                                key={index} 
                                className="bg-orange-800/20 text-orange-300 px-2 py-1 rounded border border-orange-700/30 text-xs"
                              >
                                {director.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredWriters.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Writers</h3>
                          <div className="flex flex-wrap gap-2">
                            {filteredWriters.map((writer, index) => (
                              <span 
                                key={index} 
                                className="bg-teal-800/20 text-teal-300 px-2 py-1 rounded border border-teal-700/30 text-xs"
                              >
                                {writer.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {filteredCastMembers.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Cast Members</h3>
                          <div className="flex flex-wrap gap-2">
                            {filteredCastMembers.map((castMember, index) => (
                              <span 
                                key={index} 
                                className="bg-pink-800/20 text-pink-300 px-2 py-1 rounded border border-pink-700/30 text-xs"
                              >
                                {castMember.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
       <TrailerModal isOpen={isTrailerModalOpen} onClose={() => setIsTrailerModalOpen(false)} trailerUrl={content.trailer_url} />
    </div>
  );
};

export default MoreInfo;
