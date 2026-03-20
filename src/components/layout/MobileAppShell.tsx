import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Workbox } from "workbox-window";
import {
  Home,
  Wallet,
  PlusCircle,
  Receipt,
  LogOut,
  Settings,
  Menu,
  X,
  Users,
  Package,
  Truck,
  ShoppingBag,
  BarChart3,
  UserCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

interface MobileAppShellProps {
  children: React.ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const wb = new Workbox("/sw.js");
      wb.register()
        .then(() => console.log("SW Registered"))
        .catch((err) => console.error("SW Registration failed", err));
    }
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gray-50 text-gray-900 font-sans app-container">
      {/* Hamburger Menu */}
      {!isLoginPage && (
        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}

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
      {!isLoginPage && <BottomNavigation onMenuClick={() => setIsMenuOpen(true)} />}
    </div>
  );
}

function HamburgerMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { currentUser, logout } = useAuth();

  const menuSections = [
    {
      title: "Sales & Customers",
      items: [
        { label: "New Sale", href: "/sales/new", icon: ShoppingBag },
        { label: "Contacts", href: "/contacts", icon: Users },
        { label: "Ledger", href: "/ledger", icon: Wallet },
      ],
    },
    {
      title: "Inventory",
      items: [
        { label: "Stock Check", href: "/inventory", icon: Package },
        { label: "Products", href: "/products", icon: Package },
        { label: "New Purchase", href: "/intake/new", icon: ShoppingBag },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "Trips", href: "/trips", icon: Truck },
        { label: "Expenses", href: "/expenses", icon: Receipt },
      ],
    },
  ];

  if (currentUser?.role === "ADMIN") {
    menuSections.push({
      title: "Administration",
      items: [
        { label: "Users", href: "/users", icon: UserCircle },
        { label: "Trip Approvals", href: "/admin-trips", icon: ShieldCheck },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Menu Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-300 overflow-y-auto pb-[env(safe-area-inset-bottom)]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Menu Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
          <button
            onClick={onClose}
            className="absolute top-[calc(env(safe-area-inset-top)+0.5rem)] right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="size-6" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <UserCircle className="size-8" />
            </div>
            <div>
              <p className="font-bold text-lg">{currentUser?.name}</p>
              <p className="text-xs text-indigo-100 uppercase tracking-wider">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <Icon className="size-5 text-gray-600 group-hover:text-indigo-600" />
                      <span className="flex-1 font-medium text-gray-700 group-hover:text-indigo-600">
                        {item.label}
                      </span>
                      <ChevronRight className="size-4 text-gray-400 group-hover:text-indigo-600" />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-50 transition-colors group w-full"
            >
              <LogOut className="size-5 text-gray-600 group-hover:text-red-600" />
              <span className="flex-1 font-medium text-gray-700 group-hover:text-red-600 text-left">
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BottomNavigation({ onMenuClick }: { onMenuClick: () => void }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const [showQuickActions, setShowQuickActions] = useState(false);

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
      href: "#",
      icon: Menu,
      match: () => false,
      onClick: onMenuClick,
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
                search={{ tripId: undefined }}
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
            </div>
          </div>
        </>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-premium z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = item.match(currentPath);
            const Icon = item.icon;

            if (item.onClick && !item.highlight) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-transform",
                    "text-gray-400 hover:text-gray-600",
                  )}
                >
                  <Icon className="size-6 transition-colors" strokeWidth={2} />
                  <span className="text-[10px] font-medium tracking-wide">
                    {item.label}
                  </span>
                </button>
              );
            }

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
