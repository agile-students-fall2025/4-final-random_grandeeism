/**
 * AudioPlayer.jsx
 * 
 * Description: Dedicated audio/podcast player with full playback controls
 * Purpose: Provides a rich listening experience for audio content and podcasts
 * Features:
 *  - Full-featured audio player with standard controls (play, pause, skip, volume)
 *  - Playback speed adjustment (0.5x to 2x)
 *  - Chapter markers and navigation for podcasts
 *  - Sleep timer and auto-play next episode
 *  - Download for offline listening
 *  - Transcript display with synchronized highlighting
 *  - Show notes and episode descriptions
 *  - Playlist and queue management
 */

const AudioPlayer = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => onNavigate && onNavigate('home')}
            className="text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to Home
          </button>
          <h1 className="text-3xl font-bold mb-4">Audio Player</h1>
          <p className="text-muted-foreground">
            Full-featured podcast and audio player
          </p>
        </div>

        {/* Player Card */}
        <div className="bg-card border border-border rounded-lg p-8">
          {/* Album Art / Cover */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-full md:w-64 h-64 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Album Art</span>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">Episode Title or Audio Name</h2>
              <p className="text-lg text-muted-foreground mb-4">Podcast Name / Author</p>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Duration: 45:30</p>
                <p>Published: March 20, 2024</p>
              </div>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-primary"></div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>15:20</span>
                <span>45:30</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-6">
              <button className="w-10 h-10 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center">
                ⏮
              </button>
              <button className="w-14 h-14 rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center text-2xl">
                ▶
              </button>
              <button className="w-10 h-10 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center">
                ⏭
              </button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                1.0x Speed
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Sleep Timer
              </button>
              <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80 text-sm">
                Chapters
              </button>
            </div>
          </div>

          {/* Show Notes */}
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="font-semibold mb-3">Show Notes</h3>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Features will include:</p>
              <ul className="space-y-1 ml-4">
                <li>• Playback controls (play, pause, skip, volume)</li>
                <li>• Variable speed playback (0.5x - 2x)</li>
                <li>• Chapter navigation for podcasts</li>
                <li>• Sleep timer and auto-play</li>
                <li>• Download for offline listening</li>
                <li>• Synchronized transcript display</li>
                <li>• Queue and playlist management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
