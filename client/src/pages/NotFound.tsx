
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(7);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate(-1); // Redirect to previous page
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated Background Waves */}
      <div className="absolute inset-0">
        <div className="wave-bg-1"></div>
        <div className="wave-bg-2"></div>
        <div className="wave-bg-3"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-extralight tracking-widest mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#158A5D] to-[#35B584] animate-pulse drop-shadow-2xl" 
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            404
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-[#35B584] to-transparent mx-auto mb-8 animate-pulse"></div>
        </div>
        
        <div className="space-y-6">
          <p className="text-3xl md:text-4xl font-thin tracking-wide text-[#158A5D] mb-4"
             style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Oops! Page not found
          </p>
          
          <p className="text-lg font-extralight text-gray-300 max-w-md mx-auto leading-relaxed"
             style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            The page you're looking for seems to have wandered off into the digital void.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="inline-flex items-center space-x-3 bg-black/30 backdrop-blur-sm border border-[#35B584]/30 rounded-full px-6 py-3 max-w-xs">
              <div className="w-3 h-3 bg-[#35B584] rounded-full animate-pulse"></div>
              <span className="text-[#158A5D] font-light tracking-wide text-sm"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Redirecting in {countdown}s...
              </span>
            </div>
            
            <div className="flex justify-center space-x-3 mt-6">
              <button 
                onClick={() => navigate(-1)}
                className="bg-primary/10 backdrop-blur-sm border border-primary/50 text-primary hover:bg-gradient-to-br hover:from-black/60 hover:via-dark-green/10 hover:to-black/60 hover:border-primary/30 transition-all duration-300 font-medium text-sm px-6 py-2 rounded min-w-[100px]"
                style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Go Back
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="bg-primary/5 backdrop-blur-sm border border-primary/30 text-primary hover:bg-gradient-to-br hover:from-black/30 hover:via-dark-green/5 hover:to-black/30 hover:border-primary/20 transition-all duration-300 font-medium text-sm px-6 py-2 rounded min-w-[100px]"
                style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-[#35B584] rounded-full animate-float-1"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-[#158A5D] rounded-full animate-float-2"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-[#35B584]/50 rounded-full animate-float-3"></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-[#158A5D] rounded-full animate-float-1"></div>
      </div>
    </div>
  );
};

export default NotFound;
