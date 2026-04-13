import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function AdminDashboard() {
    const [pending, setPending] = useState([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/admin/pending")
            .then(({ data }) => { setPending(data); setLoading(false); })
            .catch(() => { setMsg("Access denied or not admin"); setLoading(false); });
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/approve/${id}`);
            setPending(pending.filter(app => app.id !== id));
            setMsg("App approved successfully! ✅");
        } catch {
            setMsg("Approval failed");
        }
    };

    const handleReject = async (id) => {
        try {
            await api.delete(`/admin/apps/${id}`);
            setPending(pending.filter(app => app.id !== id));
            setMsg("App rejected ❌");
        } catch {
            setMsg("Rejection failed");
        }
    };

    return (
        <div style={{ minHeight: "100vh", padding: 24 }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .card { animation: fadeIn 0.5s ease forwards; transition: transform 0.3s; }
        .card:hover { transform: translateY(-4px); }
        .approve-btn:hover { transform: scale(1.05); opacity: 0.9; }
        .reject-btn:hover { transform: scale(1.05); opacity: 0.9; }
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
                maxWidth: 900,
                margin: "0 auto 32px",
            }}>
                <span style={{
                    fontSize: 20,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}>⚡ Admin Dashboard</span>
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

            <div style={{ maxWidth: 900, margin: "0 auto" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1 style={{
                        fontSize: 36,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginBottom: 8,
                    }}>🛡️ Pending Apps</h1>
                    <p style={{ color: "#9090bb" }}>Review and approve submitted apps</p>
                </div>

                {msg && (
                    <div style={{
                        background: "rgba(0,255,100,0.1)",
                        border: "1px solid rgba(0,255,100,0.3)",
                        borderRadius: 12,
                        padding: "10px 16px",
                        marginBottom: 20,
                        color: "#00ff88",
                        textAlign: "center",
                    }}>{msg}</div>
                )}

                {loading && (
                    <div style={{ textAlign: "center", fontSize: 48 }}>🌀</div>
                )}

                {!loading && pending.length === 0 && (
                    <div style={{ textAlign: "center", padding: 60, color: "#9090bb" }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>✨</div>
                        <p style={{ fontSize: 18 }}>No pending apps to review</p>
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {pending.map((app, i) => (
                        <div key={app.id} className="card" style={{
                            background: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(224,64,251,0.2)",
                            borderRadius: 20,
                            padding: 24,
                            animationDelay: `${i * 0.1}s`,
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                                        <span style={{ fontSize: 32 }}>📦</span>
                                        <div>
                                            <h3 style={{ fontSize: 20, fontWeight: 800 }}>{app.name}</h3>
                                            <span style={{
                                                display: "inline-block",
                                                padding: "2px 10px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: 700,
                                                background: "linear-gradient(135deg, #e040fb33, #7c4dff33)",
                                                border: "1px solid #e040fb55",
                                                color: "#e040fb",
                                            }}>{app.category}</span>
                                        </div>
                                    </div>
                                    <p style={{ color: "#9090bb", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>
                                        {app.description}
                                    </p>
                                    <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#9090bb" }}>
                                        <span>👨‍💻 {app.developer}</span>
                                        <span>📦 v{app.version}</span>
                                        <span style={{
                                            color: "#00e5ff",
                                            fontWeight: 700,
                                        }}>${app.price}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: 10 }}>
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleApprove(app.id)}
                                        style={{
                                            padding: "10px 20px",
                                            background: "linear-gradient(135deg, #00ff88, #00e5ff)",
                                            color: "#000",
                                            borderRadius: 12,
                                            fontWeight: 800,
                                        }}
                                    >✅ Approve</button>
                                    <button
                                        className="reject-btn"
                                        onClick={() => handleReject(app.id)}
                                        style={{
                                            padding: "10px 20px",
                                            background: "linear-gradient(135deg, #ff4444, #ff0080)",
                                            color: "#fff",
                                            borderRadius: 12,
                                            fontWeight: 800,
                                        }}
                                    >❌ Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}