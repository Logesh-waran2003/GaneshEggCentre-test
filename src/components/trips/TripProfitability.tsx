import { Card, CardContent } from "../ui/card";

interface TripProfitabilityProps {
  profitability: {
    totalCash: number;
    totalExpenses: number;
    profit: number;
    byEmployee: Record<string, { name: string; expenses: number }>;
  } | null;
}

export function TripProfitability({ profitability }: TripProfitabilityProps) {
  if (!profitability) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Profitability</h2>
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Cash</span>
            <span className="font-semibold text-gray-900">
              ₹{profitability.totalCash.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Expenses</span>
            <span className="font-semibold text-gray-900">
              ₹{profitability.totalExpenses.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t border-indigo-100">
            <span className="text-sm font-bold text-gray-700">Net Profit</span>
            <span className={`text-lg font-bold ${profitability.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ₹{profitability.profit.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
