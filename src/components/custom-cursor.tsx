import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      setIsMobile(true);
      return;
    }

    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;

    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let outlineX = dotX;
    let outlineY = dotY;
    let isHovering = false;

    const onMouseMove = (e: MouseEvent) => {
      dotX = e.clientX;
      dotY = e.clientY;
      
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      
      const target = e.target as HTMLElement;
      if (target.closest("a, button, input, textarea, select, [role='button'], .cursor-pointer")) {
        isHovering = true;
        outline.classList.add("h-14", "w-14", "bg-gold/10", "border-gold");
        outline.classList.remove("h-8", "w-8", "border-gold/50");
      } else {
        isHovering = false;
        outline.classList.remove("h-14", "w-14", "bg-gold/10", "border-gold");
        outline.classList.add("h-8", "w-8", "border-gold/50");
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    let animationFrameId: number;
    const animate = () => {
      // Lerp for smooth trailing effect
      outlineX += (dotX - outlineX) * 0.15;
      outlineY += (dotY - outlineY) * 0.15;
      
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isMobile) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] h-2 w-2 rounded-full bg-gold"
      />
      <div
        ref={outlineRef}
        className="pointer-events-none fixed top-0 left-0 z-[99] h-8 w-8 rounded-full border border-gold/50 transition-colors duration-300"
        style={{ transitionProperty: "width, height, background-color, border-color" }}
      />
    </>
  );
}
