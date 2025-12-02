import { X, Type, Image, Moon, Sun, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// Ensure `motion` is referenced for linters that don't detect JSX usage
void motion;

const FONT_FAMILIES = [
  { value: 'serif', label: 'Serif', description: 'Traditional, easy to read' },
  { value: 'sans-serif', label: 'Sans Serif', description: 'Modern, clean' },
  { value: 'mono', label: 'Monospace', description: 'Code-friendly' },
];

const FONT_SIZES = [
  { value: 'small', label: 'Small', preview: 'Aa' },
  { value: 'medium', label: 'Medium', preview: 'Aa' },
  { value: 'large', label: 'Large', preview: 'Aa' },
];

const CONTENT_WIDTHS = [
  { value: 'narrow', label: 'Narrow', description: '600px - Focused reading' },
  { value: 'normal', label: 'Normal', description: '750px - Comfortable' },
  { value: 'wide', label: 'Wide', description: '900px - Spacious' },
  { value: 'full', label: 'Full', description: 'Full width - Maximum' },
];

export default function ReaderSettingsModal({
  isOpen,
  onClose,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  showImages,
  onShowImagesChange,
  readerTheme,
  onReaderThemeChange,
  contentWidth,
  onContentWidthChange,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div 
          className="relative w-full sm:w-[500px] max-h-[85vh] bg-background border border-border sm:rounded-lg rounded-t-lg overflow-hidden flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-foreground">Reader Settings</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              <X size={20} className="text-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Font Family */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Type size={18} className="text-foreground" />
                <h3 className="text-foreground">Font Family</h3>
              </div>
              <div className="space-y-2">
                {FONT_FAMILIES.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => onFontFamilyChange(font.value)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      fontFamily === font.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground mb-1">{font.label}</div>
                        <div className="text-muted-foreground text-[12px]">{font.description}</div>
                      </div>
                      <div 
                        className={`text-foreground ${
                          font.value === 'serif' ? "font-['Literata:Regular',_serif]" :
                          font.value === 'sans-serif' ? "font-['Inter:Regular',_sans-serif]" :
                          "font-['Courier_New',_monospace]"
                        }`}
                        style={{ fontSize: '24px' }}
                      >
                        Aa
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Type size={18} className="text-foreground" />
                <h3 className="text-foreground">Font Size</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => onFontSizeChange(size.value)}
                    className={`p-4 border rounded-lg transition-all ${
                      fontSize === size.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div 
                      className="text-foreground mb-2"
                      style={{ 
                        fontSize: size.value === 'small' ? '18px' : 
                                 size.value === 'medium' ? '24px' : '32px' 
                      }}
                    >
                      {size.preview}
                    </div>
                    <div className="text-muted-foreground text-[12px]">{size.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Width */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 size={18} className="text-foreground" />
                <h3 className="text-foreground">Content Width</h3>
              </div>
              <div className="space-y-2">
                {CONTENT_WIDTHS.map((width) => (
                  <button
                    key={width.value}
                    onClick={() => onContentWidthChange(width.value)}
                    className={`w-full p-4 border rounded-lg text-left transition-all ${
                      contentWidth === width.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground mb-1">{width.label}</div>
                        <div className="text-muted-foreground text-[12px]">{width.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Show Images Toggle */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image size={18} className="text-foreground" />
                <h3 className="text-foreground">Images</h3>
              </div>
              <button
                onClick={() => onShowImagesChange(!showImages)}
                className="w-full p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent transition-all flex items-center justify-between"
              >
                <div className="text-left">
                  <div className="text-foreground mb-1">Show images in articles</div>
                  <div className="text-muted-foreground text-[12px]">
                    {showImages ? 'Images visible when online' : 'Text-only mode for faster reading'}
                  </div>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    showImages ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showImages ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Reader Theme */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {readerTheme === 'dark' ? (
                  <Moon size={18} className="text-foreground" />
                ) : (
                  <Sun size={18} className="text-foreground" />
                )}
                <h3 className="text-foreground">Reader Theme</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onReaderThemeChange('light')}
                  className={`p-4 border rounded-lg transition-all ${
                    readerTheme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <Sun size={24} className="text-foreground mb-2 mx-auto" />
                  <div className="text-foreground text-center">Light</div>
                </button>
                <button
                  onClick={() => onReaderThemeChange('dark')}
                  className={`p-4 border rounded-lg transition-all ${
                    readerTheme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-accent'
                  }`}
                >
                  <Moon size={24} className="text-foreground mb-2 mx-auto" />
                  <div className="text-foreground text-center">Dark</div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
