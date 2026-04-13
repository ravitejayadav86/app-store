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
            navigate("/home");
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
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center", 
            padding: 24, 
            animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" 
        }}>
            <style>{`
                .auth-card {
                    background: var(--panda-glass);
                    backdrop-filter: blur(40px);
                    border: 1px solid var(--panda-border);
                    border-radius: 32px;
                    padding: 60px;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: var(--shadow-lg);
                    animation: driftUp 1s var(--transition) forwards;
                }
                .auth-input {
                    width: 100%;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--panda-border);
                    border-radius: 16px;
                    color: #fff;
                    font-size: 16px;
                    margin-bottom: 16px;
                    outline: none;
                    transition: var(--transition);
                }
                .auth-input:focus {
                    border-color: var(--panda-blue);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(0, 210, 255, 0.1);
                }
                .auth-btn-primary {
                    width: 100%;
                    padding: 18px;
                    background: var(--panda-gradient);
                    color: #fff;
                    font-weight: 800;
                    font-size: 16px;
                    border-radius: 16px;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                    margin-top: 8px;
                }
                .auth-btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(229, 9, 20, 0.3);
                }
                .auth-btn-primary:active { transform: scale(0.98); }
                .auth-btn-primary:disabled { opacity: 0.5; cursor: default; }
            `}</style>

            <div style={{ marginBottom: 48, textAlign: "center", animation: "float 4s ease-in-out infinite" }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>🐼</div>
                <div style={{ 
                    fontSize: 36, 
                    fontWeight: 900, 
                    background: "var(--panda-gradient)", 
                    WebkitBackgroundClip: "text", 
                    WebkitTextFillColor: "transparent", 
                    letterSpacing: -1 
                }}>PANDASTORE</div>
            </div>

            <div className="auth-card">
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: -1 }}>Sign In</h1>
                <p style={{ color: "#666", marginBottom: 32, fontSize: 15 }}>Welcome back to the Cosmic Era.</p>

                {error && (
                    <div style={{ 
                        background: "rgba(229, 9, 20, 0.1)", 
                        border: "1px solid var(--panda-red)", 
                        borderRadius: 12, 
                        padding: "12px 16px", 
                        marginBottom: 20, 
                        color: "var(--panda-red)", 
                        fontSize: 14,
                        fontWeight: 600
                    }}>
                        {error}
                    </div>
                )}

                <input 
                    className="auth-input" 
                    placeholder="Username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && handleLogin()} 
                />
                <input 
                    className="auth-input" 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    onKeyDown={e => e.key === "Enter" && handleLogin()} 
                />

                <button className="auth-btn-primary" onClick={handleLogin} disabled={loading}>
                    {loading ? "Authenticating..." : "Enter Store"}
                </button>

                <p style={{ color: "#666", marginTop: 32, fontSize: 15, textAlign: "center" }}>
                    New explorer? <Link to="/register" style={{ color: "var(--panda-blue)", fontWeight: 700 }}>Initialize account</Link>
                </p>
            </div>
        </div>
    );
}