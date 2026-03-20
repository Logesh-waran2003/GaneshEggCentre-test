import { Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SaleSummaryProps {
  totalAmount: number;
  cashCollectedEnabled: boolean;
  cashCollected: string;
  onCashCollectedEnabledChange: (enabled: boolean) => void;
  onCashCollectedChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function SaleSummary({
  totalAmount,
  cashCollectedEnabled,
  cashCollected,
  onCashCollectedEnabledChange,
  onCashCollectedChange,
  onSubmit,
  isSubmitting,
}: SaleSummaryProps) {
  const cashAmount = cashCollectedEnabled ? Number(cashCollected) || 0 : 0;
  const creditAmount = totalAmount - cashAmount;

  return (
    <footer className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40">
      <div className="max-w-md mx-auto space-y-3">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cashCollectedEnabled}
              onChange={(e) => onCashCollectedEnabledChange(e.target.checked)}
              className="size-4 rounded"
            />
            <label className="text-sm text-gray-700">Cash Collected</label>
          </div>

          {cashCollectedEnabled && (
            <Input
              type="number"
              placeholder="Enter cash amount"
              value={cashCollected}
              onChange={(e) => onCashCollectedChange(e.target.value)}
              className="h-10 bg-white"
            />
          )}

          {cashCollectedEnabled && cashAmount > 0 && (
            <div className="flex justify-between text-sm pt-2 border-t border-indigo-100">
              <span className="text-gray-600">Credit Amount</span>
              <span className={`font-semibold ${creditAmount < 0 ? "text-red-600" : "text-gray-900"}`}>
                ₹{creditAmount.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Button
          size="xl"
          variant="premium"
          className="w-full h-14 text-base font-semibold"
          onClick={onSubmit}
          disabled={isSubmitting || totalAmount === 0}
        >
          {isSubmitting ? "Processing..." : (
            <>
              <Check className="size-5 mr-2" />
              Complete Sale
            </>
          )}
        </Button>
      </div>
    </footer>
  );
}
