'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { client } from "@/app/sanity/client";
import { Download, X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface GalleryImage {
  _id: string;
  title: string;
  image: {
    asset: {
      _id: string;
      url: string;
      metadata: {
        dimensions: {
          width: number;
          height: number;
        };
      };
    };
  };
  publishedAt: string;
  excerpt?: string;
}

// GROQ Query for Gallery posts
const GALLERY_QUERY = `*[
  _type == "post" && 
  category == "gallary" &&
  defined(image.asset) &&
  defined(publishedAt)
] | order(publishedAt desc) {
  _id,
  title,
  image {
    asset->{
      _id,
      url,
      metadata {
        dimensions
      }
    }
  },
  publishedAt,
  excerpt
}`;

const ChurchGallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setLoading(true);
        const galleryData = await client.fetch(GALLERY_QUERY);
        setImages(galleryData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching gallery images:', err);
        setError('Failed to load gallery images');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Download image function
  const downloadImage = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  // Navigation functions for lightbox
  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setSelectedImage(images[(currentIndex + 1) % images.length]);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setSelectedImage(images[(currentIndex - 1 + images.length) % images.length]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, images]);

  if (loading) {
    return (
      <section id="churchgallary" className="py-10 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-church-navy mb-6"
            >
              Church Gallery
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Loading beautiful moments from our church community...
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-2xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="churchgallary" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-church-navy mb-6"
          >
            Church Gallery
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light"
          >
            Capturing precious moments of worship, fellowship, and God&apos;s grace in our church community
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4 text-sm text-gray-500"
          >
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {images.length} Photos
            </span>
            <span>•</span>
            <span>Click to view & download</span>
          </motion.div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Gallery</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-church-gold hover:bg-church-gold/90 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ZoomIn className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Photos Yet</h3>
            <p className="text-gray-600">Check back later for gallery updates</p>
          </div>
        ) : (
          <>
            {/* Gallery Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {images.map((image, index) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group relative cursor-pointer"
                  onClick={() => {
                    setSelectedImage(image);
                    setCurrentIndex(index);
                  }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                    <img
                      src={`${image.image.asset.url}?w=600&h=600&fit=crop`}
                      alt={image.title}
                      className="w-full aspect-square object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                      {/* Icons */}
                      <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 flex space-x-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.image.asset.url, image.title);
                          }}
                          className="bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
                          title="Download Image"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
                          <ZoomIn className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="mt-4 space-y-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-church-gold transition-colors">
                      {image.title}
                    </h3>
                    {image.excerpt && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {image.excerpt}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(image.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Lightbox Modal */}
            <AnimatePresence>
              {selectedImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                  onClick={() => setSelectedImage(null)}
                >
                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 text-white hover:text-church-gold transition-colors z-10"
                  >
                    <X className="w-8 h-8" />
                  </button>

                  {/* Navigation Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-church-gold transition-colors z-10 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-church-gold transition-colors z-10 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full z-10">
                      {currentIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadImage(selectedImage.image.asset.url, selectedImage.title);
                    }}
                    className="absolute bottom-4 right-4 text-white hover:text-church-gold transition-colors z-10 bg-black/50 hover:bg-black/70 p-3 rounded-full"
                    title="Download Image"
                  >
                    <Download className="w-6 h-6" />
                  </button>

                  {/* Image Content */}
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", damping: 25 }}
                    className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={selectedImage.image.asset.url}
                      alt={selectedImage.title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                    
                    {/* Image Info */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
                      <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
                      {selectedImage.excerpt && (
                        <p className="text-gray-300 mb-2">{selectedImage.excerpt}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        {new Date(selectedImage.publishedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
};

export default ChurchGallery;