import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getApps } from "../api";

export default function Home() {
    const [apps, setApps] = useState([]);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getApps().then(({ data }) => setApps(data)).catch(() => setError("Failed to load apps"));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const filtered = apps.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
    const icons = ["🎮","🎵","📱","🚀","⚡","🌟","🎨","🔥","🛠️","📊","🎯","🧩"];

    return (
        <div style={{ minHeight:"100vh", background:"#141414", color:"#fff" }}>
            <style>{`
                * { box-sizing: border-box; }
                .app-card { transition: transform 0.3s, box-shadow 0.3s; cursor:pointer; }
                .app-card:hover { transform: scale(1.05); box-shadow: 0 8px 30px rgba(229,9,20,0.4); }
                .nav-link { color:#e5e5e5; text-decoration:none; font-size:14px; transition:color 0.2s; }
                .nav-link:hover { color:#fff; }
                .search-input { background:#333; border:none; border-radius:4px; padding:8px 16px; color:#fff; font-size:14px; outline:none; width:240px; }
                .search-input::placeholder { color:#8c8c8c; }
                .tag { display:inline-block; padding:3px 10px; border-radius:4px; font-size:11px; font-weight:700; background:#e5090422; color:#e50914; margin-bottom:10px; }
                .view-btn { padding:8px 20px; background:#e50914; border:none; border-radius:4px; color:#fff; font-size:13px; font-weight:700; cursor:pointer; transition:background 0.2s; }
                .view-btn:hover { background:#f40612; }
            `}</style>

            {/* Navbar */}
            <nav style={{ background:"rgba(20,20,20,0.95)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:100, padding:"0 48px", display:"flex", alignItems:"center", justifyContent:"space-between", height:68, borderBottom:"1px solid #222" }}>
                <div style={{ display:"flex", alignItems:"center", gap:32 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:28 }}>🐼</span>
                        <span style={{ fontSize:22, fontWeight:900, color:"#e50914", letterSpacing:2 }}>PANDASTORE</span>
                    </div>
                    <div style={{ display:"flex", gap:20 }}>
                        <Link to="/home" className="nav-link">Home</Link>
                        <Link to="/submit" className="nav-link">Submit App</Link>
                        <Link to="/admin" className="nav-link">Admin</Link>
                        <Link to="/profile" className="nav-link">Profile</Link>
                    </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                    <input className="search-input" placeholder="🔍  Search apps..." value={search} onChange={e => setSearch(e.target.value)} />
                    <button onClick={handleLogout} style={{ padding:"8px 20px", background:"transparent", border:"1px solid #e5e5e5", borderRadius:4, color:"#e5e5e5", fontSize:14, cursor:"pointer" }}>Sign Out</button>
                </div>
            </nav>

            {/* Hero Banner */}
            <div style={{ background:"linear-gradient(to bottom, #1a1a1a, #141414)", padding:"80px 48px 60px", borderBottom:"1px solid #222" }}>
                <div style={{ maxWidth:600 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e50914", letterSpacing:3, marginBottom:16, textTransform:"uppercase" }}>🐼 PandaStore Original</div>
                    <h1 style={{ fontSize:52, fontWeight:900, lineHeight:1.1, marginBottom:20 }}>Discover Amazing Apps</h1>
                    <p style={{ color:"#a3a3a3", fontSize:18, lineHeight:1.6, marginBottom:32 }}>Find, download and share the best apps in the universe. Built by creators, for creators.</p>
                    <div style={{ display:"flex", gap:16 }}>
                        <Link to="/submit">
                            <button style={{ padding:"14px 32px", background:"#e50914", border:"none", borderRadius:4, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer" }}>🚀 Submit Your App</button>
                        </Link>
                        <Link to="/profile">
                            <button style={{ padding:"14px 32px", background:"rgba(109,109,110,0.7)", border:"none", borderRadius:4, color:"#fff", fontSize:16, fontWeight:700, cursor:"pointer" }}>👤 My Profile</button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Apps Grid */}
            <div style={{ padding:"48px", maxWidth:1400, margin:"0 auto" }}>
                <h2 style={{ fontSize:24, fontWeight:700, marginBottom:24, color:"#e5e5e5" }}>
                    {search ? `Search results for "${search}"` : "All Apps"}
                </h2>
                {error && <p style={{ color:"#e87c03" }}>{error}</p>}
                {filtered.length === 0 && !error && (
                    <div style={{ textAlign:"center", color:"#737373", padding:"80px 0" }}>
                        <div style={{ fontSize:64, marginBottom:16 }}>🐼</div>
                        <p style={{ fontSize:18 }}>No apps found</p>
                    </div>
                )}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:20 }}>
                    {filtered.map((app, i) => (
                        <div key={app.id} className="app-card" style={{ background:"#1f1f1f", borderRadius:8, overflow:"hidden", border:"1px solid #2a2a2a" }}>
                            <div style={{ height:140, background:`linear-gradient(135deg, #${['1a1a2e','0d1b2a','1b1b2f','2d1b3d','1a2a1a'][i%5]}, #${['16213e','1a1a2e','2d1b3d','0d1b2a','2a1a1a'][i%5]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52 }}>
                                {icons[i % icons.length]}
                            </div>
                            <div style={{ padding:16 }}>
                                <div className="tag">{app.category}</div>
                                <h3 style={{ fontSize:16, fontWeight:700, marginBottom:6, color:"#fff" }}>{app.name}</h3>
                                <p style={{ color:"#737373", fontSize:13, marginBottom:12, lineHeight:1.5, height:40, overflow:"hidden" }}>{app.description || "No description available"}</p>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                                    <span style={{ fontSize:16, fontWeight:700, color:app.price === 0 ? "#46d369" : "#e5e5e5" }}>{app.price === 0 ? "Free" : `$${app.price}`}</span>
                                    <Link to={`/apps/${app.id}`}>
                                        <button className="view-btn">View</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ borderTop:"1px solid #222", padding:"40px 48px", color:"#737373", fontSize:13 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                    <span style={{ fontSize:20 }}>🐼</span>
                    <span style={{ color:"#e50914", fontWeight:700 }}>PANDASTORE</span>
                </div>
                <p>© 2026 PandaStore. All rights reserved.</p>
            </footer>
        </div>
    );
}