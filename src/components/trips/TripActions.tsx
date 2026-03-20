import { Check, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface TripActionsProps {
  status: string;
  isAdmin: boolean;
  isAssigned: boolean;
  onApproveStart: () => void;
  onComplete: () => void;
  onApproveEnd: () => void;
  onAddExpense: () => void;
}

export function TripActions({
  status,
  isAdmin,
  isAssigned,
  onApproveStart,
  onComplete,
  onApproveEnd,
  onAddExpense,
}: TripActionsProps) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Actions</h2>
      <div className="space-y-3">
        {status === "PENDING" && isAdmin && (
          <Button
            size="xl"
            variant="premium"
            className="w-full"
            onClick={onApproveStart}
          >
            <Check className="size-5 mr-2" />
            Approve & Start Trip
          </Button>
        )}

        {status === "IN_PROGRESS" && isAssigned && (
          <Button
            size="xl"
            variant="premium"
            className="w-full"
            onClick={onComplete}
          >
            <Check className="size-5 mr-2" />
            Complete Trip
          </Button>
        )}

        {status === "COMPLETED" && isAdmin && (
          <Button
            size="xl"
            variant="premium"
            className="w-full"
            onClick={onApproveEnd}
          >
            <Check className="size-5 mr-2" />
            Approve & Close Trip
          </Button>
        )}

        {(status === "IN_PROGRESS" || status === "COMPLETED") && (isAdmin || isAssigned) && (
          <Button
            size="xl"
            variant="outline"
            className="w-full"
            onClick={onAddExpense}
          >
            <Plus className="size-5 mr-2" />
            Add Expense
          </Button>
        )}
      </div>
    </section>
  );
}
