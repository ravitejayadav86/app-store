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
                .panda-input:focus { background:#454545; border-color: #e5091444; transform: scale(1.02); }
                .panda-input::placeholder { color:#8c8c8c; }
                .panda-btn { 
                    width:100%; padding:16px; background:#e50914; border:none; border-radius:4px; 
                    color:#fff; font-size:16px; font-weight:700; cursor:pointer; margin-top:8px; 
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
                }
                .panda-btn:hover { background:#f40612; transform: translateY(-2px); }
                .panda-btn:active { transform: scale(0.96); }
                .panda-btn:disabled { background:#831010; cursor:default; transform: none; }
            `}</style>

            {/* Logo */}
            <div style={{ marginBottom:40, textAlign:"center", animation: "float 4s ease-in-out infinite" }}>
                <div style={{ fontSize:60, marginBottom:8 }}>🐼</div>
                <div style={{ fontSize:32, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</div>
            </div>

            {/* Card */}
            <div style={{ background:"#000", borderRadius:8, padding:60, width:"100%", maxWidth:450, animation: "driftUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                <h1 style={{ color:"#fff", fontSize:32, fontWeight:700, marginBottom:28 }}>Sign Up</h1>

                {error && (
                    <div style={{ background:"#e87c0333", border:"1px solid #e87c03", borderRadius:4, padding:"12px 16px", marginBottom:16, color:"#e87c03", fontSize:14 }}>
                        {error}
                    </div>
                )}

                <input className="panda-input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                <input className="panda-input" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                <input className="panda-input" type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} onKeyDown={e => e.key === "Enter" && handleRegister()} />

                <button className="panda-btn" onClick={handleRegister} disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p style={{ color:"#737373", marginTop:20, fontSize:16 }}>
                    Already have an account? <Link to="/login" style={{ color:"#fff", fontWeight:700, textDecoration:"none" }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}