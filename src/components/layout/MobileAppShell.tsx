import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Workbox } from "workbox-window";
import {
  Home,
  PlusCircle,
  Receipt,
  Users,
  Package,
  Truck,
  ShoppingBag,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const wb = new Workbox("/sw.js");
      wb.register()
        .then(() => console.log("SW Registered"))
        .catch((err) => console.error("SW Registration failed", err));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 text-gray-900 font-sans app-container">
      {/* Main Content Area */}
      <main
        className={cn(
          "flex-1 overflow-y-auto",
          !isLoginPage && "pb-20",
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isLoginPage && <BottomNavigation />}
    </div>
  );
}

function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      match: (path: string) => path === "/",
    },
    {
      label: "Contacts",
      href: "/contacts",
      icon: Users,
      match: (path: string) => path.startsWith("/contacts"),
    },
    {
      label: "Quick",
      href: "#",
      icon: PlusCircle,
      match: () => false,
      highlight: true,
      onClick: () => setShowQuickActions(!showQuickActions),
    },
    {
      label: "Trips",
      href: "/trips",
      icon: Truck,
      match: (path: string) => path.startsWith("/trips"),
    },
    {
      label: "More",
      href: "/more",
      icon: MoreHorizontal,
      match: (path: string) => path === "/more",
    },
  ];

  return (
    <>
      {/* Quick Actions Menu */}
      {showQuickActions && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowQuickActions(false)}
          />
          <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 z-50 w-[90vw] max-w-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3 px-2">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <Link
                to="/sales/new"
                search={{ tripId: undefined, walkIn: undefined }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-indigo-50 transition-colors"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="bg-indigo-100 p-3 rounded-full">
                  <ShoppingBag className="size-5 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">New Sale</span>
              </Link>
              <Link
                to="/intake/new"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="bg-green-100 p-3 rounded-full">
                  <Package className="size-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Purchase</span>
              </Link>
              <Link
                to="/contacts"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="size-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Contact</span>
              </Link>
              <Link
                to="/trips/new"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-purple-50 transition-colors"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="bg-purple-100 p-3 rounded-full">
                  <Truck className="size-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">New Trip</span>
              </Link>
              <Link
                to="/expenses"
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-rose-50 transition-colors"
                onClick={() => setShowQuickActions(false)}
              >
                <div className="bg-rose-100 p-3 rounded-full">
                  <Receipt className="size-5 text-rose-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Expense</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/inventory"
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-amber-50 transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <div className="bg-amber-100 p-3 rounded-full">
                    <BarChart3 className="size-5 text-amber-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Stock</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-premium z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = item.match(currentPath);
            const Icon = item.icon;

            if (item.highlight) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="relative -top-5"
                >
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center size-14 rounded-full shadow-lg shadow-indigo-200 transition-transform active:scale-95",
                      showQuickActions
                        ? "bg-indigo-700 text-white rotate-45"
                        : "bg-indigo-600 text-white",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={2.5} />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
                  isActive
                    ? "text-indigo-600"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                <Icon
                  className={cn(
                    "size-6 transition-colors",
                    isActive && "fill-current/10",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
