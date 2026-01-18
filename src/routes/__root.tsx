import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import appCss from "../styles.css?url";
import { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
      },
      { title: "EggFlow - Wholesale Egg Supply Management" },
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
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="font-['Outfit'] bg-gray-50 text-gray-900 antialiased selection:bg-indigo-100 italic-none">
        <main className="min-h-[100dvh]">{children}</main>
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
