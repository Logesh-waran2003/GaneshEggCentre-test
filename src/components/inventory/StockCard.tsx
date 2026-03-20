import { memo } from "react";
import { Card, CardContent } from "../ui/card";

interface StockCardProps {
  name: string;
  currentStockQtyTrays: number;
  currentStockQtyLoose: number;
}

export const StockCard = memo(function StockCard({ name, currentStockQtyTrays, currentStockQtyLoose }: StockCardProps) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-3">{name}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-indigo-50 rounded-xl p-3">
            <p className="text-indigo-600 text-xs font-medium mb-1 uppercase tracking-wider">Trays</p>
            <p className="text-3xl font-bold text-indigo-950">{currentStockQtyTrays}</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3">
            <p className="text-violet-600 text-xs font-medium mb-1 uppercase tracking-wider">Loose Eggs</p>
            <p className="text-3xl font-bold text-violet-950">{currentStockQtyLoose}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
