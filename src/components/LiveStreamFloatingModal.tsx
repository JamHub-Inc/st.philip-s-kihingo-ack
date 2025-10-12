'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, RefreshCw, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LiveStreamFloatingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch streams function (same as main section)
  const fetchStreams = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
      const channelId = "UCEvzPAzeJ_9BC74Ufrdz0Eg"; 

      if (!apiKey) {
        const errorMsg = "YouTube API key is not configured.";
        console.error(errorMsg);
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Try to fetch live streams first
      const liveResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
      );
      
      if (!liveResponse.ok) {
        throw new Error(`YouTube API error: ${liveResponse.status} ${liveResponse.statusText}`);
      }
      
      const liveData = await liveResponse.json();

      if (liveData.items && liveData.items.length > 0) {
        setStreams(liveData.items);
      } else {
        // Fallback to latest videos if no live streams
        const latestResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${apiKey}`
        );
        
        if (!latestResponse.ok) {
          throw new Error(`YouTube API error: ${latestResponse.status} ${latestResponse.statusText}`);
        }
        
        const latestData = await latestResponse.json();
        setStreams(latestData.items || []);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching YouTube streams:", error);
      setError(error instanceof Error ? error.message : "Failed to load streams");
      setLoading(false);
    }
  };

  // Check if we're on desktop and set initial state
  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);
      
      if (desktop) {
        setIsOpen(true);
        setIsMinimized(false);
      } else {
        setIsOpen(false);
        setIsMinimized(true);
      }
    };

    // Initial check
    checkScreenSize();

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  // Fetch streams when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStreams();
    }
  }, [isOpen]);

  // Reset inactivity timer on any interaction
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    inactivityTimer.current = setTimeout(() => {
      setIsOpen(false);
      setIsMinimized(true);
    }, 15000);
  };

  useEffect(() => {
    if (isOpen) {
      resetInactivityTimer();

      // Listen for interactions to reset timer
      const events = ["mousemove", "keydown", "click", "touchstart"];
      events.forEach((event) =>
        window.addEventListener(event, resetInactivityTimer)
      );

      return () => {
        if (inactivityTimer.current) {
          clearTimeout(inactivityTimer.current);
        }
        events.forEach((event) =>
          window.removeEventListener(event, resetInactivityTimer)
        );
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const LiveStreamContent = () => {
    if (loading) {
      return (
        <div className="text-center p-6 bg-white rounded-xl flex-1 flex items-center justify-center flex-col">
          <RefreshCw className="w-8 h-8 animate-spin text-church-gold mb-4" />
          <div className="animate-pulse text-gray-600">Loading live stream...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-red-500/10 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <Play className="w-6 h-6 text-red-500" />
          </div>
          <h3 className="text-sm font-semibold mb-2 text-red-600">
            Stream Unavailable
          </h3>
          <p className="text-red-600/80 text-xs mb-3">
            {error}
          </p>
          <Button 
            onClick={fetchStreams}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Try Again
          </Button>
        </div>
      );
    }

    if (streams.length > 0) {
      return (
        <Card className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <div className="aspect-video bg-black">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${streams[0].id.videoId}?autoplay=1`}
                title={streams[0]?.snippet?.title || "Live Stream"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            {streams[0]?.snippet?.liveBroadcastContent === "live" && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                LIVE
              </div>
            )}
            {streams[0]?.snippet?.liveBroadcastContent === "live" && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Users className="w-3 h-3 mr-1" />
                Watching
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-church-navy mb-2 line-clamp-2">
              {streams[0]?.snippet?.title}
            </h3>
            <p className="text-gray-600 text-xs mb-3 line-clamp-2">
              {streams[0]?.snippet?.description}
            </p>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-church-gold to-yellow-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              {streams[0]?.snippet?.liveBroadcastContent === "live"
                ? "Watching Live"
                : "Watch Recording"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-church-navy/90 to-blue-900 rounded-xl p-6 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
          <Play className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-sm font-semibold mb-2">
          No Live Stream
        </h3>
        <p className="text-white/80 text-xs mb-3">
          Join us for our next service
        </p>
        <Button 
          onClick={fetchStreams}
          size="sm"
          variant="outline"
          className="border border-white text-white bg-transparent hover:bg-white hover:text-church-navy text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Check Again
        </Button>
      </div>
    );
  };

  return (
    <>
      {/* Full Modal */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 400,
              damping: 30
            }}
            className="fixed bottom-4 right-4 w-full max-w-[95vw] sm:max-w-[400px] z-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Header - Matching the main section style */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-church-navy to-blue-900 text-white">
                <div className="flex items-center space-x-2">
                  <Play className="w-4 h-4 text-church-gold animate-pulse" />
                  <h3 className="font-semibold text-sm">Live Worship Stream</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="hover:bg-white/20 rounded-full p-1 transition-colors"
                  aria-label="Close live stream"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content - Same styling as main section */}
              <div className="p-4 bg-gradient-to-b from-blue-50 to-white">
                <LiveStreamContent />
              </div>

              {/* Footer */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-600 text-center">
                  Auto-closes after 15s of inactivity
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized Pill (default on mobile) */}
      <AnimatePresence>
        {isMinimized && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            onClick={handleOpen}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-church-gold to-yellow-500 text-white font-semibold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 hover:shadow-xl transition-all duration-300 hover:scale-105 group"
            aria-label="Open live stream"
          >
            <div className="relative">
              <Play className="w-4 h-4 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            <span className="text-sm">LIVE</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs bg-black/20 px-2 py-1 rounded-full">
              Watch
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveStreamFloatingModal;