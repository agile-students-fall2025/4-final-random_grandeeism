/**
 * TextReader.jsx
 * 
 * Description: Full-screen text article reader with enhanced reading experience
 * Purpose: Provides a distraction-free reading view for text-based articles
 * Features:
 *  - Clean, readable typography optimized for long-form content
 *  - Adjustable font size, line height, and column width
 *  - Progress tracking and reading time estimation
 *  - Highlighting and annotation tools
 *  - Text-to-speech capability
 *  - Dark/light mode for comfortable reading
 *  - Bookmark and note-taking functionality
 */

const TextReader = ({ onNavigate }) => {
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
          <h1 className="text-3xl font-bold mb-4">Text Reader</h1>
          <p className="text-muted-foreground">
            Enhanced reading experience for text articles
          </p>
        </div>

        {/* Article Content Area */}
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">Sample Article Title</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Author Name</span>
              <span>•</span>
              <span>10 min read</span>
              <span>•</span>
              <span>March 15, 2024</span>
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">
              This is the text reader view. Features will include:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Clean, distraction-free reading interface</li>
              <li>• Customizable font size and reading width</li>
              <li>• Reading progress indicator</li>
              <li>• Text highlighting and annotations</li>
              <li>• Text-to-speech playback</li>
              <li>• Estimated reading time</li>
              <li>• Dark mode toggle for comfortable reading</li>
              <li>• In-line dictionary and translation</li>
              <li>• Bookmark positions within the article</li>
              <li>• Export to various formats (PDF, EPUB)</li>
            </ul>
          </div>

          {/* Reading Controls Placeholder */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-4">
                <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80">
                  Font Size
                </button>
                <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80">
                  Highlight
                </button>
                <button className="px-4 py-2 bg-accent rounded hover:bg-accent/80">
                  Listen
                </button>
              </div>
              <div className="text-muted-foreground">
                Progress: 0%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextReader;
