import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { useEffect, Component, ReactNode } from "react";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import appCss from "../styles.css?url";
import { QueryClient } from "@tanstack/react-query";
import { MobileAppShell } from "../components/layout/MobileAppShell";
import { DevPanel } from "../components/layout/DevPanel";
import { Toaster } from "../components/ui/sonner";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[100dvh] text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">🥚</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 mb-6">{(this.state.error as Error).message}</p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = "/"; }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium"
          >
            Go Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
      },
      { title: "Ganesh Egg Centre - Wholesale Supply" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  notFoundComponent: () => (
    <div className="p-4 safe-area-inset flex flex-col items-center justify-center min-h-[100dvh] max-w-md mx-auto text-center">
      <div className="bg-indigo-100 p-6 rounded-3xl mb-6">
        <div className="text-6xl mb-4">🥚</div>
        <h1 className="text-2xl font-bold text-indigo-950 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-xl font-medium hover:scale-105 transition-transform"
        >
          Go Home
        </Link>
      </div>
    </div>
  ),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  useEffect(() => {
    if (import.meta.env.DEV) {
      void import("react-grab");
    }
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <MobileAppShell>
        <Outlet />
        {import.meta.env.DEV && <DevPanel />}
      </MobileAppShell>
    </ErrorBoundary>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-['Outfit'] bg-gray-50 text-gray-900 antialiased selection:bg-indigo-100 italic-none">
        <main className="min-h-[100dvh]">{children}</main>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  );
}
