'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Play } from "lucide-react";
import Link from "next/link";

const LiveStreamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        // Use Next.js environment variables
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        const channelId = "UCegro5FeF66wVl4LWsMBHMA"; 

        if (!apiKey) {
          console.error("YouTube API key is missing!");
          setLoading(false);
          return;
        }

        let response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&eventType=live&key=${apiKey}`
        );
        let data = await response.json();

        if (data.items && data.items.length > 0) {
          setStreams(data.items);
        } else {
          const latestResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=3&order=date&type=video&key=${apiKey}`
          );
          const latestData = await latestResponse.json();
          setStreams(latestData.items || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching YouTube streams:", error);
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  // Countdown to next Sunday 8:30 AM
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      let nextService = new Date();

      // Sunday 8:30 AM
      nextService.setDate(
        now.getDate() + ((7 - now.getDay() + 0) % 7 || 7)
      );
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
    const timer = setInterval(updateCountdown, 60000); // update every min
    return () => clearInterval(timer);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as any },
    },
  };

  return (
    <section id="live-stream" className="py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-6xl mx-auto"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-church-navy mb-6">
              Live Worship & Services
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Join us online for live worship services, prayer meetings, and Bible
              studies. Experience the presence of God from wherever you are.
            </p>
          </motion.div>

          {/* Streams Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Stream */}
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="text-center p-6">Loading live stream...</div>
                ) : streams.length > 0 ? (
                  <Card className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
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
                          className="w-full h-full rounded-lg"
                        ></iframe>
                      </div>

                      {streams[0]?.snippet?.liveBroadcastContent === "live" && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                          LIVE
                        </div>
                      )}
                      {streams[0]?.snippet?.liveBroadcastContent === "live" && (
                        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          145 watching
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-church-navy mb-2">
                        {streams[0]?.snippet?.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {streams[0]?.snippet?.description}
                      </p>
                      <Button className="bg-gradient-to-r from-church-gold to-yellow-500 text-church-navy font-semibold rounded-md shadow-md hover:shadow-lg transition-all duration-300 w-full">
                        <Play className="w-5 h-5 mr-2" />
                        {streams[0]?.snippet?.liveBroadcastContent === "live"
                          ? "Watching Live Stream"
                          : "Watch Recording"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-church-navy/90 to-church-gold/80 rounded-2xl p-10 shadow-xl"
                  >
                    {/* Icon */}
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Play className="w-10 h-10 text-white" />
                    </div>

                    {/* Message */}
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Live Stream at the Moment
                    </h3>
                    <p className="text-white/80 max-w-md mb-6">
                      Please check back during our Sunday services at{" "}
                      <span className="font-semibold">8:30 AM</span> and{" "}
                      <span className="font-semibold">10:30 AM</span>, or explore past sermons
                      on our YouTube channel.
                    </p>

                    {/* Countdown */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                      {countdown.split(" ").map((part, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ rotateX: -90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          transition={{ duration: 0.6, delay: idx * 0.2 }}
                          className="bg-black/40 px-4 py-3 rounded-lg shadow-md text-center"
                        >
                          <span className="block text-2xl md:text-3xl font-bold text-church-gold drop-shadow-md animate-pulse">
                            {part}
                          </span>
                          <span className="block text-xs uppercase tracking-wide text-white/70">
                            {idx === 0 && part.includes("d")
                              ? "Days"
                              : idx === 1
                              ? "Hours"
                              : "Minutes"}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href="https://www.youtube.com/@franko_scar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-white text-church-navy font-semibold rounded-full shadow hover:bg-gray-100 transition-colors"
                    >
                      Visit Our Channel
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Upcoming + Prayer */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-church-navy">
                  Upcoming & Recent Services
                </h3>
                {streams.slice(1).map((stream) => (
                  <Card key={stream.id.videoId} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Clock className="w-5 h-5 text-church-gold" />
                        <span className="text-sm font-medium text-church-navy">
                          {new Date(stream.snippet?.publishedAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="font-semibold text-church-navy mb-2">
                        {stream.snippet?.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {stream.snippet?.description}
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-2 border-church-gold text-church-gold bg-transparent font-semibold rounded-md transition-all duration-300 hover:bg-church-gold hover:text-church-navy w-full"
                      >
                        <Link
                          href={`https://www.youtube.com/watch?v=${stream.id.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}

                {/* Prayer Request */}
                <Card className="bg-gradient-to-r from-church-navy to-blue-900 text-white rounded-xl">
                  <CardContent className="p-6 text-center">
                    <h4 className="font-bold mb-2">Need Prayer?</h4>
                    <p className="text-sm opacity-90 mb-4">
                      Submit your prayer request and our team will pray for you.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-church-navy transition-colors"
                    >
                      <Link
                        href="https://wa.me/254796219542?text=Hello%20ACK%20St.%20Philip%27s%20Kihingo,%20I%20would%20like%20to%20submit%20a%20prayer%20request."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Prayer Request via WhatsApp
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveStreamSection;