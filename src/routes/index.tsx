import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  ShoppingCart,
  Wallet,
  PlusCircle,
  Users,
  Package,
  ChevronRight,
} from "lucide-react";
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { api } from "../../convex/_generated/api";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: stats } = useSuspenseQuery(
    convexQuery(api.transactions.getDashboardStats, {})
  );
  const { data: rates } = useSuspenseQuery(
    convexQuery(api.rates.getTodayRates, {})
  );

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-950">
            EggFlow
          </h1>
          <p className="text-gray-500 font-medium">Ganesh Egg Centre</p>
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
        <div className="grid grid-cols-2 gap-3">
          {rates.map((rate: any) => (
            <Card key={rate.id} className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-4 flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">
                  {rate.eggType} Egg
                </span>
                <span className="text-2xl font-black text-indigo-950">
                  ₹{rate.ratePerEgg}
                </span>
              </CardContent>
            </Card>
          ))}
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

      {/* Quick Actions - Thumb Zone */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Button
            asChild
            size="xl"
            variant="premium"
            className="h-32 flex-col gap-2 shadow-indigo-100"
          >
            <Link to="/sales/new">
              <div className="bg-white/20 p-2 rounded-xl mb-1">
                <ShoppingCart className="size-6" />
              </div>
              <span>New Sale</span>
            </Link>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="h-32 flex-col gap-2 border-2 text-indigo-950 hover:bg-indigo-50 border-indigo-50"
          >
            <Link to="/intake/new">
              <div className="bg-indigo-50 p-2 rounded-xl mb-1">
                <PlusCircle className="size-6 text-indigo-600" />
              </div>
              <span>Add Intake</span>
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 mt-1">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full justify-between px-6 border-gray-100 shadow-sm hover:border-indigo-200"
          >
            <Link to="/ledger">
              <div className="flex items-center gap-3">
                <Wallet className="size-5 text-emerald-500" />
                <span className="text-gray-800">Customer Ledgers (Khata)</span>
              </div>
              <ChevronRight className="size-5 text-gray-400" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full justify-between px-6 border-gray-100 shadow-sm hover:border-indigo-200"
          >
            <Link to="/contacts">
              <div className="flex items-center gap-3">
                <Users className="size-5 text-blue-500" />
                <span className="text-gray-800">Manage Contacts</span>
              </div>
              <ChevronRight className="size-5 text-gray-400" />
            </Link>
          </Button>
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
        className
      )}
    >
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
