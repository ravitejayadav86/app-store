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
        <div style={{ minHeight:"100vh", background:"#141414", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
            <style>{`
                * { box-sizing: border-box; }
                .panda-input { width:100%; padding:16px; margin-bottom:16px; background:#333; border:none; border-radius:4px; color:#fff; font-size:16px; outline:none; }
                .panda-input:focus { background:#454545; }
                .panda-input::placeholder { color:#8c8c8c; }
                .panda-btn { width:100%; padding:16px; background:#e50914; border:none; border-radius:4px; color:#fff; font-size:16px; font-weight:700; cursor:pointer; margin-top:8px; transition:background 0.2s; }
                .panda-btn:hover { background:#f40612; }
                .panda-btn:disabled { background:#831010; cursor:default; }
            `}</style>

            {/* Logo */}
            <div style={{ marginBottom:40, textAlign:"center" }}>
                <div style={{ fontSize:60, marginBottom:8 }}>🐼</div>
                <div style={{ fontSize:32, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</div>
            </div>

            {/* Card */}
            <div style={{ background:"#000", borderRadius:8, padding:60, width:"100%", maxWidth:450 }}>
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