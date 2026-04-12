import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getApps } from "../api";

export default function Home() {
    const [apps, setApps] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getApps()
            .then(({ data }) => setApps(data))
            .catch(() => setError("Failed to load apps"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={{ minHeight: "100vh", padding: "24px" }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .app-card {
          animation: fadeIn 0.5s ease forwards;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .app-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(224,64,251,0.3);
        }
        .nav-btn:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }
        .logo-float {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

            {/* Navbar */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(224,64,251,0.2)",
                borderRadius: 16,
                padding: "14px 24px",
                maxWidth: 1100,
                margin: "0 auto 32px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="logo-float" style={{ fontSize: 28 }}>⚡</span>
                    <span style={{
                        fontSize: 22,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>AnimeStore</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <Link to="/submit">
                        <button className="nav-btn" style={{
                            padding: "8px 20px",
                            background: "linear-gradient(135deg, #00e5ff, #7c4dff)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                        }}>🚀 Submit App</button>
                    </Link>
                    <Link to="/admin">
                        <button className="nav-btn" style={{
                            padding: "8px 20px",
                            background: "linear-gradient(135deg, #ff6b6b, #e040fb)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 12,
                        }}>🛡️ Admin</button>
                    </Link>
                    <Link to="/profile">
                        <button className="nav-btn" style={{
                            padding: "8px 20px",
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 12,
                        }}>👤 Profile</button>
                    </Link>
                    <button className="nav-btn" onClick={handleLogout} style={{
                        padding: "8px 20px",
                        background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                        color: "#fff",
                        borderRadius: 12,
                    }}>Logout 🚪</button>
                </div>
            </div>

            {/* Hero */}
            <div style={{
                textAlign: "center",
                maxWidth: 1100,
                margin: "0 auto 40px",
            }}>
                <h1 style={{
                    fontSize: 48,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #e040fb, #00e5ff, #ff6b6b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 12,
                }}>Discover Amazing Apps ✨</h1>
                <p style={{ color: "#9090bb", fontSize: 18 }}>
                    Find and download the best apps in the universe 🌌
                </p>
            </div>

            {/* Apps Grid */}
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {error && <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>}
                {apps.length === 0 && (
                    <div style={{ textAlign: "center", color: "#9090bb", marginTop: 60 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🌠</div>
                        <p style={{ fontSize: 18 }}>No apps available yet</p>
                    </div>
                )}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                }}>
                    {apps.map((app, i) => (
                        <div key={app.id} className="app-card" style={{
                            background: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(224,64,251,0.2)",
                            borderRadius: 20,
                            padding: 24,
                            animationDelay: `${i * 0.1}s`,
                        }}>
                            <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>
                                {["🎮", "🎵", "📱", "🚀", "⚡", "🌟", "🎨", "🔥"][i % 8]}
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{app.name}</h3>
                            <span style={{
                                display: "inline-block",
                                padding: "3px 10px",
                                borderRadius: 20,
                                fontSize: 12,
                                fontWeight: 700,
                                background: "linear-gradient(135deg, #e040fb33, #7c4dff33)",
                                border: "1px solid #e040fb55",
                                color: "#e040fb",
                                marginBottom: 10,
                            }}>{app.category}</span>
                            <p style={{ color: "#9090bb", fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
                                {app.description}
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{
                                    fontSize: 20,
                                    fontWeight: 900,
                                    background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}>${app.price}</span>
                                <Link to={`/apps/${app.id}`}>
                                    <button style={{
                                        padding: "8px 20px",
                                        background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                                        color: "#fff",
                                        fontSize: 14,
                                        borderRadius: 12,
                                    }}>View 👁️</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}