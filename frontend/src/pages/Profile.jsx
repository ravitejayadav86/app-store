import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMe, getPurchases } from "../api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getMe()
            .then(({ data }) => setUser(data))
            .catch(() => {
                setError("Please login first");
                navigate("/login");
            });
        getPurchases()
            .then(({ data }) => setPurchases(data))
            .catch(() => setError("Failed to load purchases"));
    }, []);

    if (!user) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 64 }}>🌀</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", padding: 24 }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(224,64,251,0.3); }
          50% { box-shadow: 0 0 40px rgba(224,64,251,0.6); }
        }
        .profile-card {
          animation: fadeIn 0.6s ease forwards;
        }
        .avatar {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
        .purchase-item {
          animation: fadeIn 0.5s ease forwards;
          transition: transform 0.3s;
        }
        .purchase-item:hover {
          transform: translateX(6px);
        }
        .profile-container {
          animation: glow 3s ease-in-out infinite;
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
                marginBottom: 32,
                maxWidth: 700,
                margin: "0 auto 32px",
            }}>
                <span style={{
                    fontSize: 20,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>⚡ AnimeStore</span>
                <Link to="/">
                    <button style={{
                        padding: "8px 20px",
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 12,
                    }}>🏠 Home</button>
                </Link>
            </div>

            <div style={{ maxWidth: 700, margin: "0 auto" }}>

                {/* Profile Card */}
                <div className="profile-card profile-container" style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(224,64,251,0.3)",
                    borderRadius: 24,
                    padding: 32,
                    marginBottom: 24,
                    textAlign: "center",
                }}>
                    <span className="avatar" style={{ fontSize: 72 }}>🧙‍♂️</span>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 12,
                        marginBottom: 20,
                    }}>{user.username}</h1>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 16,
                    }}>
                        {[
                            { label: "📧 Email", value: user.email },
                            { label: "🎖️ Role", value: user.is_admin ? "Admin ⚡" : "User 🌟" },
                            { label: "📅 Joined", value: new Date(user.created_at).toLocaleDateString() },
                            { label: "🛒 Purchases", value: purchases.length },
                        ].map((item, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: 14,
                                padding: "14px 16px",
                                border: "1px solid rgba(255,255,255,0.1)",
                            }}>
                                <p style={{ color: "#9090bb", fontSize: 12, marginBottom: 4 }}>{item.label}</p>
                                <p style={{ fontWeight: 700, fontSize: 15 }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Purchases */}
                <div className="profile-card" style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(0,229,255,0.3)",
                    borderRadius: 24,
                    padding: 32,
                }}>
                    <h2 style={{
                        fontSize: 22,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: 20,
                    }}>🛒 My Purchases</h2>

                    {purchases.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: "#9090bb" }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🌠</div>
                            <p>No purchases yet. Go find some apps!</p>
                            <Link to="/">
                                <button style={{
                                    marginTop: 16,
                                    padding: "10px 24px",
                                    background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                                    color: "#fff",
                                    borderRadius: 12,
                                }}>Browse Apps ✨</button>
                            </Link>
                        </div>
                    ) : (
                        purchases.map((p, i) => (
                            <div key={p.id} className="purchase-item" style={{
                                background: "rgba(255,255,255,0.05)",
                                borderRadius: 14,
                                padding: "14px 20px",
                                marginBottom: 12,
                                border: "1px solid rgba(0,229,255,0.2)",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                animationDelay: `${i * 0.1}s`,
                            }}>
                                <div>
                                    <p style={{ fontWeight: 700 }}>App ID: {p.app_id}</p>
                                    <p style={{ color: "#9090bb", fontSize: 13, marginTop: 4 }}>
                                        {new Date(p.purchased_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <span style={{ fontSize: 24 }}>✅</span>
                            </div>
                        ))
                    )}
                </div>

                {error && <p style={{ color: "#ff6b6b", textAlign: "center", marginTop: 16 }}>{error}</p>}
            </div>
        </div>
    );
}