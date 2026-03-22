import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "../components/ui/card";
import { EggLoader } from "../components/ui/EggLoader";
import { TrendingUp, ShoppingCart, Package, Users, Truck, Receipt, BarChart3, ShoppingBag, Wallet } from "lucide-react";
import { useDashboardStats } from "../api/transactions";
import { useTodayRates } from "../api/rates";
import { useProducts } from "../api/products";
import { useDailyExpenseTotal } from "../api/expenses";
import { requireAuth } from "../lib/auth";
import { useAuth } from "../contexts/AuthContext";

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
  const { token, currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";
  const { data: stats } = useDashboardStats();
  const { data: rates } = useTodayRates();
  const { data: products } = useProducts();

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const { data: todayExpenses } = useDailyExpenseTotal(token!, today.getTime());

  return (
    <div className="p-4 safe-area-inset flex flex-col gap-6 max-w-md mx-auto pb-8">
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
                ₹{(todayExpenses ?? 0).toLocaleString()}
              </span>
              <Link to="/expenses" className="text-white/80 text-sm font-bold hover:text-white">
                View →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/sales/new"
            search={{ tripId: undefined }}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-indigo-100 p-3 rounded-full">
              <ShoppingBag className="size-6 text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">New Sale</span>
          </Link>
          <Link
            to="/contacts"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="size-6 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">Contacts</span>
          </Link>
          <Link
            to="/trips"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-purple-100 p-3 rounded-full">
              <Truck className="size-6 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">Trips</span>
          </Link>
          {isAdmin && (
          <Link
            to="/inventory"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-amber-100 p-3 rounded-full">
              <BarChart3 className="size-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">Stock</span>
          </Link>
          )}
          <Link
            to="/expenses"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-rose-100 p-3 rounded-full">
              <Receipt className="size-6 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">Expenses</span>
          </Link>
          {isAdmin && (
          <Link
            to="/ledger"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="bg-green-100 p-3 rounded-full">
              <Wallet className="size-6 text-green-600" />
            </div>
            <span className="text-xs font-bold text-gray-700 text-center">Ledger</span>
          </Link>
          )}
        </div>
      </section>

      {/* Rates Section */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="size-4 text-indigo-600" /> Daily Board Rates
          </h2>
          {isAdmin && (
            <Link to="/setup" className="text-sm font-semibold text-indigo-600">
              Update
            </Link>
          )}
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
