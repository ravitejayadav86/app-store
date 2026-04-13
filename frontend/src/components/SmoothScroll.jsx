import { useEffect, useRef } from 'react';

/**
 * SmoothScroll — requestAnimationFrame-based inertia scroll
 * Intercepts the native scroll wheel event and replaces it with a
 * lerp (linear interpolation) that targets the same position.
 *
 * Result: buttery 120Hz-class momentum scrolling on any display.
 */
export default function SmoothScroll() {
  const currentY = useRef(window.scrollY);
  const targetY  = useRef(window.scrollY);
  const rafId    = useRef(null);
  const ease     = 0.1; // lower = smoother/slower; higher = snappier

  useEffect(() => {
    // Intercept native wheel events and accumulate target position
    const onWheel = (e) => {
      e.preventDefault();
      targetY.current = Math.max(
        0,
        Math.min(
          targetY.current + e.deltaY,
          document.body.scrollHeight - window.innerHeight
        )
      );
    };

    // rAF loop — runs at the display's native refresh rate (120Hz, 144Hz etc.)
    const raf = () => {
      const diff = targetY.current - currentY.current;
      if (Math.abs(diff) > 0.5) {
        currentY.current += diff * ease;
        window.scrollTo(0, currentY.current);
      } else {
        currentY.current = targetY.current;
      }
      rafId.current = requestAnimationFrame(raf);
    };

    // Sync target when user scrolls via scrollbar / keyboard / touch
    const onScroll = () => {
      // Only update target if the delta came from non-wheel source
      // (avoids fighting our own rAF loop)
      if (Math.abs(currentY.current - window.scrollY) > 2) {
        targetY.current  = window.scrollY;
        currentY.current = window.scrollY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });
    rafId.current = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return null; // render-less component
}
