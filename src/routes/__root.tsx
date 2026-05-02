import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { ToastProvider } from "@/components/ui/Toast";

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
  // Wrap every page in the toast provider so any screen can push a toast
  // without re-wiring the tree. Kept tiny (see `src/components/ui/Toast.tsx`).
  component: () => (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
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
