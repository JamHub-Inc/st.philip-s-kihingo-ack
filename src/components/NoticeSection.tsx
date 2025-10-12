'use client';

import { useState, useEffect } from "react";
import { client } from "@/app/sanity/client";
import { Bell, Calendar, Clock, AlertCircle, Info, Megaphone } from "lucide-react";

// Types
interface Notice {
  _id: string;
  title: string;
  excerpt?: string;
  body?: any[];
  category: string;
  publishedAt: string;
  image?: any;
  slug?: { current: string };
}

// GROQ Query - Fetch posts with category 'notices'
const NOTICES_QUERY = `*[
  _type == "post" && 
  category == "notices" &&
  defined(title) &&
  defined(publishedAt)
] | order(publishedAt desc) {
  _id,
  title,
  excerpt,
  body,
  category,
  publishedAt,
  image,
  "slug": slug.current
}`;

const NoticesSection = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const noticesData = await client.fetch(NOTICES_QUERY);
        setNotices(noticesData || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching notices:', err);
        setError('Failed to load notices');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Function to extract text from body if no excerpt
  const getDescription = (notice: Notice) => {
    if (notice.excerpt) return notice.excerpt;
    
    if (notice.body && Array.isArray(notice.body)) {
      const plainText = notice.body
        .filter(block => block._type === 'block' && block.children)
        .map(block => block.children.map((child: any) => child.text).join(''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (plainText) {
        return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
      }
    }
    
    return 'No description available';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-48 h-3 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4 border border-gray-200 rounded-xl animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="w-3/4 h-3 bg-gray-200 rounded mb-2"></div>
              <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Church Notices & Announcements</h2>
            <p className="text-blue-100 text-sm">Important updates and reminders for the congregation</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No Notices Available</h3>
            <p className="text-gray-600 text-sm">
              Check back later for church announcements and updates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice._id}
                className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedNotice(notice)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-2">
                    {notice.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-medium ml-2 flex-shrink-0">
                    <Megaphone className="w-3 h-3" />
                    Notice
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-3 leading-relaxed line-clamp-2">
                  {getDescription(notice)}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{getRelativeTime(notice.publishedAt)}</span>
                  </div>
                  <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                    Read more →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <p className="text-xs text-gray-600 text-center">
          {notices.length > 0 
            ? `${notices.length} notice${notices.length !== 1 ? 's' : ''} available • Auto-updates regularly`
            : 'No notices currently available'
          }
        </p>
      </div>

      {/* Modal for detailed view */}
      {selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedNotice.title}</h3>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Posted: {formatDate(selectedNotice.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  <Megaphone className="w-3 h-3" />
                  Church Notice
                </div>
              </div>

              {selectedNotice.image && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={selectedNotice.image.asset?.url} 
                    alt={selectedNotice.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                {selectedNotice.excerpt && (
                  <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4 py-2 mb-4">
                    {selectedNotice.excerpt}
                  </p>
                )}

                {selectedNotice.body && selectedNotice.body.length > 0 ? (
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {selectedNotice.body.map((block, index) => (
                      block._type === 'block' && (
                        <p key={index} className="text-gray-700">
                          {block.children?.map((child: any) => child.text).join('')}
                        </p>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No detailed content available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesSection;