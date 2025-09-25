'use client';

import { useState, useEffect } from "react";
import { client } from "@/app/sanity/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Fetch multiple scriptures (e.g., last 5)
const SCRIPTURE_QUERY = `*[
  _type == "post"
  && category == "wordOfTheDay"
  && defined(slug.current)
  && defined(publishedAt)
]|order(publishedAt desc)[0..4]{
  _id, 
  title, 
  excerpt,
  body
}`;

const ScriptureOfTheDay = () => {
  const [scriptures, setScriptures] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScriptures = async () => {
      try {
        setLoading(true);
        const scriptureData = await client.fetch(SCRIPTURE_QUERY);
        setScriptures(scriptureData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching scriptures:', err);
        setError('Failed to load scriptures');
      } finally {
        setLoading(false);
      }
    };

    fetchScriptures();
  }, []);

  // Function to extract excerpt from body if no excerpt is provided
  const getExcerpt = (body: any[], maxLength: number = 120) => {
    if (!body || !Array.isArray(body)) return 'No scripture content available.';
    
    const plainText = body
      .filter(block => block._type === 'block' && block.children)
      .map(block => block.children.map((child: any) => child.text).join(''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + '...';
  };

  // Navigation functions
  const nextScripture = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === scriptures.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevScripture = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? scriptures.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/80 text-sm">Loading scriptures...</p>
      </div>
    );
  }

  if (error || scriptures.length === 0) {
    return (
      <div className="text-center">
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📖</span>
        </div>
        <h4 className="font-bold mb-2 text-lg">Scripture of the Day</h4>
        <p className="text-white/80 text-sm">
          {error || 'No scriptures available at the moment.'}
        </p>
      </div>
    );
  }

  const currentScripture = scriptures[currentIndex];
  const excerpt = currentScripture.excerpt || getExcerpt(currentScripture.body, 150);

  return (
    <div className="text-center">
      {/* Scripture Content */}
      <div className="mb-4">
        {/* Scripture Icon */}
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📖</span>
        </div>
        
        {/* Title */}
        <h4 className="font-bold mb-3 text-lg leading-tight">
          {currentScripture.title}
        </h4>
        
        {/* Excerpt/Content */}
        <div className="mb-4 min-h-[60px]">
          <p className="text-white/90 text-sm leading-relaxed italic">
            "{excerpt}"
          </p>
        </div>
      </div>

      {/* Navigation Controls - Below the card content */}
      {scriptures.length > 1 && (
        <div className="space-y-3">
          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {scriptures.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-church-gold scale-125' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to scripture ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows and Counter */}
          <div className="flex items-center justify-between px-4">
            <button
              onClick={prevScripture}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 flex items-center justify-center"
              aria-label="Previous scripture"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            
            {/* Counter Display */}
            <span className="text-white/80 text-sm">
              {currentIndex + 1} of {scriptures.length}
            </span>
            
            <button
              onClick={nextScripture}
              className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200 flex items-center justify-center"
              aria-label="Next scripture"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Single scripture message */}
      {scriptures.length === 1 && (
        <p className="text-white/60 text-xs mt-2">
          Updated every Sunday
        </p>
      )}
    </div>
  );
};

export default ScriptureOfTheDay;