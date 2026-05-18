import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

export function useScrollReveal() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  useEffect(() => {
    // Delay observer setup to ensure DOM is fully rendered after SPA navigation
    const timeoutId = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
      );

      const els = document.querySelectorAll(
        ".reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible), .reveal-scale:not(.visible)",
      );
      els.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]); // Re-run when the route changes
}
