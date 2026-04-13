import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });
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
        <div style={{ minHeight: "100vh", padding: 24 }}>
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #ff6b6b; }
          50% { box-shadow: 0 0 40px #ff6b6b, 0 0 60px #e040fb; }
        }
        .submit-card { animation: fadeIn 0.6s ease forwards; }
        .title-float { animation: float 3s ease-in-out infinite; display: inline-block; }
        .submit-btn { animation: pulse 2s infinite; }
        .submit-btn:hover { transform: scale(1.05); }
        .cat-btn:hover { transform: scale(1.05); }
        select {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #4a4a8a;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
        }
        select option { background: #302b63; color: #fff; }
        textarea {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #4a4a8a;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          resize: vertical;
          min-height: 100px;
        }
        textarea:focus { border-color: #ff6b6b; }
        textarea::placeholder { color: #9090bb; }
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
                maxWidth: 600,
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

            <div className="submit-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,107,107,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 600,
                margin: "0 auto",
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <span className="title-float" style={{ fontSize: 48 }}>🚀</span>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #ff6b6b, #e040fb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 8,
                    }}>Submit Your App</h1>
                    <p style={{ color: "#9090bb", marginTop: 6 }}>
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
                        background: "linear-gradient(135deg, #ff6b6b, #e040fb)",
                        color: "#fff",
                        marginTop: 8,
                    }}
                >
                    {loading ? "Submitting..." : "Submit App 🚀"}
                </button>
            </div>
        </div>
    );
}