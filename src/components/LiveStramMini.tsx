'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const LiveStreamMini = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        const channelId = "UCegro5FeF66wVl4LWsMBHMA";

        if (!apiKey) {
          console.error("YouTube API key is missing!");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
        );
        const data = await response.json();

        if (data.items?.length > 0) {
          setStreams(data.items);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching streams:", error);
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      let nextService = new Date();
      nextService.setDate(now.getDate() + ((7 - now.getDay() + 0) % 7 || 7));
      nextService.setHours(8, 30, 0, 0);

      const diff = nextService.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown(`${days}d ${hours}h ${minutes}m`);
      } else {
        setCountdown("Starting Soon...");
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4">
      {loading ? (
        <div className="text-center py-6 text-gray-600">
          Loading stream...
        </div>
      ) : streams.length > 0 ? (
        <Card className="overflow-hidden shadow-lg border border-gray-200">
          <div className="relative">
            <iframe
              width="100%"
              height="200"
              src={`https://www.youtube.com/embed/${streams[0].id.videoId}?autoplay=1&mute=1`}
              title={streams[0]?.snippet?.title || "Live Stream"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-48 sm:h-56"
            ></iframe>

            {/* Live Tag */}
            {streams[0]?.snippet?.liveBroadcastContent === "live" && (
              <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
                LIVE
              </div>
            )}
            {streams[0]?.snippet?.liveBroadcastContent === "live" && (
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center">
                <Users className="w-3 h-3 mr-1" />
                145 watching
              </div>
            )}
          </div>
          <CardContent className="p-4">
            <h3 className="text-lg font-bold text-church-navy line-clamp-2">
              {streams[0]?.snippet?.title}
            </h3>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {streams[0]?.snippet?.description}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-gradient-to-br from-church-navy to-blue-900 text-white p-4 sm:p-6 rounded-xl shadow-lg"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            No Live Stream Right Now
          </h3>
          <p className="text-white/80 text-sm mb-3 sm:mb-4">
            Next Service: <span className="font-semibold">Sunday 8:30 AM</span>
          </p>
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {countdown.split(" ").map((part, idx) => (
              <motion.div
                key={idx}
                initial={{ rotateX: -90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-black/40 px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-center min-w-[50px]"
              >
                <span className="block text-sm sm:text-lg font-bold text-church-gold">
                  {part}
                </span>
                <span className="block text-xs text-white/70 uppercase mt-1">
                  {idx === 0 ? 'days' : idx === 1 ? 'hours' : 'mins'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LiveStreamMini;