import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DFDS Frontend Lead Challenge" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  /*
   * ErrorBoundary wraps ToastProvider *and* the route tree. If a provider
   * itself blows up, the boundary still renders a fallback UI instead of
   * a blank page. The boundary doesn't depend on the toast system so
   * this ordering is safe.
   */
  component: () => (
    <ErrorBoundary>
      <ToastProvider>
        <Outlet />
      </ToastProvider>
    </ErrorBoundary>
  ),
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
