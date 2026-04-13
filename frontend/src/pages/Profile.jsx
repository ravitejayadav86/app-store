import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMe, getPurchases } from "../api";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getMe().then(({ data }) => setUser(data)).catch(() => navigate("/login"));
        getPurchases().then(({ data }) => setPurchases(data)).catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (!user) return (
        <div style={{ minHeight:"100vh", background:"#141414", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ color:"#e50914", fontSize:32 }}>🐼 Loading...</div>
        </div>
    );

    return (
        <div style={{ minHeight:"100vh", background:"#141414", color:"#fff" }}>
            <style>{`
                * { box-sizing: border-box; }
                .nav-link { color:#e5e5e5; text-decoration:none; font-size:14px; }
                .nav-link:hover { color:#fff; }
                .info-card { background:#1f1f1f; border:1px solid #2a2a2a; border-radius:8px; padding:20px; }
                .purchase-item { background:#1f1f1f; border:1px solid #2a2a2a; border-radius:8px; padding:16px 20px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; transition:border-color 0.2s; }
                .purchase-item:hover { border-color:#e50914; }
            `}</style>

            {/* Navbar */}
            <nav style={{ background:"rgba(20,20,20,0.95)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:100, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, borderBottom:"1px solid #222" }}>
                <div style={{ display:"flex", alignItems:"center", gap:32 }}>
                    <Link to="/home" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                        <span style={{ fontSize:28 }}>🐼</span>
                        <span style={{ fontSize:22, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</span>
                    </Link>
                    <div style={{ display:"flex", gap:20 }}>
                        <Link to="/home" className="nav-link">Home</Link>
                        <Link to="/submit" className="nav-link">Submit App</Link>
                        <Link to="/admin" className="nav-link">Admin</Link>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ padding:"8px 20px", background:"transparent", border:"1px solid #e5e5e5", borderRadius:4, color:"#e5e5e5", fontSize:14, cursor:"pointer" }}>Sign Out</button>
            </nav>

            <div style={{ maxWidth:800, margin:"0 auto", padding:"48px 24px" }}>

                {/* Profile Header */}
                <div style={{ display:"flex", alignItems:"center", gap:24, marginBottom:40, padding:32, background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a" }}>
                    <div style={{ width:80, height:80, borderRadius:"50%", background:"#e50914", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>🐼</div>
                    <div>
                        <h1 style={{ fontSize:28, fontWeight:700, marginBottom:4 }}>{user.username}</h1>
                        <p style={{ color:"#737373", fontSize:14 }}>{user.email}</p>
                        <span style={{ display:"inline-block", marginTop:8, padding:"4px 12px", background: user.is_admin ? "#e5091422" : "#46d36922", border:`1px solid ${user.is_admin ? "#e50914" : "#46d369"}`, borderRadius:4, fontSize:12, fontWeight:700, color: user.is_admin ? "#e50914" : "#46d369" }}>
                            {user.is_admin ? "⚡ Admin" : "⭐ Member"}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:40 }}>
                    {[
                        { label:"Member Since", value: new Date(user.created_at).toLocaleDateString() },
                        { label:"Total Purchases", value: purchases.length },
                        { label:"Account Status", value: user.is_active ? "Active" : "Inactive" },
                    ].map((item, i) => (
                        <div key={i} className="info-card" style={{ textAlign:"center" }}>
                            <p style={{ color:"#737373", fontSize:12, marginBottom:8, textTransform:"uppercase", letterSpacing:1 }}>{item.label}</p>
                            <p style={{ fontSize:20, fontWeight:700 }}>{item.value}</p>
                        </div>
                    ))}
                </div>

                {/* Purchases */}
                <div>
                    <h2 style={{ fontSize:20, fontWeight:700, marginBottom:20, color:"#e5e5e5" }}>My Purchases</h2>
                    {purchases.length === 0 ? (
                        <div style={{ textAlign:"center", padding:"60px 0", background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a" }}>
                            <div style={{ fontSize:48, marginBottom:12 }}>🐼</div>
                            <p style={{ color:"#737373", marginBottom:20 }}>No purchases yet</p>
                            <Link to="/home">
                                <button style={{ padding:"12px 28px", background:"#e50914", border:"none", borderRadius:4, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Browse Apps</button>
                            </Link>
                        </div>
                    ) : (
                        purchases.map((p) => (
                            <div key={p.id} className="purchase-item">
                                <div>
                                    <p style={{ fontWeight:700, marginBottom:4 }}>App ID: {p.app_id}</p>
                                    <p style={{ color:"#737373", fontSize:13 }}>{new Date(p.purchased_at).toLocaleDateString()}</p>
                                </div>
                                <span style={{ color:"#46d369", fontSize:13, fontWeight:700 }}>✓ Purchased</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ borderTop:"1px solid #222", padding:"40px 48px", color:"#737373", fontSize:13, textAlign:"center" }}>
                <span style={{ fontSize:16 }}>🐼</span> <span style={{ color:"#e50914", fontWeight:700 }}>PANDASTORE</span> © 2026
            </footer>
        </div>
    );
}