import { Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Workbox } from "workbox-window";
import { Home, Wallet, PlusCircle, Settings } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
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
      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-24 safe-area-inset">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

function BottomNavigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      match: (path: string) => path === "/",
    },
    {
      label: "Ledger",
      href: "/ledger",
      icon: Wallet,
      match: (path: string) => path.startsWith("/ledger"),
    },
    {
      label: "New Sale",
      href: "/sales/new",
      icon: PlusCircle,
      match: (path: string) => path.startsWith("/sales"),
      highlight: true,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      match: (path: string) => path.startsWith("/settings"),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-premium pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.match(currentPath);
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link key={item.href} to={item.href} className="relative -top-5">
                <div
                  className={cn(
                    "flex flex-col items-center justify-center size-14 rounded-full shadow-lg shadow-indigo-200 transition-transform active:scale-95",
                    isActive
                      ? "bg-indigo-700 text-white"
                      : "bg-indigo-600 text-white",
                  )}
                >
                  <Icon className="size-6" strokeWidth={2.5} />
                </div>
              </Link>
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
  );
}
