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
        <div style={{ minHeight:"100vh", background:"#141414", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
                * { box-sizing: border-box; }
                @keyframes revealPage {
                    from { opacity: 0; filter: blur(10px); }
                    to { opacity: 1; filter: blur(0); }
                }
                @keyframes driftUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                .panda-input { 
                    width:100%; padding:16px; margin-bottom:16px; background:#333; 
                    border:2px solid transparent; border-radius:4px; color:#fff; 
                    font-size:16px; outline:none;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .panda-input:focus { background:#454545; border-color: #00d2ff88; transform: scale(1.02); }
                .panda-input::placeholder { color:#8c8c8c; }
                .panda-btn { 
                    width:100%; padding:16px; background:linear-gradient(135deg, #e50914, #00d2ff); border:none; border-radius:4px; 
                    color:#fff; font-size:16px; font-weight:700; cursor:pointer; margin-top:8px; 
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
                }
                .panda-btn:hover { background:linear-gradient(135deg, #f40612, #33dcff); transform: translateY(-2px); box-shadow: 0 0 20px rgba(0,210,255,0.4); }
                .panda-btn:active { transform: scale(0.96); }
                .panda-btn:disabled { background:#333; cursor:default; transform: none; box-shadow: none; }
            `}</style>

            {/* Logo */}
            <div style={{ marginBottom:40, textAlign:"center", animation: "float 4s ease-in-out infinite" }}>
                <div style={{ fontSize:60, marginBottom:8 }}>🐼</div>
                <div style={{ fontSize:32, fontWeight:900, background:"linear-gradient(135deg, #e50914, #00d2ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2 }}>PANDASTORE</div>
            </div>

            {/* Card */}
            <div style={{ background:"#000", borderRadius:8, padding:60, width:"100%", maxWidth:450, animation: "driftUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                <h1 style={{ color:"#fff", fontSize:32, fontWeight:700, marginBottom:28 }}>Sign In</h1>

                {error && (
                    <div style={{ background:"#e87c0333", border:"1px solid #e87c03", borderRadius:4, padding:"12px 16px", marginBottom:16, color:"#e87c03", fontSize:14 }}>
                        {error}
                    </div>
                )}

                <input className="panda-input" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
                <input className="panda-input" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />

                <button className="panda-btn" onClick={handleLogin} disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                </button>

                <p style={{ color:"#737373", marginTop:20, fontSize:16 }}>
                    New to PandaStore? <Link to="/register" style={{ color:"#00d2ff", fontWeight:700, textDecoration:"none" }}>Sign up now</Link>
                </p>
            </div>
        </div>
    );
}