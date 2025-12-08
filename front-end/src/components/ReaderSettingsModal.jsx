import { Type, Image, Moon, Sun, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog.jsx";
import { Button } from "./ui/button.jsx";
import { Switch } from "./ui/switch.jsx";
import { Label } from "./ui/label.jsx";
import { ScrollArea } from "./ui/scroll-area.jsx";

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>Reader Settings</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-8rem)] px-6 pb-6">
          <div className="space-y-8">
            {/* Font Family */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Type size={18} />
                <h3 className="font-medium">Font Family</h3>
              </div>
              <div className="space-y-2">
                {FONT_FAMILIES.map((font) => (
                  <Button
                    key={font.value}
                    onClick={() => onFontFamilyChange(font.value)}
                    variant={fontFamily === font.value ? "secondary" : "outline"}
                    className="w-full h-auto p-4 justify-between"
                  >
                    <div className="text-left">
                      <div className="font-medium mb-1">{font.label}</div>
                      <div className="text-muted-foreground text-xs">{font.description}</div>
                    </div>
                    <div 
                      className={`text-2xl ${
                        font.value === 'serif' ? "font-['Literata:Regular',_serif]" :
                        font.value === 'sans-serif' ? "font-['Inter:Regular',_sans-serif]" :
                        "font-['Courier_New',_monospace]"
                      }`}
                    >
                      Aa
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Type size={18} />
                <h3 className="font-medium">Font Size</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {FONT_SIZES.map((size) => (
                  <Button
                    key={size.value}
                    onClick={() => onFontSizeChange(size.value)}
                    variant={fontSize === size.value ? "secondary" : "outline"}
                    className="h-auto p-4 flex-col"
                  >
                    <div 
                      className="mb-2"
                      style={{ 
                        fontSize: size.value === 'small' ? '18px' : 
                                 size.value === 'medium' ? '24px' : '32px' 
                      }}
                    >
                      {size.preview}
                    </div>
                    <div className="text-xs">{size.label}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Content Width */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Maximize2 size={18} />
                <h3 className="font-medium">Content Width</h3>
              </div>
              <div className="space-y-2">
                {CONTENT_WIDTHS.map((width) => (
                  <Button
                    key={width.value}
                    onClick={() => onContentWidthChange(width.value)}
                    variant={contentWidth === width.value ? "secondary" : "outline"}
                    className="w-full h-auto p-4 justify-start"
                  >
                    <div className="text-left">
                      <div className="font-medium mb-1">{width.label}</div>
                      <div className="text-muted-foreground text-xs">{width.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Show Images Toggle */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image size={18} />
                <h3 className="font-medium">Images</h3>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="show-images" className="font-medium cursor-pointer">
                    Show images in articles
                  </Label>
                  <p className="text-muted-foreground text-xs mt-1">
                    {showImages ? 'Images visible when online' : 'Text-only mode for faster reading'}
                  </p>
                </div>
                <Switch
                  id="show-images"
                  checked={showImages}
                  onCheckedChange={onShowImagesChange}
                />
              </div>
            </div>

            {/* Reader Theme */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {readerTheme === 'dark' ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )}
                <h3 className="font-medium">Reader Theme</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => onReaderThemeChange('light')}
                  variant={readerTheme === 'light' ? "secondary" : "outline"}
                  className="h-auto p-4 flex-col"
                >
                  <Sun size={24} className="mb-2" />
                  <div>Light</div>
                </Button>
                <Button
                  onClick={() => onReaderThemeChange('dark')}
                  variant={readerTheme === 'dark' ? "secondary" : "outline"}
                  className="h-auto p-4 flex-col"
                >
                  <Moon size={24} className="mb-2" />
                  <div>Dark</div>
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
