/**
 * BulkExportModal.jsx
 * 
 * Description: Modal for exporting all notes and highlights from all articles
 * Purpose: Provides interface for bulk export of all annotations
 */

import { useState } from "react";
import { X, FileText, FileDown, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { toast } from "sonner";

export default function BulkExportModal({
  isOpen,
  onClose,
  onExport,
}) {
  const [selectedFormat, setSelectedFormat] = useState("markdown");
  const [isExporting, setIsExporting] = useState(false);

  const handleFormatChange = (value) => {
    setSelectedFormat(value);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
      toast.success(`All notes exported successfully!`, {
        description: `Exported as ${selectedFormat.toUpperCase()} in a ZIP file`,
      });
      onClose();
    } catch (error) {
      console.error('Bulk export failed:', error);
      toast.error('Export failed', {
        description: error.message || 'There was an error exporting your notes.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown size={20} className="text-primary" />
            <h2 className="text-[18px]">Export All Notes & Highlights</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Description */}
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-[14px] text-muted-foreground">
              This will export all notes and highlights from every article in your library as a ZIP file containing separate files for each article.
            </p>
          </div>

          {/* Export Format */}
          <div>
            <Label className="text-[14px] mb-3 block">Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={handleFormatChange}>
              <div className="space-y-2">
                {/* Markdown Option */}
                <div 
                  className="border border-border p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleFormatChange("markdown")}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="markdown" id="bulk-format-markdown" />
                    <Label htmlFor="bulk-format-markdown" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>Markdown (.md)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Best for note-taking apps</p>
                    </Label>
                  </div>
                </div>

                {/* HTML Option */}
                <div 
                  className="border border-border p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleFormatChange("html")}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="html" id="bulk-format-html" />
                    <Label htmlFor="bulk-format-html" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>HTML (.html)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Web format with styling</p>
                    </Label>
                  </div>
                </div>

                {/* CSV Option */}
                <div 
                  className="border border-border p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleFormatChange("csv")}
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="csv" id="bulk-format-csv" />
                    <Label htmlFor="bulk-format-csv" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>CSV (.csv)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Spreadsheet format for data analysis</p>
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown size={16} className="mr-2" />
                Export All
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
