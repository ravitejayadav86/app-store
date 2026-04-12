import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api";

export default function Register() {
    const [form, setForm] = useState({ email: "", username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async () => {
        setLoading(true);
        try {
            await register(form);
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        }}>
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
        .register-card {
          animation: fadeIn 0.6s ease forwards;
        }
        .register-btn {
          animation: pulse 2s infinite;
        }
        .register-btn:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #00e5ff, #e040fb) !important;
        }
        .title-float {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

            <div className="register-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(0,229,255,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 420,
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <span className="title-float" style={{ fontSize: 48 }}>🌟</span>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 8,
                    }}>Join Now!</h1>
                    <p style={{ color: "#9090bb", marginTop: 6 }}>Create your account</p>
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

                <input
                    placeholder="Email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                />
                <input
                    placeholder="Username"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                />

                <button
                    className="register-btn"
                    onClick={handleRegister}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 16,
                        background: "linear-gradient(135deg, #00e5ff, #e040fb)",
                        color: "#fff",
                        marginTop: 8,
                    }}
                >
                    {loading ? "Creating account..." : "Register 🚀"}
                </button>

                <p style={{ textAlign: "center", marginTop: 20, color: "#9090bb" }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}