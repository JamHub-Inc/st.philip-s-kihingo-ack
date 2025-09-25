'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when user scrolls down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", toggleVisibility);
    
    // Clean up function
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: "smooth" 
    });
  };

  const scrollToTopInstant = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: "auto" 
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          key="scroll-to-top"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 500,
            damping: 30
          }}
          onClick={scrollToTop}
          onDoubleClick={scrollToTopInstant}
          className="fixed bottom-16 right-6 z-50 bg-church-gold hover:bg-yellow-600 text-white p-3 rounded-full shadow-lg border-2 border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
          aria-label="Scroll to top"
          title="Scroll to top (Double click for instant)"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;