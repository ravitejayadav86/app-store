import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
    const [pending, setPending] = useState([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/admin/pending")
            .then(({ data }) => { setPending(data); setLoading(false); })
            .catch(() => { setMsg("Access denied - admin only"); setLoading(false); });
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/approve/${id}`);
            setPending(pending.filter(app => app.id !== id));
            setMsg("App approved!");
        } catch { setMsg("Approval failed"); }
    };

    const handleReject = async (id) => {
        try {
            await api.delete(`/admin/apps/${id}`);
            setPending(pending.filter(app => app.id !== id));
            setMsg("App rejected");
        } catch { setMsg("Rejection failed"); }
    };

    return (
        <div style={{ minHeight:"100vh", background:"#141414", color:"#fff", animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
                @keyframes revealPage {
                    from { opacity: 0; filter: blur(10px); transform: scale(0.98); }
                    to { opacity: 1; filter: blur(0); transform: scale(1); }
                }
                @keyframes revealItem {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .nav-link { color:#e5e5e5; text-decoration:none; font-size:14px; transition: color 0.3s; }
                .nav-link:hover { color:#fff; }
                .app-row { 
                    background:#1f1f1f; border:1px solid #2a2a2a; border-radius:8px; padding:20px 24px; 
                    margin-bottom:12px; display:flex; justify-content:space-between; align-items:center; 
                    gap:16px; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    animation: revealItem 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    opacity: 0;
                }
                .app-row:hover { border-color:#e50914; transform: translateX(8px); }
                .approve-btn { 
                    padding:10px 20px; background:#46d369; border:none; border-radius:4px; 
                    color:#000; font-size:13px; font-weight:700; cursor:pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .approve-btn:hover { background:#3bc95e; transform: translateY(-2px); }
                .approve-btn:active { transform: scale(0.94); }
                .reject-btn { 
                    padding:10px 20px; background:#e50914; border:none; border-radius:4px; 
                    color:#fff; font-size:13px; font-weight:700; cursor:pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .reject-btn:hover { background:#f40612; transform: translateY(-2px); }
                .reject-btn:active { transform: scale(0.94); }
            `}</style>
            <nav style={{ background:"rgba(20,20,20,0.95)", position:"sticky", top:0, zIndex:100, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, borderBottom:"1px solid #222" }}>
                <div style={{ display:"flex", alignItems:"center", gap:32 }}>
                    <Link to="/home" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                        <span style={{ fontSize:28 }}>🐼</span>
                        <span style={{ fontSize:22, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</span>
                    </Link>
                    <Link to="/home" className="nav-link">Home</Link>
                    <Link to="/profile" className="nav-link">Profile</Link>
                </div>
                <span style={{ color:"#e50914", fontWeight:700 }}>Admin Panel</span>
            </nav>
            <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 24px" }}>
                <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8 }}>Pending Apps</h1>
                <p style={{ color:"#737373", marginBottom:32 }}>Review and approve submitted apps</p>
                {msg && <div style={{ background:"#46d36922", border:"1px solid #46d369", borderRadius:4, padding:"12px 16px", marginBottom:20, color:"#46d369", fontSize:14 }}>{msg}</div>}
                {loading && <div style={{ textAlign:"center", padding:"60px 0", color:"#737373" }}>Loading...</div>}
                {!loading && pending.length === 0 && (
                    <div style={{ textAlign:"center", padding:"60px 0", background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a" }}>
                        <p style={{ color:"#737373", fontSize:18 }}>No pending apps</p>
                    </div>
                )}
                {pending.map((app, i) => (
                    <div key={app.id} className="app-row" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                        <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                                <h3 style={{ fontSize:18, fontWeight:700 }}>{app.name}</h3>
                                <span style={{ padding:"2px 10px", background:"#e5091422", border:"1px solid #e50914", borderRadius:4, fontSize:11, fontWeight:700, color:"#e50914" }}>{app.category}</span>
                            </div>
                            <p style={{ color:"#737373", fontSize:13, marginBottom:8 }}>{app.description || "No description"}</p>
                            <div style={{ display:"flex", gap:20, fontSize:12, color:"#737373" }}>
                                <span>Dev: {app.developer}</span>
                                <span>v{app.version}</span>
                                <span style={{ color: app.price === 0 ? "#46d369" : "#e5e5e5", fontWeight:700 }}>{app.price === 0 ? "Free" : `$${app.price}`}</span>
                            </div>
                        </div>
                        <div style={{ display:"flex", gap:10 }}>
                            <button className="approve-btn" onClick={() => handleApprove(app.id)}>Approve</button>
                            <button className="reject-btn" onClick={() => handleReject(app.id)}>Reject</button>
                        </div>
                    </div>
                ))}
            </div>
            <footer style={{ borderTop:"1px solid #222", padding:"40px 48px", color:"#737373", fontSize:13, textAlign:"center" }}>
                PANDASTORE 2026
            </footer>
        </div>
    );
}
