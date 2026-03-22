import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";

type Status = "ok" | "warn" | "broken";
type Phase = 1 | 2;

interface RouteInfo {
  path: string;
  label: string;
  phase: Phase;
  roles: "BOTH" | "ADMIN" | "PUBLIC";
  status: Status;
  bugs: string[];
}

const ROUTES: RouteInfo[] = [
  { path: "/login", label: "Login", phase: 1, roles: "PUBLIC", status: "ok", bugs: [] },
  { path: "/", label: "Dashboard", phase: 1, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/sales/new", label: "New Sale", phase: 1, roles: "BOTH", status: "warn", bugs: ["Missing beforeLoad: requireAuth — unauthenticated access possible"] },
  { path: "/intake/new", label: "New Intake", phase: 1, roles: "BOTH", status: "broken", bugs: ["Missing beforeLoad: requireAuth", "Double-transaction bug: cash purchase creates PURCHASE + PAYMENT_OUT, corrupts vendor balance"] },
  { path: "/ledger", label: "Ledger", phase: 1, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/contacts", label: "Contacts", phase: 1, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/expenses", label: "Expenses", phase: 1, roles: "BOTH", status: "broken", bugs: ["Crashes for EMPLOYEE — useListUsers requires admin token"] },
  { path: "/inventory", label: "Inventory", phase: 1, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/products", label: "Products", phase: 1, roles: "ADMIN", status: "warn", bugs: ["Not restricted to ADMIN — any employee can create/delete products"] },
  { path: "/setup", label: "Setup / Rates", phase: 1, roles: "ADMIN", status: "warn", bugs: ["Not restricted to ADMIN — any employee can change daily rates"] },
  { path: "/users", label: "Users", phase: 1, roles: "ADMIN", status: "ok", bugs: [] },
  { path: "/more", label: "More", phase: 1, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/trips", label: "Trips", phase: 2, roles: "BOTH", status: "ok", bugs: [] },
  { path: "/trips/new", label: "New Trip", phase: 2, roles: "BOTH", status: "broken", bugs: ["Crashes for EMPLOYEE — useListUsers requires admin token"] },
  { path: "/admin-trips", label: "Admin Trips", phase: 2, roles: "ADMIN", status: "warn", bugs: ["No component-level role guard — employee can see approval UI"] },
];

const STATUS_CONFIG: Record<Status, { bg: string; dot: string; label: string }> = {
  ok:     { bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30", dot: "bg-emerald-400", label: "OK" },
  warn:   { bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",       dot: "bg-amber-400",   label: "WARN" },
  broken: { bg: "bg-red-500/10 hover:bg-red-500/20 border-red-500/30",             dot: "bg-red-400",     label: "BUG" },
};

const ROLE_CONFIG: Record<RouteInfo["roles"], string> = {
  BOTH:   "text-sky-400",
  ADMIN:  "text-violet-400",
  PUBLIC: "text-gray-400",
};

function RouteRow({ route, onClick }: { route: RouteInfo; onClick: () => void }) {
  const [showBugs, setShowBugs] = useState(false);
  const s = STATUS_CONFIG[route.status];

  return (
    <div className="relative">
      <button
        onClick={onClick}
        onMouseEnter={() => route.bugs.length > 0 && setShowBugs(true)}
        onMouseLeave={() => setShowBugs(false)}
        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border text-left transition-colors ${s.bg}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
        <span className="text-gray-200 flex-1">{route.label}</span>
        <span className={`text-[10px] ${ROLE_CONFIG[route.roles]}`}>{route.roles}</span>
        <span className="text-gray-600 text-[10px]">P{route.phase}</span>
        {route.bugs.length > 0 && (
          <span className="text-amber-400 text-[10px]">⚠ {route.bugs.length}</span>
        )}
      </button>
      {showBugs && route.bugs.length > 0 && (
        <div className="fixed bottom-20 left-4 w-72 bg-gray-950 border border-red-500/40 rounded-xl p-3 shadow-2xl z-[10001] pointer-events-none">
          <div className="text-[10px] text-red-400 font-semibold mb-2 uppercase tracking-wider">{route.label} — Issues</div>
          {route.bugs.map((bug, i) => (
            <div key={i} className="flex gap-1.5 mb-1.5 last:mb-0">
              <span className="text-red-400 shrink-0 mt-0.5">•</span>
              <span className="text-gray-200 text-[11px] leading-snug">{bug}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DevPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | 1 | 2>("all");
  const router = useRouter();
  const { currentUser } = useAuth();

  const filtered = ROUTES.filter(r => filter === "all" || r.phase === filter);
  const brokenCount = ROUTES.filter(r => r.status === "broken").length;
  const warnCount = ROUTES.filter(r => r.status === "warn").length;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-mono text-xs select-none">
      {/* Panel */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-72 bg-gray-950/95 backdrop-blur border border-gray-700 rounded-xl shadow-2xl overflow-visible">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-gray-800 flex items-center justify-between rounded-t-xl overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">Dev Panel</span>
              <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-[10px]">
                {currentUser ? `${currentUser.name} · ${currentUser.role}` : "not logged in"}
              </span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-red-400">{brokenCount} broken</span>
              <span className="text-gray-600">·</span>
              <span className="text-amber-400">{warnCount} warn</span>
            </div>
          </div>

          {/* Phase filter */}
          <div className="flex gap-1 px-3 py-2 border-b border-gray-800">
            {(["all", 1, 2] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {f === "all" ? "All" : `Phase ${f}`}
              </button>
            ))}
          </div>

          {/* Route list */}
          <div className="max-h-80 overflow-y-auto py-1.5 px-2 flex flex-col gap-0.5">
            {filtered.map(route => (
              <RouteRow
                key={route.path}
                route={route}
                onClick={() => router.navigate({ to: route.path as never })}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="px-3 py-2 border-t border-gray-800 flex gap-3 text-[10px] text-gray-500 rounded-b-xl overflow-hidden">
            <span><span className="text-emerald-400">●</span> OK</span>
            <span><span className="text-amber-400">●</span> Needs fix</span>
            <span><span className="text-red-400">●</span> Broken</span>
            <span className="ml-auto">hover row for bugs</span>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold shadow-lg transition-all ${
          open
            ? "bg-gray-900 border-gray-600 text-white"
            : "bg-gray-950/90 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
        }`}
      >
        <span className="text-indigo-400">⬡</span>
        DEV
        {!open && brokenCount > 0 && (
          <span className="bg-red-500 text-white text-[9px] px-1 rounded-full">{brokenCount}</span>
        )}
      </button>
    </div>
  );
}
