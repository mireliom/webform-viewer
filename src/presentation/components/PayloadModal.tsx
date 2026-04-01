import { FileEdit, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@components/ui/dialog";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";

interface PayloadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProviderName: string;
  editableJson: string;
  onJsonChange: (val: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export default function PayloadModal({
  isOpen,
  onOpenChange,
  selectedProviderName,
  editableJson,
  onJsonChange,
  onSave,
  isSaving = false,
}: PayloadModalProps) {
  // Validate JSON format to provide visual feedback and prevent invalid saves
  const isInvalidJson = (() => {
    try {
      JSON.parse(editableJson);
      return false;
    } catch {
      return true;
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-[95vw] h-[80vh] p-0 flex flex-col bg-white border-none shadow-2xl overflow-hidden z-[100]">
        <DialogHeader className="px-8 py-6 border-b flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Payload Editor:{" "}
            <span className="font-normal text-slate-500">
              {selectedProviderName}
            </span>
          </DialogTitle>
          {/* Draft Mode Badge */}
          <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Draft Mode
          </div>
        </DialogHeader>

        <div className="flex-1 p-8 bg-slate-50 relative">
          <Textarea
            className={`w-full h-full font-mono text-xs p-6 bg-[#0a0a0a] border-none rounded-xl resize-none shadow-inner focus-visible:ring-0 ${
              isInvalidJson ? "text-red-400" : "text-emerald-400"
            }`}
            value={editableJson}
            onChange={(e) => onJsonChange(e.target.value)}
            spellCheck={false}
          />
          {/* Visual warning for invalid JSON */}
          {isInvalidJson && (
            <span className="absolute bottom-12 right-12 text-red-500 text-[10px] font-bold bg-red-950/90 px-3 py-1.5 rounded-md shadow-lg">
              INVALID JSON FORMAT
            </span>
          )}
        </div>

        <DialogFooter className="px-8 py-4 border-t bg-white flex flex-row justify-end gap-2 sm:justify-end">
          <Button
            variant="ghost"
            className="font-bold text-slate-500 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            className="font-black bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
            onClick={onSave}
            disabled={isInvalidJson || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Draft"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
