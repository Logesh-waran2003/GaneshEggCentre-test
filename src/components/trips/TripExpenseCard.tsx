import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

interface TripExpense {
  _id: string;
  amount: number;
  description: string;
  employeeName: string;
}

interface TripExpenseCardProps {
  expense: TripExpense;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

export function TripExpenseCard({ expense, onDelete, canDelete }: TripExpenseCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold text-gray-900">₹{expense.amount.toFixed(2)}</div>
          <div className="text-sm text-gray-600">{expense.description}</div>
          <div className="text-xs text-gray-500">{expense.employeeName}</div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(expense._id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
