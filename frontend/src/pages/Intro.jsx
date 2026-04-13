import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();

  const [particles] = useState(() => {
    return [...Array(20)].map((_, i) => ({
      width: Math.random() * 4 + 1,
      height: Math.random() * 4 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.5 + 0.1,
      animationDuration: Math.random() * 3 + 2,
      animationDelay: Math.random() * 2,
      color: i % 2 === 0 ? "#e50914" : "#333"
    }));
  });

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => setPhase(2), 1800);
    const t3 = setTimeout(() => setPhase(3), 3000);
    const t4 = setTimeout(() => {
      navigate(localStorage.getItem("token") ? "/" : "/login");
    }, 4200);

    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px #e50914, 0 0 40px #b9090b; }
          50% { text-shadow: 0 0 40px #ff0000, 0 0 80px #000; }
        }
        @keyframes revealPage {
          from { opacity: 0; transform: scale(0.98); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expand {
          from { width: 0%; }
          to { width: 100%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* Background particles */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          width: p.width,
          height: p.height,
          background: p.color,
          borderRadius: "50%",
          left: p.left,
          top: p.top,
          opacity: p.opacity,
          animation: `pulse-ring ${p.animationDuration}s ease-out infinite`,
          animationDelay: `${p.animationDelay}s`,
        }} />
      ))}

      {/* Logo ring */}
      <div style={{
        position: "relative",
        marginBottom: 40,
        opacity: phase >= 0 ? 1 : 0,
        transition: "opacity 0.8s ease",
      }}>
        <div style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          border: "3px solid transparent",
          borderTop: "3px solid #e50914",
          borderRight: "3px solid #333",
          animation: "rotate 1.5s linear infinite",
          position: "absolute",
          top: -10,
          left: -10,
        }} />
        <div style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a1a2e, #16213e)",
          border: "1px solid rgba(124,77,255,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 48,
        }}>🏪</div>
      </div>

      {/* App name */}
      <h1 style={{
        fontSize: 48,
        fontWeight: 900,
        background: "linear-gradient(135deg, #e50914, #fff, #b9090b)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        margin: 0,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? "translateY(0)" : "translateY(30px)",
        transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        animation: phase >= 1 ? "glow 2s infinite" : "none",
        letterSpacing: 2,
      }}>PANDASTORE</h1>

      {/* Tagline */}
      <p style={{
        color: "#412006ff",
        fontSize: 16,
        marginTop: 12,
        letterSpacing: 4,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? "translateY(0)" : "translateY(20px)",
        transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        textTransform: "uppercase",
      }}>Discover · Download · Create</p>

      {/* Loading bar */}
      <div style={{
        marginTop: 60,
        width: 200,
        height: 2,
        background: "rgba(255,255,255,0.1)",
        borderRadius: 2,
        overflow: "hidden",
        opacity: phase >= 1 ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>
        <div style={{
          height: "100%",
          background: "linear-gradient(135deg, #e50914, #b9090b)",
          borderRadius: 2,
          animation: phase >= 1 ? "expand 3s ease forwards" : "none",
        }} />
      </div>

      {/* Version */}
      <p style={{
        position: "absolute",
        bottom: 30,
        color: "rgba(255,255,255,0.2)",
        fontSize: 12,
        letterSpacing: 2,
        opacity: phase >= 3 ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}>v1.0.0 • Built with ❤️</p>
    </div>
  );
}