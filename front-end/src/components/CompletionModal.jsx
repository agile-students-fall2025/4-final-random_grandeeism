import { useState } from "react";
import { X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

export default function CompletionModal({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  itemTitle,
}) {
  const [reflection, setReflection] = useState("");

  const handleComplete = () => {
    onComplete(reflection);
    setReflection("");
  };

  const handleSkip = () => {
    onSkip();
    setReflection("");
  };

  const handleClose = () => {
    onClose();
    setReflection("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Finished Reading?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-[14px] text-muted-foreground mb-2">
              You've reached the end of:
            </p>
            <p className="font-['New_Spirit:Medium',_sans-serif] text-[16px] text-foreground">
              {itemTitle}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reflection" className="text-[14px]">
              Would you like to write a reflection? (Optional)
            </label>
            <Textarea
              id="reflection"
              placeholder="What did you learn? What are your thoughts? Any key takeaways?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <p className="text-[12px] text-muted-foreground">
              This will be saved as a note and the item will be moved to your Archive.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Skip
            </Button>
            <Button
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark as Completed
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
