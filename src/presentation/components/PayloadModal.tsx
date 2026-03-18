import { FileEdit } from "lucide-react";
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
}

export default function PayloadModal({
  isOpen,
  onOpenChange,
  selectedProviderName,
  editableJson,
  onJsonChange,
  onSave,
}: PayloadModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-[95vw] h-[80vh] p-0 flex flex-col bg-white border-none shadow-2xl overflow-hidden z-[100]">
        <DialogHeader className="px-8 py-6 border-b">
          <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
            <FileEdit className="w-5 h-5" />
            Payload Editor:{" "}
            <span className="font-normal text-slate-500">
              {selectedProviderName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-8 bg-slate-50">
          <Textarea
            className="w-full h-full font-mono text-xs p-6 bg-[#0a0a0a] text-emerald-400 border-none rounded-xl resize-none shadow-inner focus-visible:ring-0"
            value={editableJson}
            onChange={(e) => onJsonChange(e.target.value)}
          />
        </div>

        <DialogFooter className="px-8 py-4 border-t bg-white flex flex-row justify-end gap-2 sm:justify-end">
          <Button
            variant="ghost"
            className="font-bold text-slate-500 hover:bg-slate-50"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="font-black text-blue-600 hover:bg-blue-50"
            onClick={onSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
