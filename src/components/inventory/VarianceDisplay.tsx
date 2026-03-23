import { CheckCircle2, AlertCircle } from "lucide-react";

interface VarianceDisplayProps {
  varianceTrays: number;
  varianceLoose: number;
}

export function VarianceDisplay({ varianceTrays, varianceLoose }: VarianceDisplayProps) {
  const isMatch = varianceTrays === 0 && varianceLoose === 0;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${isMatch ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
      {isMatch ? (
        <>
          <CheckCircle2 className="size-5 text-green-600" />
          <span className="text-green-700 text-sm font-semibold">Perfect Match ✓</span>
        </>
      ) : (
        <>
          <AlertCircle className="size-5 text-red-600" />
          <span className="text-red-700 text-sm font-medium">
            Variance:{" "}
            {varianceTrays !== 0 && `${varianceTrays > 0 ? "+" : ""}${varianceTrays} trays`}
            {varianceTrays !== 0 && varianceLoose !== 0 && ", "}
            {varianceLoose !== 0 && `${varianceLoose > 0 ? "+" : ""}${varianceLoose} loose`}
          </span>
        </>
      )}
    </div>
  );
}
