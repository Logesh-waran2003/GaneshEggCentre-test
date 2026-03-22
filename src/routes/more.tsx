import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../contexts/AuthContext";
import { useFeature } from "../hooks/useFeature";
import { Button } from "../components/ui/button";
import {
  User,
  Settings as SettingsIcon,
  ShoppingBag,
  PlusCircle,
  Wallet,
  Users,
  Package,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Briefcase,
  Truck,
  Receipt,
  ClipboardList,
} from "lucide-react";

export const Route = createFileRoute("/more")({
  component: MorePage,
});

function MorePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const canManageUsers = useFeature("userManagement");
  const canManageTrips = useFeature("adminTrips");
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50 pb-36 overflow-y-auto safe-area-inset">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white px-6 pt-12 pb-24 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 right-10 size-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 size-64 bg-violet-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 shadow-lg ring-4 ring-white/10">
            <User className="size-10 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            {currentUser?.name}
          </h1>
          <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <ShieldCheck className="size-3.5" />
            <span className="text-xs font-bold tracking-wider uppercase">
              {currentUser?.role}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-16 relative z-20 flex flex-col gap-6">
        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
            <Briefcase className="size-4" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button
              asChild
              size="xl"
              className="h-28 flex-col gap-3 bg-white text-indigo-950 hover:bg-indigo-50 border-0 shadow-sm rounded-2xl"
            >
              <Link to="/sales/new" search={{ tripId: undefined }}>
                <div className="bg-indigo-100 p-2.5 rounded-xl">
                  <ShoppingBag className="size-6 text-indigo-600" />
                </div>
                <span className="font-semibold">New Sale</span>
              </Link>
            </Button>
            <Button
              asChild
              size="xl"
              className="h-28 flex-col gap-3 bg-white text-indigo-950 hover:bg-indigo-50 border-0 shadow-sm rounded-2xl"
            >
              <Link to="/intake/new">
                <div className="bg-violet-100 p-2.5 rounded-xl">
                  <PlusCircle className="size-6 text-violet-600" />
                </div>
                <span className="font-semibold">New Purchase</span>
              </Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
            {isAdmin && (
              <Link
                to="/ledger"
                className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <Wallet className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Customer Ledgers</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage payments & balance</p>
                </div>
                <ChevronRight className="size-5 text-gray-300" />
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/inventory"
                className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                  <Package className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Inventory</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Stock check & history</p>
                </div>
                <ChevronRight className="size-5 text-gray-300" />
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/products"
                className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                  <Package className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Products</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage items & prices</p>
                </div>
                <ChevronRight className="size-5 text-gray-300" />
              </Link>
            )}

            <Link
              to="/contacts"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Users className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Contacts</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage suppliers & clients</p>
              </div>
              <ChevronRight className="size-5 text-gray-300" />
            </Link>

            <Link
              to="/sales"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <ClipboardList className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Sales</h3>
                <p className="text-xs text-gray-500 mt-0.5">View & manage sales</p>
              </div>
              <ChevronRight className="size-5 text-gray-300" />
            </Link>

            <Link
              to="/trips"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                <Truck className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Trips</h3>
                <p className="text-xs text-gray-500 mt-0.5">View & manage trips</p>
              </div>
              <ChevronRight className="size-5 text-gray-300" />
            </Link>

            <Link
              to="/expenses"
              className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <Receipt className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Expenses</h3>
                <p className="text-xs text-gray-500 mt-0.5">Track & record expenses</p>
              </div>
              <ChevronRight className="size-5 text-gray-300" />
            </Link>
          </div>
        </section>

        {/* Admin only */}
        {(canManageUsers || canManageTrips) && (
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
              <SettingsIcon className="size-4" /> Administration
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 divide-y divide-gray-50">
              {canManageUsers && (
                <Link
                  to="/users"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                    <Users className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">User Management</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Create & manage accounts</p>
                  </div>
                  <ChevronRight className="size-5 text-gray-300" />
                </Link>
              )}

              {canManageTrips && (
                <Link
                  to="/admin-trips"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                    <Truck className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">Trip Management</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Approve & monitor trips</p>
                  </div>
                  <ChevronRight className="size-5 text-gray-300" />
                </Link>
              )}
            </div>
          </section>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 p-4 h-auto rounded-2xl"
          onClick={async () => {
            await logout();
            navigate({ to: "/login" });
          }}
        >
          <div className="bg-red-100 p-2 rounded-lg mr-4">
            <LogOut className="size-5" />
          </div>
          <div className="text-left">
            <h3 className="font-medium">Log Out</h3>
            <p className="text-xs opacity-70">End your session</p>
          </div>
        </Button>
      </div>
    </div>
  );
}
