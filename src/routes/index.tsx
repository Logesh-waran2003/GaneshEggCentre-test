import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../components/ui/card";
import { EggLoader } from "../components/ui/EggLoader";

import { TrendingUp, ShoppingCart, Package } from "lucide-react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";
import { requireAuth } from "../lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: requireAuth,
  component: Home,
  ssr: false,
  pendingComponent: () => (
    <div className="h-full min-h-[50vh] flex items-center justify-center safe-area-inset">
      <EggLoader text="Cracking fresh data..." />
    </div>
  ),
});

function Home() {
  const { data: stats } = useSuspenseQuery(
    convexQuery(api.transactions.getDashboardStats, {}),
  );
  const { data: rates } = useSuspenseQuery(
    convexQuery(api.rates.getTodayRates, {}),
  );
  const { data: products } = useSuspenseQuery(
    convexQuery(api.products.getProducts, {}),
  );
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const { data: todayExpenses } = useSuspenseQuery(
    convexQuery(api.expenses.getDailyTotal, {
      date: today.getTime(),
    }),
  );

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto min-h-screen pb-32">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-950">
            Ganesh Egg Centre
          </h1>
          <p className="text-gray-500 font-medium">Wholesale & Supply</p>
        </div>
        <div className="bg-indigo-100 p-3 rounded-2xl">
          <Package className="text-indigo-600 size-6" />
        </div>
      </header>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-none shadow-xl shadow-indigo-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1 uppercase tracking-wider">
                  Today's Sales
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">
                    ₹{stats.totalSalesAmount.toLocaleString()}
                  </span>
                  <Badge
                    variant="success"
                    className="bg-white/20 text-white border-none backdrop-blur-md"
                  >
                    <TrendingUp className="size-3 mr-1" /> {stats.salesCount}{" "}
                    Deals
                  </Badge>
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                <ShoppingCart className="size-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div>
                <p className="text-indigo-100 text-xs mb-1 uppercase tracking-wider">
                  Cash Collected
                </p>
                <p className="text-xl font-bold">
                  ₹{stats.totalPaymentsAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-indigo-100 text-xs mb-1 uppercase tracking-wider">
                  Trays Sold
                </p>
                <p className="text-xl font-bold">
                  {stats.totalTraysSold} Trays
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-600 to-pink-700 text-white border-none shadow-xl shadow-rose-200">
          <CardContent className="p-6">
            <p className="text-rose-100 text-sm font-medium mb-1 uppercase tracking-wider">
              Today's Expenses
            </p>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-bold">
                ₹{todayExpenses.toLocaleString()}
              </span>
              <Link to="/expenses" className="text-white/80 text-sm font-bold hover:text-white">
                View →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rates Section */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="size-4 text-indigo-600" /> Daily Board Rates
          </h2>
          <Link to="/setup" className="text-sm font-semibold text-indigo-600">
            Update
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {rates
            .filter((rate: any) => rate.ratePerEgg > 0 || rate.ratePerTray > 0)
            .map((rate: any) => {
              const product = products.find((p) => p._id === rate.productId);
              if (!product) return null;
              return (
                <Card
                  key={rate._id}
                  className="bg-white border-gray-100 shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">
                        {product.name}
                      </span>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Per Egg</div>
                          <div className="text-lg font-black text-indigo-950">
                            ₹{rate.ratePerEgg}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400">Per Tray</div>
                          <div className="text-lg font-black text-indigo-950">
                            ₹{rate.ratePerTray}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          {rates.length === 0 && (
            <div className="col-span-2 text-center py-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 text-sm font-medium">
                No rates set for today
              </p>
              <Link
                to="/setup"
                className="text-indigo-600 text-sm font-bold mt-2 inline-block"
              >
                Set Morning Rates
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Spacing for mobile nav or safe area */}
      <div className="h-10" />
    </div>
  );
}

function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  const variants: Record<string, string> = {
    default: "bg-indigo-100 text-indigo-700",
    success: "bg-emerald-100 text-emerald-700",
    white: "bg-white/20 text-white backdrop-blur-md",
  };
  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
