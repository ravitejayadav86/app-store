import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { data } = await login({ username, password });
            localStorage.setItem("token", data.access_token);
            navigate("/");
        } catch {
            setError("Invalid username or password");
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #e040fb; }
          50% { box-shadow: 0 0 40px #e040fb, 0 0 60px #7c4dff; }
        }
        .login-card {
          animation: fadeIn 0.6s ease forwards;
        }
        .anime-btn {
          animation: pulse 2s infinite;
        }
        .anime-btn:hover {
          transform: scale(1.05);
          background: linear-gradient(135deg, #ff80ff, #7c4dff) !important;
        }
        .title-float {
          animation: float 3s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

            <div className="login-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(224,64,251,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 420,
            }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <span className="title-float" style={{ fontSize: 48 }}>⚔️</span>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 8,
                    }}>Welcome Back!</h1>
                    <p style={{ color: "#9090bb", marginTop: 6 }}>Login to your account</p>
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
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                />

                <button
                    className="anime-btn"
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: 14,
                        fontSize: 16,
                        background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                        color: "#fff",
                        marginTop: 8,
                    }}
                >
                    {loading ? "Logging in..." : "Login ✨"}
                </button>

                <p style={{ textAlign: "center", marginTop: 20, color: "#9090bb" }}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
}