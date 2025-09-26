'use client';

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Baby, Play } from "lucide-react";
import Link from "next/link";
import ScriptureOfTheDay from "@/components/ScriptureOfTheDay";

const ServicesAndLiveStreamSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
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
    const timer = setInterval(updateCountdown, 60000);
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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 80, 
        damping: 20 
      },
    },
  };

  // Fixed cardVariants with proper typing
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6,
        ease: "easeOut" as const // Use string literal with const assertion
      },
    },
  };

  const services = [
    {
      icon: Clock,
      title: "English Service",
      time: "8:30am – 10:30am",
      description:
        "Join us for an uplifting English service with worship, prayer, and biblical teaching.",
    },
    {
      icon: Clock,
      title: "Kikuyu Service",
      time: "10:30am – 12:30pm",
      description:
        "A powerful Kikuyu service focused on community, faith, and the Word of God.",
    },
    {
      icon: Baby,
      title: "Children Ministry",
      time: "8:30am – 10:30am & 10:30am – 12:30pm",
      description:
        "Nurturing children in faith through engaging Bible lessons, songs, and activities.",
    },
    {
      icon: Users,
      title: "Teens Ministry",
      time: "8:30am – 10:30am",
      description:
        "Empowering teenagers to live out their faith with joy, purpose, and resilience.",
    },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-7xl mx-auto"
        >
          {/* Main Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-church-navy mb-6">
              Worship Services & Live Stream
            </h2>
            <p className="text-lg md:text-xl text-gray-700 max-w-4xl mx-auto font-light">
              Join us in person or online as we gather to worship, grow, and serve together. 
              Experience our vibrant services and stay connected through our live stream.
            </p>
          </motion.div>

          {/* Live Stream Section */}
          <motion.div variants={itemVariants} className="mb-20">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-church-navy text-center mb-12">
              Live Worship Experience
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Stream - Updated to take full height */}
              <div className="lg:col-span-2 flex flex-col">
                {loading ? (
                  <div className="text-center p-8 bg-white rounded-xl shadow-lg flex-1 flex items-center justify-center">
                    <div className="animate-pulse">Loading live stream...</div>
                  </div>
                ) : streams.length > 0 ? (
                  <Card className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex-1 flex flex-col">
                    <div className="relative flex-1">
                      <div className="aspect-video bg-black">
                        <iframe
                          width="100%"
                          height="100%"
                          src={`https://www.youtube.com/embed/${streams[0].id.videoId}?autoplay=1`}
                          title={streams[0]?.snippet?.title || "Live Stream"}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full rounded-t-xl"
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
                      <h3 className="text-xl font-serif font-bold text-church-navy mb-2">
                        {streams[0]?.snippet?.title}
                      </h3>
                      <p className="text-gray-600 mb-4 font-light">
                        {streams[0]?.snippet?.description}
                      </p>
                      <Button className="bg-gradient-to-r from-church-gold to-yellow-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full">
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
                    className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-church-navy/90 to-blue-900 rounded-2xl p-8 shadow-xl text-white flex-1"
                  >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <Play className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-xl font-serif font-bold mb-3">
                      No Live Stream at the Moment
                    </h3>
                    <p className="text-white/80 mb-4 font-light">
                      Join us for our next service on Sunday at{" "}
                      <span className="font-semibold">8:30 AM</span>
                    </p>

                    <div className="flex items-center justify-center space-x-3 mb-4">
                      {countdown.split(" ").map((part, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ rotateX: -90, opacity: 0 }}
                          animate={{ rotateX: 0, opacity: 1 }}
                          transition={{ duration: 0.6, delay: idx * 0.2 }}
                          className="bg-black/40 px-3 py-2 rounded-lg text-center"
                        >
                          <span className="block text-lg font-bold text-church-gold">
                            {part}
                          </span>
                          <span className="block text-xs uppercase tracking-wide text-white/70">
                            {idx === 0 ? "Days" : idx === 1 ? "Hours" : "Minutes"}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Service Times & Prayer - Updated to take full height */}
              <div className="flex flex-col space-y-6 h-full">
                {/* Scripture of the day */}
                <Card className="bg-gradient-to-r from-church-navy to-blue-900 text-white rounded-xl flex-1 flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1 justify-center">
                    <ScriptureOfTheDay />
                  </CardContent>
                </Card>
                
                {/* Second Prayer Card */}
                <Card className="bg-gradient-to-r from-church-navy to-blue-900 text-white rounded-xl flex-1 flex flex-col">
                  <CardContent className="p-6 text-center flex flex-col flex-1 justify-center">
                    <h4 className="font-serif font-bold mb-2">Need Prayer?</h4>
                    <p className="text-sm opacity-90 mb-4 font-light">
                      Submit your prayer request and our team will pray for you.
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-church-navy transition-colors mt-auto"
                    >
                      <Link
                        href="https://wa.me/254796219542?text=Hello%20ACK%20St.%20Philip%27s%20Kihingo,%20I%20would%20like%20to%20submit%20a%20prayer%20request."
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Prayer Request
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>

          {/* Service Schedule Section */}
          <motion.div variants={itemVariants}>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-church-navy text-center mb-12">
              Sunday Service Schedule
            </h3>

            <div className="relative max-w-4xl mx-auto">
              {/* Vertical Timeline */}
              <div className="absolute top-0 left-6 md:left-1/2 transform md:-translate-x-1/2 h-full border-l-2 border-church-gold"></div>

              {services.map((service, idx) => (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  className={`mb-8 flex w-full ${
                    idx % 2 === 0 ? "md:justify-start" : "md:justify-end"
                  }`}
                >
                  {/* Card */}
                  <div className="w-full md:w-1/2 pl-16 md:px-6 relative">
                    <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-church-gold rounded-full flex items-center justify-center">
                            <service.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-church-gold">
                              {service.time}
                            </p>
                            <h4 className="text-lg font-serif font-bold text-church-navy">
                              {service.title}
                            </h4>
                          </div>
                        </div>
                        <p className="text-gray-600 font-light">
                          {service.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-church-gold rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 text-center bg-gradient-to-r from-church-navy to-blue-900 rounded-2xl p-8 text-white shadow-xl"
          >
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-4">Join Us This Sunday</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90 font-light">
              Whether in person or online, you're welcome to worship with us. Experience the warmth of our community and the power of God's word.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => handleNavClick('#contact')}
                className="bg-church-gold hover:bg-yellow-600 text-white font-semibold px-8 py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Get Directions
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-2 border-white text-church-navy hover:bg-white hover:text-church-navy font-semibold px-8 py-3 rounded-lg transition-all"
              >
                <Link href="https://www.youtube.com/@franko_scar" target="_blank" rel="noopener noreferrer">
                  Subscribe on YouTube
                </Link>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesAndLiveStreamSection;