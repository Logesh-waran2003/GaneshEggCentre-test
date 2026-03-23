import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

interface SaleConfirmDialogProps {
  open: boolean;
  message: string;
  isSubmitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

interface SaleErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export function SaleConfirmDialog({ open, message, isSubmitting, onConfirm, onCancel }: SaleConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Sale</DialogTitle>
        </DialogHeader>
        <p className="text-gray-600">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SaleErrorDialog({ open, message, onClose }: SaleErrorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
        </DialogHeader>
        <p className="text-red-600">{message}</p>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
