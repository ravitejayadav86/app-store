import React, { useMemo } from 'react';

const CosmicBackground = () => {
  const stars = useMemo(() => {
    return [...Array(150)].map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
      color: i % 5 === 0 ? 'var(--panda-red)' : i % 8 === 0 ? 'var(--panda-blue)' : '#fff'
    }));
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'black',
      zIndex: -1,
      overflow: 'hidden',
      backgroundAttachment: 'fixed'
    }}>
      <style>{`
        .nebula {
          position: absolute;
          width: 80vw;
          height: 80vh;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.15;
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .nebula-red {
          background: var(--panda-red);
          top: -20%;
          left: -10%;
          animation: float 20s ease-in-out infinite alternate;
        }
        .nebula-blue {
          background: var(--panda-blue);
          bottom: -20%;
          right: -10%;
          animation: float 25s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift {
          from { transform: translateY(0); }
          to { transform: translateY(-50px); }
        }
      `}</style>

      {/* Nebula Clouds */}
      <div className="nebula nebula-red" />
      <div className="nebula nebula-blue" />

      {/* Interactive Stars Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        animation: 'drift 60s linear infinite alternate'
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
              opacity: star.opacity,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
              animation: `starTwinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CosmicBackground;
