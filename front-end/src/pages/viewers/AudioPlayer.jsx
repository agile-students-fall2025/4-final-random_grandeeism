/**
 * AudioPlayer.jsx (PodcastViewer)
 * 
 * Description: Placeholder for audio/podcast player
 * Purpose: Informs users about upcoming audio player implementation
 */

import { Music, ArrowLeft } from "lucide-react";

const AudioPlayer = ({ article, onClose }) => {
  const articleTitle = article?.title || "Audio Article";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[16px] sm:text-[20px] font-['New_Spirit:Medium',sans-serif] truncate">
            {articleTitle}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Music className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-['New_Spirit:Medium',sans-serif] mb-4">
            Audio Player Coming Soon
          </h2>

          {/* Description */}
          <div className="space-y-4 text-muted-foreground">
            <p className="text-[15px] sm:text-[16px] leading-relaxed">
              The audio player feature is currently under development and will be available in a future update.
            </p>
            
            <div className="bg-accent/50 border border-border rounded-lg p-6 text-left">
              <h3 className="font-semibold text-foreground mb-3 text-[14px] sm:text-[15px]">
                Planned Features:
              </h3>
              <ul className="space-y-2 text-[13px] sm:text-[14px]">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Full-featured audio player with custom controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Timestamped notes and annotations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Interactive transcript with click-to-seek</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Playback speed controls (0.5x - 2.0x)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Skip forward/backward controls</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Volume controls and progress tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Mobile-optimized responsive design</span>
                </li>
              </ul>
            </div>

            <p className="text-[13px] sm:text-[14px] mt-6">
              Thank you for your patience as we work to bring you the best audio listening experience.
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={onClose}
            className="mt-8 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-[14px] font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
