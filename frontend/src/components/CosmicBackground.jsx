import React, { useMemo } from 'react';

/*
 * CosmicBackground — 120Hz optimised
 * ‑ All animations use transform/opacity only (GPU‑composited, no layout)
 * ‑ Star count reduced to 80; remaining are batched into CSS classes
 * ‑ Nebula uses will‑change: transform to avoid repaint on every frame
 */
const CosmicBackground = () => {
  // Memoize star data so it never triggers re‑renders
  const stars = useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      duration: `${(Math.random() * 4 + 3).toFixed(2)}s`,
      delay: `${(Math.random() * 6).toFixed(2)}s`,
      opacity: Math.random() * 0.6 + 0.2,
      color: i % 6 === 0 ? 'var(--panda-red)' : i % 9 === 0 ? 'var(--panda-blue)' : '#fff'
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#050505',
      zIndex: -1,
      overflow: 'hidden',
      // Promote to its own GPU layer so scrolling never repaints the background
      willChange: 'transform',
      transform: 'translateZ(0)',
    }}>
      <style>{`
        /* Nebula: will-change so the browser pre-allocates a compositor layer */
        .nebula {
          position: absolute;
          width: 80vw;
          height: 80vh;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.13;
          mix-blend-mode: screen;
          pointer-events: none;
          will-change: transform;
          backface-visibility: hidden;
        }
        .nebula-red {
          background: var(--panda-red);
          top: -20%;
          left: -10%;
          animation: nebulaFloat 22s ease-in-out infinite alternate;
        }
        .nebula-blue {
          background: var(--panda-blue);
          bottom: -20%;
          right: -10%;
          animation: nebulaFloat 28s ease-in-out infinite alternate-reverse;
        }
        /* Pure transform — never triggers paint/layout */
        @keyframes nebulaFloat {
          from { transform: translate(0, 0) translateZ(0); }
          to   { transform: translate(40px, -30px) translateZ(0); }
        }
        /* Star twinkle uses only opacity — compositor-only */
        @keyframes starTwinkle {
          0%, 100% { opacity: var(--star-base-opacity); transform: scale(0.85) translateZ(0); }
          50%       { opacity: 1;                        transform: scale(1.15) translateZ(0); }
        }
        /* Star field drift — transform only */
        @keyframes starDrift {
          from { transform: translateY(0) translateZ(0); }
          to   { transform: translateY(-40px) translateZ(0); }
        }
      `}</style>

      {/* Nebula clouds */}
      <div className="nebula nebula-red" />
      <div className="nebula nebula-blue" />

      {/* Star field — single compositor layer for all stars */}
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: 'starDrift 70s linear infinite alternate',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}>
        {stars.map((star, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
              // Use CSS custom property for opacity so keyframe can interpolate it
              '--star-base-opacity': star.opacity,
              opacity: star.opacity,
              animation: `starTwinkle ${star.duration} ease-in-out ${star.delay} infinite`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CosmicBackground;
