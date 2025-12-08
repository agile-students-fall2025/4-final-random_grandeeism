/**
 * VideoPlayer.jsx (VideoViewer)
 * 
 * Description: YouTube video player with embedded video
 * Purpose: Display YouTube videos with title and embedded player
 */

import { Video, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button.jsx";
import { Skeleton } from "../../components/ui/skeleton.jsx";

const VideoPlayer = ({ article, onClose }) => {
  const articleTitle = article?.title || "Video Article";
  const videoId = article?.videoId;
  const url = article?.url;

  // Debug logging
  console.log('VideoPlayer - article data:', article);
  console.log('VideoPlayer - videoId:', videoId);
  console.log('VideoPlayer - url:', url);

  // Show loading state if article hasn't loaded yet
  if (!article) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="sticky top-0 z-50 bg-background border-b border-border">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4">
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
        <div className="flex-1 p-4 sm:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract video ID from URL if not already provided
  const getVideoId = () => {
    if (videoId) return videoId;
    
    if (!url) return null;

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  };

  const embedVideoId = getVideoId();
  const embedUrl = embedVideoId ? `https://www.youtube.com/embed/${embedVideoId}` : null;

  // Debug logging
  console.log('VideoPlayer - embedVideoId:', embedVideoId);
  console.log('VideoPlayer - embedUrl:', embedUrl);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[16px] sm:text-[20px] font-['New_Spirit:Medium',sans-serif] truncate">
            {articleTitle}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          {embedUrl ? (
            <>
              {/* Video Player */}
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src={embedUrl}
                  title={articleTitle}
                  className="test22223333 absolute top-0 left-0 w-full h-full rounded-lg border border-border"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Video Info */}
              <div className="mt-6 space-y-4">
                <h2 className="text-2xl sm:text-3xl font-['New_Spirit:Medium',sans-serif]">
                  {articleTitle}
                </h2>
                
                {article?.source && (
                  <p className="text-muted-foreground">
                    Source: {article.source}
                  </p>
                )}

                {article?.dateAdded && (
                  <p className="text-sm text-muted-foreground">
                    Added: {new Date(article.dateAdded).toLocaleDateString()}
                  </p>
                )}

                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-block"
                  >
                    Watch on YouTube →
                  </a>
                )}
              </div>
            </>
          ) : (
            /* Fallback if no video ID */
            <div className="text-center py-12">
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-primary" />
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-['New_Spirit:Medium',sans-serif] mb-4">
                Video Not Available
              </h2>

              <p className="text-muted-foreground mb-6">
                Could not extract video ID from the URL. Please ensure this is a valid YouTube link.
              </p>

              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] font-medium transition-colors"
                >
                  Open Original Link
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
