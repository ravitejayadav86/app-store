import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getApp, purchaseApp } from "../api";

export default function AppDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const navigate = useNavigate();
    const BACKEND = import.meta.env.VITE_API_URL || "https://app-store-backend-dbci.onrender.com";

    useEffect(() => {
        getApp(id).then(({ data }) => setApp(data)).catch(() => setMsg("App not found"));
    }, [id]);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await purchaseApp(id);
            setMsg("App purchased successfully!");
            setPurchased(true);
        } catch (err) {
            setMsg(err.response?.data?.detail || "Purchase failed");
        } finally {
            setLoading(false);
        }
    };

    if (!app) return (
        <div style={{ minHeight:"100vh", background:"#141414", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ color:"#e50914", fontSize:24 }}>Loading...</div>
        </div>
    );

    return (
        <div style={{ minHeight:"100vh", background:"#141414", color:"#fff", animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
                @keyframes revealPage {
                    from { opacity: 0; filter: blur(10px); transform: scale(0.98); }
                    to { opacity: 1; filter: blur(0); transform: scale(1); }
                }
                @keyframes slideLeft {
                    from { opacity: 0; transform: translateX(-40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(40px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .buy-btn { 
                    width:100%; padding:16px; background:#e50914; border:none; border-radius:4px; 
                    color:#fff; font-size:16px; font-weight:700; cursor:pointer; margin-bottom:12px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .buy-btn:hover { background:#f40612; transform: translateY(-2px); }
                .buy-btn:active { transform: scale(0.96); }
                .buy-btn:disabled { background:#831010; cursor:default; transform: none; }
                .dl-btn { 
                    width:100%; padding:16px; background:#46d369; border:none; border-radius:4px; 
                    color:#000; font-size:16px; font-weight:700; cursor:pointer;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .dl-btn:hover { background:#3bc95e; transform: translateY(-2px); }
                .dl-btn:active { transform: scale(0.96); }
            `}</style>
            <nav style={{ background:"rgba(20,20,20,0.95)", position:"sticky", top:0, zIndex:100, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, borderBottom:"1px solid #222" }}>
                <Link to="/home" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                    <span style={{ fontSize:28 }}>🐼</span>
                    <span style={{ fontSize:22, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</span>
                </Link>
                <button onClick={() => navigate(-1)} style={{ padding:"8px 20px", background:"transparent", border:"1px solid #e5e5e5", borderRadius:4, color:"#e5e5e5", fontSize:14, cursor:"pointer" }}>Back</button>
            </nav>
            <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
                <div style={{ animation: "slideLeft 1s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                    <div style={{ background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a", height:300, display:"flex", alignItems:"center", justifyContent:"center", fontSize:100, marginBottom:20 }}>
                        🎮
                    </div>
                    <div style={{ background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a", padding:20 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                            <span style={{ color:"#737373", fontSize:13 }}>Developer</span>
                            <span style={{ fontSize:13, fontWeight:600 }}>{app.developer}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                            <span style={{ color:"#737373", fontSize:13 }}>Version</span>
                            <span style={{ fontSize:13, fontWeight:600 }}>v{app.version}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ color:"#737373", fontSize:13 }}>Category</span>
                            <span style={{ fontSize:13, fontWeight:600, color:"#e50914" }}>{app.category}</span>
                        </div>
                    </div>
                </div>
                <div style={{ animation: "slideRight 1s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e50914", letterSpacing:3, marginBottom:12, textTransform:"uppercase" }}>{app.category}</div>
                    <h1 style={{ fontSize:36, fontWeight:900, marginBottom:16 }}>{app.name}</h1>
                    <p style={{ color:"#a3a3a3", fontSize:16, lineHeight:1.7, marginBottom:32 }}>{app.description || "No description available."}</p>
                    <div style={{ marginBottom:32 }}>
                        <span style={{ fontSize:42, fontWeight:900, color: app.price === 0 ? "#46d369" : "#fff" }}>
                            {app.price === 0 ? "Free" : `$${app.price}`}
                        </span>
                    </div>
                    {msg && (
                        <div style={{ background: purchased ? "#46d36922" : "#e5091422", border:`1px solid ${purchased ? "#46d369" : "#e50914"}`, borderRadius:4, padding:"12px 16px", marginBottom:16, color: purchased ? "#46d369" : "#e50914", fontSize:14 }}>
                            {msg}
                        </div>
                    )}
                    <button className="buy-btn" onClick={handlePurchase} disabled={loading || purchased}>
                        {loading ? "Processing..." : purchased ? "Purchased" : app.price === 0 ? "Get for Free" : "Purchase Now"}
                    </button>
                    {purchased && app.file_path && (
                        <a href={`${BACKEND}/apps/${app.id}/download`} target="_blank" rel="noreferrer">
                            <button className="dl-btn">Download App</button>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
