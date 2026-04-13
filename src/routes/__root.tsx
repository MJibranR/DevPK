import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { ThemeProvider } from "@/hooks/useTheme";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "DevPK — Pakistan's Home for Tech Minds" },
      { name: "description", content: "Pakistan's first and #1 tech social platform. Where developers, designers, students & freelancers connect, share, and grow together." },
      { property: "og:title", content: "DevPK — Pakistan's Home for Tech Minds" },
      { property: "og:description", content: "Pakistan's first and #1 tech social platform. Where developers, designers, students & freelancers connect, share, and grow together." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "DevPK — Pakistan's Home for Tech Minds" },
      { name: "twitter:description", content: "Pakistan's first and #1 tech social platform. Where developers, designers, students & freelancers connect, share, and grow together." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8e20b39d-9766-48f2-be4c-85ac1a76c4ab" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/8e20b39d-9766-48f2-be4c-85ac1a76c4ab" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
