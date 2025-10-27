/**
 * VideoPlayer.jsx
 * 
 * Description: Full-featured video player with enhanced viewing controls
 * Purpose: Provides a rich video watching experience for video content
 * Features:
 *  - Custom video player controls (play, pause, seek, volume, fullscreen)
 *  - Playback speed adjustment
 *  - Quality selection (480p, 720p, 1080p, etc.)
 *  - Picture-in-picture mode
 *  - Closed captions/subtitles support
 *  - Keyboard shortcuts for navigation
 *  - Theater and fullscreen modes
 *  - Auto-play next video in queue
 *  - Video bookmarking and timestamps
 */

const VideoPlayer = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => onNavigate && onNavigate('home')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-4">Video Player</h1>
          <p className="text-muted-foreground">
            Enhanced video viewing experience
          </p>
        </div>

        {/* Video Player Card */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Video Display Area */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-6xl mb-4">▶</div>
              <p className="text-lg">Video Player Area</p>
              <p className="text-sm text-gray-400">16:9 Aspect Ratio</p>
            </div>
            
            {/* Player Controls Overlay (bottom) */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="space-y-2">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-1/4 bg-primary"></div>
                </div>
                
                {/* Control Buttons */}
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-4">
                    <button className="hover:opacity-80">▶</button>
                    <button className="hover:opacity-80">⏭</button>
                    <span>5:30 / 20:00</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="hover:opacity-80">CC</button>
                    <button className="hover:opacity-80">⚙</button>
                    <button className="hover:opacity-80">⛶</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="p-6">
            <h2 className="text-2xl font-semibold mb-2">Sample Video Title</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>Channel Name</span>
              <span>•</span>
              <span>1.2K views</span>
              <span>•</span>
              <span>March 18, 2024</span>
            </div>

            {/* Video Controls */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Theater Mode
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                PiP Mode
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Quality: 1080p
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Speed: 1.0x
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Subtitles
              </button>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold mb-3">Description</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Features will include:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Custom video player with full controls</li>
                  <li>• Playback speed adjustment (0.25x - 2x)</li>
                  <li>• Quality selection (auto, 1080p, 720p, 480p)</li>
                  <li>• Picture-in-picture mode for multitasking</li>
                  <li>• Closed captions and subtitle support</li>
                  <li>• Keyboard shortcuts (Space, Arrow keys, F, M, etc.)</li>
                  <li>• Theater mode and fullscreen viewing</li>
                  <li>• Video bookmarks and timestamp notes</li>
                  <li>• Auto-play next video in queue</li>
                  <li>• Frame-by-frame navigation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
