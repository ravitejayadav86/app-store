import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApp, purchaseApp } from "../api";

export default function AppDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getApp(id)
            .then(({ data }) => setApp(data))
            .catch(() => setMsg("App not found"));
    }, [id]);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await purchaseApp(id);
            setMsg("App purchased successfully!");
            setPurchased(true);
        } catch (err) {
            setMsg(err.response?.data?.detail || "Purchase failed");
        } finally {
            setLoading(false);
        }
    };

    const emojis = ["🎮", "🎵", "📱", "🚀", "⚡", "🌟", "🎨", "🔥"];

    if (!app) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 64 }}>🌀</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #00e5ff; }
          50% { box-shadow: 0 0 40px #00e5ff, 0 0 60px #e040fb; }
        }
        .detail-card { animation: fadeIn 0.6s ease forwards; }
        .app-icon { animation: float 3s ease-in-out infinite; display: inline-block; }
        .purchase-btn { animation: pulse 2s infinite; }
        .purchase-btn:hover { transform: scale(1.05); }
        .back-btn:hover { transform: scale(1.05); opacity: 0.8; }
      `}</style>

            <div className="detail-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,229,255,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 500,
            }}>
                <button className="back-btn" onClick={() => navigate(-1)} style={{
                    padding: "8px 20px",
                    background: "rgba(255,255,255,0.1)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 12,
                    marginBottom: 24,
                }}>← Back</button>

                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <span className="app-icon" style={{ fontSize: 72 }}>
                        {emojis[app.id % 8]}
                    </span>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 12,
                    }}>{app.name}</h1>
                    <span style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        borderRadius: 20,
                        fontSize: 13,
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #e040fb33, #7c4dff33)",
                        border: "1px solid #e040fb55",
                        color: "#e040fb",
                        marginTop: 8,
                    }}>{app.category}</span>
                </div>

                <div style={{
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                }}>
                    <p style={{ color: "#ccc", lineHeight: 1.7, marginBottom: 16 }}>{app.description}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#9090bb", fontSize: 14 }}>
                        <span>👨‍💻 {app.developer}</span>
                        <span>📦 v{app.version}</span>
                    </div>
                </div>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <span style={{
                        fontSize: 36,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}>${app.price}</span>
                </div>

                {msg && (
                    <div style={{
                        background: purchased ? "rgba(0,255,100,0.1)" : "rgba(255,50,50,0.1)",
                        border: `1px solid ${purchased ? "rgba(0,255,100,0.3)" : "rgba(255,50,50,0.3)"}`,
                        borderRadius: 12,
                        padding: "10px 16px",
                        marginBottom: 16,
                        color: purchased ? "#00ff88" : "#ff6b6b",
                        textAlign: "center",
                        fontSize: 14,
                    }}>{msg}</div>
                )}

                <button
                    className="purchase-btn"
                    onClick={handlePurchase}
                    disabled={loading || purchased}
                    style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 16,
                        background: purchased
                            ? "linear-gradient(135deg, #00ff88, #00e5ff)"
                            : "linear-gradient(135deg, #00e5ff, #e040fb)",
                        color: "#fff",
                        borderRadius: 12,
                        marginBottom: 12,
                    }}
                >
                    {loading ? "Processing..." : purchased ? "Purchased ✅" : "Purchase Now 🛒"}
                </button>

                {purchased && app.file_path && (
                    <a
                        href={`http://127.0.0.1:8000/apps/${app.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: "block" }}
                    >
                        <button style={{
                            width: "100%",
                            padding: 14,
                            fontSize: 16,
                            background: "linear-gradient(135deg, #00ff88, #00e5ff)",
                            color: "#000",
                            fontWeight: 800,
                            borderRadius: 12,
                        }}>
                            Download App ⬇️
                        </button>
                    </a>
                )}
            </div>
        </div >
    );
}