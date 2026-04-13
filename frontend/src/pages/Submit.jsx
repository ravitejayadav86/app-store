import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ 
    baseURL: import.meta.env.VITE_API_URL || "https://app-store-backend-dbci.onrender.com" 
});
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default function Submit() {
    const [form, setForm] = useState({
        name: "", description: "", price: 0,
        category: "", version: "1.0.0"
    });
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        "Utilities", "Games", "Education", "Music",
        "Productivity", "Social", "Health", "Finance"
    ];

    const handleSubmit = async () => {
        if (!form.name || !form.description || !form.category) {
            setError("Please fill all fields");
            return;
        }
        setLoading(true);
        try {
            await api.post("/apps/submit", form);
            setMsg("App submitted successfully! 🎉");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", padding: 24, animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
        @keyframes revealPage {
          from { opacity: 0; filter: blur(10px); transform: scale(0.98); }
          to { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        @keyframes driftUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,210,255,0.2); }
          50% { box-shadow: 0 0 40px rgba(0,210,255,0.4), 0 0 60px rgba(229,9,20,0.1); }
        }
        .submit-card { animation: driftUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .title-float { animation: float 3s ease-in-out infinite; display: inline-block; }
        .submit-btn { animation: pulse 2s infinite; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; border: none; }
        .submit-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .submit-btn:active { transform: scale(0.96); }
        .cat-btn:hover { transform: scale(1.05); }
        input {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #333;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        input:focus { border-color: #00d2ff88; background: rgba(255,255,255,0.1); transform: scale(1.01); }
        select {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #333;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        select:hover { border-color: #00d2ff88; }
        select option { background: #141414; color: #fff; }
        textarea {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #333;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          resize: vertical;
          min-height: 100px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        textarea:focus { border-color: #00d2ff88; background: rgba(255,255,255,0.1); transform: scale(1.01); }
        textarea::placeholder { color: #737373; }
      `}</style>

            {/* Navbar */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid #00d2ff44",
                borderRadius: 16,
                padding: "14px 24px",
                marginBottom: 32,
                maxWidth: 600,
                margin: "0 auto 32px",
            }}>
                <span style={{
                    fontSize: 20,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #e50914, #00d2ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 2
                }}>PANDASTORE</span>
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

            <div className="submit-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid #e5091444",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <span className="title-float" style={{ fontSize: 48 }}>🐼</span>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e50914, #fff, #00d2ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 8,
                    }}>Submit Your App</h1>
                    <p style={{ color: "#737373", marginTop: 6 }}>
                        Share your app with the world 🌍
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: "rgba(255,50,50,0.15)",
                        border: "1px solid rgba(255,50,50,0.4)",
                        borderRadius: 12,
                        padding: "10px 16px",
                        marginBottom: 16,
                        color: "#ff6b6b",
                        fontSize: 14,
                    }}>{error}</div>
                )}

                {msg && (
                    <div style={{
                        background: "rgba(0,255,100,0.1)",
                        border: "1px solid rgba(0,255,100,0.3)",
                        borderRadius: 12,
                        padding: "10px 16px",
                        marginBottom: 16,
                        color: "#00ff88",
                        textAlign: "center",
                        fontSize: 14,
                    }}>{msg}</div>
                )}

                <input
                    placeholder="App name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <textarea
                    placeholder="App description"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                />

                <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                >
                    <option value="">Select category</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Price (0 for free)"
                    value={form.price}
                    min="0"
                    step="0.01"
                    onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                />

                <input
                    placeholder="Version (e.g. 1.0.0)"
                    value={form.version}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                />

                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 16,
                        background: "linear-gradient(135deg, #e50914, #00d2ff)",
                        color: "#fff",
                        marginTop: 8,
                        border: "none",
                        borderRadius: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                    }}
                >
                    {loading ? "Submitting..." : "Submit App 🐼"}
                </button>
            </div>
        </div>
    );
}