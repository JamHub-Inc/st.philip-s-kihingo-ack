'use client';

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { client } from "@/app/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const GALLERY_QUERY = `*[
  _type 
== "post"  && defined(slug.current)
  && defined(image)
  && category == "department"
]|order(publishedAt desc)[0...12]{
  _id, 
  title, 
  slug, 
  publishedAt,
  excerpt,
  image, 
  body,
  category
}`;

const options = { next: { revalidate: 30 } };

// Initialize the URL builder properly
const builder = imageUrlBuilder({
  projectId: client.config().projectId!,
  dataset: client.config().dataset!,
});

const getImageUrl = (source: SanityImageSource, width: number = 800, height: number = 600) => {
  if (!source) return null;
  try {
    return builder.image(source)
      .width(width)
      .height(height)
      .fit('crop')
      .quality(90)
      .url();
  } catch (error) {
    console.error('Error generating image URL:', error);
    return null;
  }
};

const getExcerpt = (body: any[], maxLength: number = 200) => {
  if (!body || !Array.isArray(body)) return '';
  
  const plainText = body
    .filter(block => block._type === 'block' && block.children)
    .map(block => block.children.map((child: any) => child.text).join(''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText;
};

interface GalleryProps {
  title?: string;
  subtitle?: string;
  description?: string;
  maxItems?: number;
  showExcerpt?: boolean;
  showDate?: boolean;
  category?: string;
}

export default function Gallery({
  title = "Church Department Gallery",
  subtitle = "MINISTRIES & ACTIVITIES",
  description = "Explore the vibrant ministries and activities of our church departments through our visual journey of faith in action.",
  maxItems = 12,
  showExcerpt = true,
  showDate = true,
  category = "department" 
}: GalleryProps) {
  const [posts, setPosts] = React.useState<SanityDocument[]>([]);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const query = `*[
          _type == "post"
          && defined(slug.current)
          && defined(image)
          && category == "${category}"
        ]|order(publishedAt desc)[0...${maxItems}]{
          _id, 
          title, 
          slug, 
          publishedAt,
          excerpt,
          image, 
          body,
          category
        }`;
        
        const fetchedPosts = await client.fetch<SanityDocument[]>(query, {}, options);
        const postsWithImages = fetchedPosts.filter(post => 
          post.image && post.image.asset && post.image.asset._ref
        );
        setPosts(postsWithImages);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load gallery items');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [maxItems, category]); 

  const getAspectClass = (index: number) => {
    const aspects = ['aspect-square', 'aspect-[3/4]', 'aspect-[4/3]'];
    return aspects[index % aspects.length];
  };

  const getColSpan = (index: number) => {
    const spans = ['md:col-span-1', 'md:col-span-1', 'md:col-span-2', 'md:col-span-1'];
    return spans[index % spans.length];
  };

  if (loading) {
    return (
      <section id="gallery" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-church-navy to-blue-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-1/4 mx-auto mb-8"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/20 rounded-xl aspect-square mb-4"></div>
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-3 bg-white/20 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="gallery" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-church-navy to-blue-900">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-serif font-bold text-white mb-4">Error Loading Gallery</h3>
            <p className="text-white/80 font-light">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallary" className="relative w-full py-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-church-navy to-blue-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-church-gold/20"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              width: Math.random() * 8 + 2,
              height: Math.random() * 8 + 2,
              opacity: Math.random() * 0.3 + 0.1,
            }}
            animate={{
              y: [null, (Math.random() - 0.5) * 80],
              x: [null, (Math.random() - 0.5) * 80],
              transition: {
                duration: Math.random() * 15 + 10,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              },
            }}
          />
        ))}
      </div>

      {/* Soft glow effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-church-gold mix-blend-multiply blur-[80px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full bg-blue-600 mix-blend-multiply blur-[90px] animate-pulse-slower"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header with elegant animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <div className="relative inline-block">
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight mb-4"
              initial={{ letterSpacing: "0.2em" }}
              animate={{ letterSpacing: "0.05em" }}
              transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
            >
              <span className="relative">
                <span className="text-church-gold absolute -left-1 -top-1 opacity-30 blur-sm">
                  {title}
                </span>
                Church <span className="text-church-gold">Departments</span>
              </span>
            </motion.h2>
            <motion.div
              className="absolute -bottom-2 left-1/2 w-24 h-px bg-church-gold transform -translate-x-1/2"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            />
          </div>

          <motion.div
            className="flex justify-center items-center mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="w-12 h-px bg-church-gold mr-3"></div>
            <span className="text-white font-light text-sm">
              {subtitle}
            </span>
            <div className="w-12 h-px bg-church-gold ml-3"></div>
          </motion.div>

          <motion.p
            className="text-lg text-white/80 max-w-3xl mx-auto leading-relaxed font-light"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Gallery grid with magical entrance */}
        <div className="relative">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {posts.map((post, index) => {
                const imageUrl = getImageUrl(post.image, 800, 600);
                const excerpt = post.excerpt || getExcerpt(post.body, 200);
                const aspectClass = getAspectClass(index);
                const colSpan = getColSpan(index);

                return (
                  <motion.div
                    key={post._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.1,
                        duration: 0.6,
                        ease: "easeOut",
                      },
                    }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative group overflow-hidden rounded-2xl transition-all duration-500 ${colSpan}`}
                    onMouseEnter={() => setHoveredItem(post._id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <div className={`relative ${aspectClass} overflow-hidden`}>
                      {/* Image with parallax effect */}
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover transition-all duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </motion.div>

                      <motion.div
                        className="absolute inset-0 bg-black/60"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredItem === post._id ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 flex flex-col justify-end p-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredItem === post._id ? 1 : 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        <div className="text-white">
                          <motion.h3
                            className="text-xl font-serif font-bold mb-2 leading-tight drop-shadow-lg"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ 
                              y: hoveredItem === post._id ? 0 : 20, 
                              opacity: hoveredItem === post._id ? 1 : 0 
                            }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                          >
                            {post.title}
                          </motion.h3>
                          
                          {post.category && (
                            <motion.span
                              className="inline-block bg-church-gold text-church-navy text-xs font-bold px-3 py-1 rounded-full mb-3 drop-shadow-lg"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ 
                                y: hoveredItem === post._id ? 0 : 20, 
                                opacity: hoveredItem === post._id ? 1 : 0 
                              }}
                              transition={{ delay: 0.15, duration: 0.3 }}
                            >
                              {post.category === 'wordOfTheDay' ? 'Word of the Day' : 
                               post.category === 'department' ? 'Church Department' : 
                               post.category === 'blog' ? 'Blog Post' : post.category}
                            </motion.span>
                          )}

                          {showExcerpt && excerpt && (
                            <motion.p
                              className="text-sm font-light text-white/90 mb-4 leading-relaxed drop-shadow-lg line-clamp-3"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ 
                                y: hoveredItem === post._id ? 0 : 20, 
                                opacity: hoveredItem === post._id ? 1 : 0 
                              }}
                              transition={{ delay: 0.2, duration: 0.3 }}
                            >
                              {excerpt}
                            </motion.p>
                          )}

                          {showDate && (
                            <motion.p
                              className="text-xs font-medium text-church-gold mb-3 drop-shadow-lg"
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ 
                                y: hoveredItem === post._id ? 0 : 20, 
                                opacity: hoveredItem === post._id ? 1 : 0 
                              }}
                              transition={{ delay: 0.25, duration: 0.3 }}
                            >
                              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </motion.p>
                          )}
                          <motion.div
                            className="absolute bottom-4 right-4"
                            initial={{ y: 10, opacity: 0 }}
                            animate={{
                              y: hoveredItem === post._id ? 0 : 10,
                              opacity: hoveredItem === post._id ? 1 : 0,
                            }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                          >
                            <Link 
                              href={`/${post.slug?.current || '#'}`}
                              className="p-3 bg-church-gold text-church-navy rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 font-semibold"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </Link>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
        {posts.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-serif font-bold text-white mb-4">No Department Posts Yet</h3>
              <p className="text-white/80 font-light">
                Church department posts will appear here once they are published.
              </p>
            </div>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <motion.div
            className="inline-block relative mb-6"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white mb-3 relative z-10">
              Want to Get Involved?
            </h3>
            <motion.div
              className="absolute -bottom-1 left-0 w-full h-1 bg-church-gold z-0"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
            />
          </motion.div>

          <motion.p
            className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Join one of our vibrant church departments and be part of the ministry work.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.a
              href="#gallary"
              className="px-8 py-4 bg-church-gold text-church-navy text-base font-semibold rounded-full hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Departments
            </motion.a>

            <motion.a
              href="#contact"
              className="px-8 py-4 border-2 border-white text-white bg-transparent hover:bg-white hover:text-church-navy text-base font-semibold rounded-full transition-all duration-300 flex items-center"
              whileHover={{ y: -3, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Contact Ministry Leader
            </motion.a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}