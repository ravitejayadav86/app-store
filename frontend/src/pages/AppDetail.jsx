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

    const icons = ["🎮","🎵","📱","🚀","⚡","🌟","🎨","🔥","🛠️","📊","🎯","🧩"];

    if (!app) return (
        <div style={{ minHeight:"100vh", background:"#141414", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ color:"#e50914", fontSize:24 }}>🐼 Loading...</div>
        </div>
    );

    return (
        <div style={{ minHeight:"100vh", background:"#141414", color:"#fff" }}>
            <style>{`
                * { box-sizing: border-box; }
                .nav-link { color:#e5e5e5; text-decoration:none; font-size:14px; }
                .nav-link:hover { color:#fff; }
                .buy-btn { width:100%; padding:16px; background:#e50914; border:none; border-radius:4px; color:#fff; font-size:16px; font-weight:700; cursor:pointer; transition:background 0.2s; margin-bottom:12px; }
                .buy-btn:hover { background:#f40612; }
                .buy-btn:disabled { background:#831010; cursor:default; }
                .dl-btn { width:100%; padding:16px; background:#46d369; border:none; border-radius:4px; color:#000; font-size:16px; font-weight:700; cursor:pointer; }
                .dl-btn:hover { background:#3bc95e; }
            `}</style>

            {/* Navbar */}
            <nav style={{ background:"rgba(20,20,20,0.95)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:100, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, borderBottom:"1px solid #222" }}>
                <Link to="/home" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
                    <span style={{ fontSize:28 }}>🐼</span>
                    <span style={{ fontSize:22, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</span>
                </Link>
                <button onClick={() => navigate(-1)} style={{ padding:"8px 20px", background:"transparent", border:"1px solid #e5e5e5", borderRadius:4, color:"#e5e5e5", fontSize:14, cursor:"pointer" }}>← Back</button>
            </nav>

            <div style={{ maxWidth:900, margin:"0 auto", padding:"48px 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }}>

                {/* Left - App Image/Icon */}
                <div>
                    <div style={{ background:"#1f1f1f", borderRadius:8, border:"1px solid #2a2a2a", height:300, display:"flex", alignItems:"center", justifyContent:"center", fontSize:100, marginBottom:20 }}>
                        {icons[app.id % icons.length]}
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

                {/* Right - App Info */}
                <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e50914", letterSpacing:3, marginBottom:12, textTransform:"uppercase" }}>{app.category}</div>
                    <h1 style={{ fontSize:36, fontWeight:900, marginBottom:16, lineHeight:1.2 }}>{app.name}</h1>
                    <p style={{ color:"#a3a3a3", fontSize:16, lineHeight:1.7, marginBottom:32 }}>{app.description || "No description available."}</p>

                    <div style={{ marginBottom:32 }}>
                        <span style={{ fontSize:42, fontWeight:900, color: app.price === 0 ? "#46d369" : "#fff" }}>
                            {app.price === 0 ? "Free"