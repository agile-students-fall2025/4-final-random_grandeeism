/**
 * ExportNotesModal.jsx
 * 
 * Description: Modal for exporting annotations, highlights, and notes from articles
 * Purpose: Provides interface for users to export their notes to various formats and destinations
 * Features:
 *  - Multiple export formats (Markdown, PDF, Plain Text)
 *  - Multiple export destinations (Download, PKM integrations)
 *  - Connected PKM tool detection
 *  - Export confirmation and success feedback
 *  - Grayscale design system compliance
 *  - Flat design with no drop shadows
 */

import { useState } from "react";
import { X, FileText, FileDown, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { toast } from "sonner";

export default function ExportNotesModal({
  isOpen,
  onClose,
  articleTitle,
  onExport,
}) {
  const [selectedFormat, setSelectedFormat] = useState("markdown");
  const [selectedDestination, setSelectedDestination] = useState("download");

  // Mock integration data (from global state in production)
  // const connectedIntegrations = [
  //   { id: "notion", name: "Notion", connected: false },
  //   { id: "obsidian", name: "Obsidian", connected: false },
  //   { id: "logseq", name: "Logseq", connected: false },
  //   { id: "zotero", name: "Zotero", connected: false },
  // ];

  // const activeIntegrations = connectedIntegrations.filter(i => i.connected);

  const handleExport = () => {
    onExport(selectedFormat, selectedDestination);
    
    const formatName = selectedFormat.toUpperCase();
    const destinationName = selectedDestination === "download" 
      ? "your device" 
      : selectedDestination;
    
    toast.success(`Notes exported successfully!`, {
      description: `Exported as ${formatName} to ${destinationName}`,
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      
      {/* Modal (NO shadow-lg!) */}
      <div className="relative bg-background border border-border rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileDown size={20} className="text-primary" />
            <h2 className="text-[18px]">Export Notes</h2>
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
          {/* Article Title */}
          <div className="p-3 bg-accent rounded-lg">
            <p className="text-[12px] text-muted-foreground mb-1">Exporting notes from:</p>
            <p className="text-[14px] line-clamp-2">{articleTitle}</p>
          </div>

          {/* Export Format */}
          <div>
            <Label className="text-[14px] mb-3 block">Export Format</Label>
            <RadioGroup value={selectedFormat} onValueChange={setSelectedFormat}>
              <div className="space-y-2">
                {/* Markdown Option */}
                <div className="border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="markdown" id="format-markdown" />
                    <Label htmlFor="format-markdown" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>Markdown (.md)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Best for note-taking apps</p>
                    </Label>
                  </div>
                </div>

                {/* PDF Option */}
                <div className="border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="pdf" id="format-pdf" />
                    <Label htmlFor="format-pdf" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>PDF (.pdf)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Universal format, read-only</p>
                    </Label>
                  </div>
                </div>

                {/* Plain Text Option */}
                <div className="border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="txt" id="format-txt" />
                    <Label htmlFor="format-txt" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>Plain Text (.txt)</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Simple, unformatted text</p>
                    </Label>
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Export Destination */}
          <div>
            <Label className="text-[14px] mb-3 block">Export To</Label>
            <RadioGroup value={selectedDestination} onValueChange={setSelectedDestination}>
              <div className="space-y-2">
                {/* Download Option */}
                <div className="border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="download" id="dest-download" />
                    <Label htmlFor="dest-download" className="flex-1 cursor-pointer text-[14px]">
                      <div className="flex items-center gap-2">
                        <FileDown size={16} className="text-muted-foreground" />
                        <span>Download File</span>
                      </div>
                      <p className="text-[12px] text-muted-foreground mt-0.5">Save to your device</p>
                    </Label>
                  </div>
                </div>

                {/* Connected Integrations */}
                {/* {activeIntegrations.map(integration => (
                  <div key={integration.id} className="border border-border p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={integration.id} id={`dest-${integration.id}`} />
                      <Label htmlFor={`dest-${integration.id}`} className="flex-1 cursor-pointer text-[14px]">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-muted-foreground" />
                          <span>{integration.name}</span>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Export to your {integration.name} workspace</p>
                      </Label>
                    </div>
                  </div>
                ))} */}

                {/* No Integrations Message */}
                {/* {activeIntegrations.length === 0 && (
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-[13px] text-muted-foreground">
                      No PKM integrations connected. Visit{" "}
                      <button className="text-primary hover:underline">
                        Settings → Knowledge & Linking
                      </button>{" "}
                      to connect Notion, Obsidian, Logseq, or Zotero.
                    </p>
                  </div>
                )} */}
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <FileDown size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
