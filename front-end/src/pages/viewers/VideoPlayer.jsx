/**
 * VideoPlayer.jsx (VideoViewer)
 * 
 * Description: Placeholder for video player functionality
 * Purpose: Coming soon
 */

import { Video, ArrowLeft } from "lucide-react";

const VideoPlayer = ({ article, onUpdateArticle, onClose }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-[20px] font-['New_Spirit:Medium',_sans-serif]">
              {article?.title || "Video Player"}
            </h1>
          </div>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="pt-20 flex items-center justify-center min-h-screen">
        <div className="max-w-2xl w-full mx-auto p-8">
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-accent rounded-full">
                <Video className="w-16 h-16 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Video Player Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              The video player functionality is currently under development. 
              Check back soon for the full video viewing experience with annotations and notes.
            </p>
            <div className="flex flex-col gap-2 text-left text-sm text-muted-foreground bg-accent/50 p-4 rounded-lg">
              <p>• YouTube video integration</p>
              <p>• Timestamped annotations</p>
              <p>• Interactive transcript</p>
              <p>• Custom playback controls</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
