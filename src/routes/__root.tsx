import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  ScrollRestoration,
} from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SplashScreen } from "@/components/splash-screen";
import { FloatingWidgets } from "@/components/floating-widgets";
import { CustomCursor } from "@/components/custom-cursor";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-dark">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <span className="h-px w-8 bg-gold/40" />
          <span className="text-[10px] tracking-luxe uppercase text-gold">
            Lost in the EventVerse
          </span>
          <span className="h-px w-8 bg-gold/40" />
        </div>
        <h1 className="font-display text-8xl gold-text">404</h1>
        <h2 className="mt-4 text-xl text-white/80">This page drifted beyond the EventVerse</h2>
        <p className="mt-2 text-sm text-white/40">The page you're looking for cannot be found.</p>
        <Link to="/" className="mt-8 btn-primary inline-flex">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl">Something interrupted the show</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 btn-primary"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CustomCursor />
      <SplashScreen />
      <SiteHeader />
      <main>
        <ScrollRestoration />
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingWidgets />
    </QueryClientProvider>
  );
}
