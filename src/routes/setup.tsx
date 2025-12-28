import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

function Setup() {
  const { data: rates } = useSuspenseQuery(
    convexQuery(api.rates.getTodayRates, {})
  );
  const setDailyRate = useMutation(api.rates.setDailyRate);
  const router = useRouter();

  const [whiteRate, setWhiteRate] = useState(
    rates.find((r: any) => r.eggType === "White")?.ratePerEgg || ""
  );
  const [brownRate, setBrownRate] = useState(
    rates.find((r: any) => r.eggType === "Brown")?.ratePerEgg || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (whiteRate)
        await setDailyRate({ eggType: "White", rate: Number(whiteRate) });
      if (brownRate)
        await setDailyRate({ eggType: "Brown", rate: Number(brownRate) });

      router.navigate({ to: "/" });
    } catch (err) {
      console.error(err);
      alert("Failed to save rates");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
      <header className="flex items-center gap-4 py-4">
        <Button variant="ghost" size="icon" asChild className="rounded-2xl">
          <Link to="/">
            <ArrowLeft className="size-6 text-gray-600" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-indigo-950">Morning Routine</h1>
      </header>

      <Card className="border-indigo-100 shadow-xl shadow-indigo-50 overflow-visible">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-indigo-900 flex items-center gap-2">
            Set Today's Board Rates
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Default prices for all transactions today.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-tighter ml-1">
                White Egg Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">
                  ₹
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={whiteRate}
                  onChange={(e) => setWhiteRate(e.target.value)}
                  className="pl-10 text-2xl font-black text-indigo-950 h-20"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-500 uppercase tracking-tighter ml-1">
                Brown Egg Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">
                  ₹
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={brownRate}
                  onChange={(e) => setBrownRate(e.target.value)}
                  className="pl-10 text-2xl font-black text-amber-800 h-20"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="pt-4 sticky bottom-4">
              <Button
                type="submit"
                size="xl"
                variant="premium"
                className="w-full shadow-indigo-200"
                disabled={isSaving}
              >
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Check className="size-6 mr-2" /> Finish Daily Setup
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-gray-400 text-xs px-8">
          Rates set here will pre-fill all sales and purchases. You can override
          them for specific customers.
        </p>
      </div>
    </div>
  );
}
