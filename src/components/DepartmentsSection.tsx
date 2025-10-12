'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { client } from "@/app/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface SanityImage {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
}

interface Department {
  _id: string;
  title: string;
  excerpt?: string;
  image?: SanityImage;
  category?: string;
  publishedAt: string;
  body: any[];
  slug?: {
    current: string;
  };
}

const DEPARTMENTS_QUERY = `*[
  _type == "post" 
  && category == "department"
  && defined(title)
]|order(title asc){
  _id, 
  title,
  slug,
  excerpt,
  image,
  category,
  publishedAt,
  body
}`;

// Image URL builder setup
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const DepartmentsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isFiltering, setIsFiltering] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  // Function to get excerpt from body if no excerpt provided
  const getExcerpt = (body: any[], maxLength: number = 120): string => {
    if (!body || !Array.isArray(body)) return 'Explore this ministry and get involved in our church community.';
    
    try {
      const plainText = body
        .filter(block => block._type === 'block' && block.children)
        .flatMap(block => 
          block.children
            .filter((child: any) => child.text)
            .map((child: any) => child.text)
        )
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!plainText) return 'Explore this ministry and get involved in our church community.';
      if (plainText.length <= maxLength) return plainText;
      return plainText.substring(0, maxLength) + '...';
    } catch (err) {
      return 'Explore this ministry and get involved in our church community.';
    }
  };

  // Fetch departments from Sanity
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Starting departments fetch...');
        const departmentsData = await client.fetch(DEPARTMENTS_QUERY);
        console.log('Fetched departments data:', departmentsData);
        
        if (!departmentsData || !Array.isArray(departmentsData)) {
          throw new Error('Invalid data format received from server');
        }
       
        const processedDepartments = departmentsData.map((dept: Department) => ({
          ...dept,
          excerpt: dept.excerpt || getExcerpt(dept.body, 120),
          category: dept.category || 'Ministry'
        })).filter(dept => dept.title);
        
        console.log('Processed departments:', processedDepartments);
        setDepartments(processedDepartments);
        
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError(err instanceof Error ? err.message : 'Failed to load departments');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Get unique categories from departments
  const categories = ["All", ...new Set(
    departments
      .map(dept => dept.category)
      .filter((category): category is string => 
        !!category && typeof category === 'string' && category.trim() !== ""
      )
  )];

  const handleFilterChange = (category: string) => {
    setIsFiltering(true);
    setActiveFilter(category);
    setTimeout(() => setIsFiltering(false), 500);
  };

  const handleImageError = (deptId: string) => {
    console.log('Image error for department:', deptId);
    setImageErrors(prev => ({ ...prev, [deptId]: true }));
  };

  const filteredDepartments = activeFilter === "All" 
    ? departments 
    : departments.filter(dept => dept.category === activeFilter);

  // Animation variants - CORRECTED
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.2, 
      delayChildren: 0.1 
    },
  },
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.6
      // Remove the ease property or use a valid easing function
    },
  },
};

  // Loading state
  if (loading) {
    return (
      <section 
        id="departments" 
        className="relative w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f9f5f0] to-[#f1e9df]"
      >
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center">
            {/* Skeleton header */}
            <div className="h-12 bg-gray-200 rounded-full w-64 mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-12 animate-pulse"></div>
            
            {/* Skeleton filter buttons */}
            <div className="flex flex-wrap justify-center gap-3 mb-12 px-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div>
              ))}
            </div>
            
            {/* Skeleton cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section 
        id="departments" 
        className="relative w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f9f5f0] to-[#f1e9df] flex items-center justify-center"
      >
        <div className="text-center max-w-2xl">
          <div className="text-6xl mb-6">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Load Departments</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#d4a373] text-white rounded-full hover:bg-[#c49567] transition-colors"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section 
      id="departments" 
      className="relative w-full min-h-screen py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#f9f5f0] to-[#f1e9df]"
    >
      {/* Enhanced magical floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#d4a373]/20"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 8 + 2,
              height: Math.random() * 8 + 2,
              opacity: Math.random() * 0.4 + 0.1,
            }}
            animate={{
              y: [null, (Math.random() - 0.5) * 80],
              x: [null, (Math.random() - 0.5) * 80],
              opacity: [null, Math.random() * 0.3 + 0.2],
              transition: {
                duration: Math.random() * 15 + 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>

      {/* Enhanced soft glow effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#e8b796] mix-blend-multiply blur-[100px]"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-20 w-96 h-96 rounded-full bg-[#d4a373] mix-blend-multiply blur-[110px]"
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Enhanced Header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-16"
          >
            <div className="relative inline-block mb-8">
              <motion.h2
                className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2a2a2a] tracking-tight leading-tight mb-6"
                initial={{ letterSpacing: "0.3em", opacity: 0 }}
                animate={{ letterSpacing: "0.05em", opacity: 1 }}
                transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
              >
                <span className="relative inline-block">
                  <span className="text-[#d4a373] absolute -left-2 -top-2 opacity-20 blur-md">
                    Our Departments
                  </span>
                  Our <span className="text-[#d4a373] relative">Church</span> Departments
                </span>
              </motion.h2>
              
              <motion.div
                className="absolute -bottom-3 left-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent transform -translate-x-1/2"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
              />
            </div>

            <motion.div
              className="flex justify-center items-center mb-8"
              variants={itemVariants}
            >
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#d4a373] mr-4"></div>
              <span className="text-[#d4a373] font-light tracking-widest text-sm uppercase">
                Serving With Purpose & Passion
              </span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#d4a373] ml-4"></div>
            </motion.div>

            <motion.p
              className="text-lg md:text-xl text-[#555] max-w-3xl mx-auto leading-relaxed font-light mb-2"
              variants={itemVariants}
            >
              Discover the vibrant ministries that form the heartbeat of our church community, 
              each dedicated to serving God and nurturing faith through unique gifts and callings.
            </motion.p>
            
            <motion.p
              className="text-sm text-[#d4a373] font-medium"
              variants={itemVariants}
            >
              {departments.length} active ministries serving our community
            </motion.p>
          </motion.div>

          {/* Enhanced Filter Controls */}
          {categories.length > 1 && (
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 mb-16 px-4"
            >
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  whileHover={{ 
                    y: -3, 
                    scale: 1.05,
                    boxShadow: "0 10px 30px rgba(212, 163, 115, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 border ${
                    activeFilter === category
                      ? "bg-[#d4a373] text-white border-[#d4a373] shadow-2xl shadow-[#d4a373]/40"
                      : "bg-white/90 text-[#555] border-gray-200 hover:bg-[#d4a373]/10 hover:text-[#d4a373] hover:border-[#d4a373]/30"
                  }`}
                >
                  {category}
                  {activeFilter === category && (
                    <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">
                      {category === "All" ? departments.length : departments.filter(d => d.category === category).length}
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Enhanced Departments Grid */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFilter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                {filteredDepartments.length > 0 ? (
                  filteredDepartments.map((dept, idx) => {
                    const imageUrl = dept.image && !imageErrors[dept._id]
                      ? urlFor(dept.image)?.width(500).height(350).quality(80).url()
                      : null;

                    return (
                      <motion.article
                        key={dept._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            delay: isFiltering ? 0 : idx * 0.15,
                            duration: 0.7,
                            ease: "easeOut",
                          },
                        }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        whileHover={{ 
                          scale: 1.03, 
                          y: -8,
                          transition: { duration: 0.3 }
                        }}
                        className="relative group cursor-pointer"
                      >
                        {/* Card Container */}
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white transform transition-all duration-500 group-hover:shadow-3xl">
                          
                          {/* Image Container */}
                          <div className="relative aspect-[4/3] overflow-hidden">
                            {imageUrl ? (
                              <>
                                <Image
                                  src={imageUrl}
                                  alt={dept.title || "Department image"}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                  onError={() => handleImageError(dept._id)}
                                  placeholder="blur"
                                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaUMk6MeobSf//Z"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                              </>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center relative">
                                <span className="text-5xl opacity-30">⛪</span>
                                <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                                  Ministry Image
                                </div>
                              </div>
                            )}

                            {/* Category Badge */}
                            {dept.category && (
                              <motion.span
                                className="absolute top-4 left-4 px-3 py-1 bg-[#d4a373] text-white text-xs rounded-full font-medium shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + idx * 0.1 }}
                              >
                                {dept.category}
                              </motion.span>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>

                          {/* Content */}
                          <div className="p-6 relative">
                            <motion.h3
                              className="text-xl font-serif font-bold text-gray-800 mb-3 line-clamp-2"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.2 + idx * 0.1 }}
                            >
                              {dept.title}
                            </motion.h3>
                            
                            <motion.p
                              className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                            >
                              {dept.excerpt}
                            </motion.p>

                            {/* Action Button */}
                            <motion.div
                              className="flex items-center text-[#d4a373] text-sm font-medium group/btn"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                            >
                              <span className="mr-2">Learn More</span>
                              <span className="transform group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                            </motion.div>
                          </div>

                          {/* Enhanced Hover Effect */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#d4a373]/20 rounded-3xl transition-all duration-500 pointer-events-none" />
                        </div>
                      </motion.article>
                    );
                  })
                ) : (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full text-center py-16"
                  >
                    <div className="text-8xl mb-6 opacity-20">📭</div>
                    <h3 className="text-2xl font-bold text-gray-600 mb-4">No Departments Found</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      {activeFilter === "All" 
                        ? "No departments are currently available. Please check back later."
                        : `No departments found in the "${activeFilter}" category.`
                      }
                    </p>
                    {activeFilter !== "All" && (
                      <button 
                        onClick={() => handleFilterChange("All")}
                        className="px-8 py-3 bg-[#d4a373] text-white rounded-full hover:bg-[#c49567] transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        View All Departments ({departments.length})
                      </button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced Call to Action */}
          {departments.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mt-20 text-center relative overflow-hidden rounded-3xl p-12 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #1e3a5f 0%, #2a4a6e 50%, #1e3a5f 100%)'
              }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }} />
              </div>
              
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Get Involved?
                </h3>
                
                <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Discover where your gifts and passions can serve our church community and glorify God. 
                  Join a ministry today and be part of something greater.
                </p>

                <div className="flex flex-wrap justify-center gap-6">
                  <motion.button
                    className="px-8 py-4 bg-[#d4a373] text-white text-base font-semibold rounded-full hover:bg-[#c49567] transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center group"
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore All Ministries
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
                  
                  <motion.button
                    className="px-8 py-4 bg-transparent border-2 border-white text-white text-base font-semibold rounded-full hover:bg-white/10 transition-all duration-300 flex items-center group"
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Contact Our Team
                    <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                  </motion.button>
                </div>
                
                <motion.p
                  className="text-white/60 text-sm mt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {departments.length} active ministries waiting for you
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default DepartmentsSection;