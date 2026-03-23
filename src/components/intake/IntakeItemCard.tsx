import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { memo } from "react";

interface IntakeItem {
  product: {
    _id: string;
    name: string;
    eggsPerTray: number;
  };
  qtyTrays: number;
  qtyLoose: number;
  rateApplied: number;
}

interface IntakeItemCardProps {
  item: IntakeItem;
  index: number;
  onUpdate: (index: number, field: string, value: number) => void;
  onRemove: (index: number) => void;
}

export const IntakeItemCard = memo(function IntakeItemCard({ item, index, onUpdate, onRemove }: IntakeItemCardProps) {
  const totalEggs = item.qtyTrays * item.product.eggsPerTray + item.qtyLoose;
  const itemTotal = totalEggs * item.rateApplied;

  return (
    <Card className="border-gray-200">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
            <p className="text-xs text-gray-500">
              {item.product.eggsPerTray} eggs/tray
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Trays
            </label>
            <Input
              type="number"
              placeholder="0"
              value={item.qtyTrays || ""}
              onChange={(e) => onUpdate(index, "qtyTrays", Number(e.target.value))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Loose
            </label>
            <Input
              type="number"
              placeholder="0"
              value={item.qtyLoose || ""}
              onChange={(e) => onUpdate(index, "qtyLoose", Number(e.target.value))}
              className="h-10"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
              Rate/Egg
            </label>
            <Input
              type="number"
              placeholder="0"
              value={item.rateApplied || ""}
              onChange={(e) => onUpdate(index, "rateApplied", Number(e.target.value))}
              className="h-10"
            />
          </div>
        </div>

        {itemTotal > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Total ({totalEggs} eggs)
              </span>
              <span className="font-semibold text-gray-900">₹{itemTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

IntakeItemCard.displayName = "IntakeItemCard";
