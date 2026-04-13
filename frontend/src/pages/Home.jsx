import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getApps } from "../api";

const CATEGORIES = ["All", "Utilities", "Games", "Education", "Music", "Productivity", "Social", "Health", "Finance"];
const EMOJIS = ["🎮", "🎵", "📱", "🚀", "⚡", "🌟", "🎨", "🔥"];

export default function Home() {
    const [apps, setApps] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getApps()
            .then(({ data }) => setApps(data))
            .catch(() => setError("Failed to load apps"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        let result = [...apps];
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(a =>
                a.name.toLowerCase().includes(lowerSearch) ||
                a.description?.toLowerCase().includes(lowerSearch)
            );
        }
        if (category !== "All") result = result.filter(a => a.category === category);
        
        if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
        else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
        else if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === "newest") result.sort((a, b) => b.id - a.id);
        
        return result;
    }, [search, category, sortBy, apps]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div style={{ minHeight: "100vh", padding: "0 0 60px 0", animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
                .glass-nav {
                    background: rgba(10, 10, 15, 0.8);
                    backdrop-filter: blur(20px);
                    border-bottom: 1px solid var(--panda-border);
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    padding: 0 48px;
                    height: 72px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .nav-btn-secondary {
                    padding: 8px 20px;
                    background: transparent;
                    border: 1px solid var(--panda-border);
                    color: #fff;
                    font-size: 14px;
                    border-radius: 100px;
                    transition: var(--transition);
                }
                .nav-btn-secondary:hover {
                    background: var(--panda-glass);
                    border-color: #fff;
                }
                .nav-btn-primary {
                    padding: 8px 20px;
                    background: var(--panda-gradient);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    border-radius: 100px;
                    transition: var(--transition);
                }
                .nav-btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(229, 9, 20, 0.3);
                }
                .hero-section {
                    padding: 80px 24px 60px;
                    text-align: center;
                    background: radial-gradient(circle at 50% 50%, rgba(0, 210, 255, 0.05) 0%, transparent 70%);
                }
                .dashboard-bar {
                    max-width: 1100px;
                    margin: 0 auto 40px;
                    background: var(--panda-glass);
                    border: 1px solid var(--panda-border);
                    border-radius: 20px;
                    padding: 16px 24px;
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    backdrop-filter: blur(10px);
                }
                .search-field {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: #fff;
                    font-size: 16px;
                    outline: none;
                }
                .filter-select {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--panda-border);
                    color: #fff;
                    padding: 8px 16px;
                    border-radius: 12px;
                    font-size: 14px;
                    outline: none;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .filter-select:hover {
                    border-color: var(--panda-blue);
                }
                .category-scroller {
                    max-width: 1100px;
                    margin: 0 auto 32px;
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding: 4px;
                    scrollbar-width: none;
                }
                .category-scroller::-webkit-scrollbar { display: none; }
                .cat-chip {
                    padding: 8px 24px;
                    border-radius: 100px;
                    white-space: nowrap;
                    font-size: 14px;
                    font-weight: 600;
                    border: 1px solid var(--panda-border);
                    background: var(--panda-glass);
                    color: #777;
                    transition: var(--transition);
                }
                .cat-chip.active {
                    background: #fff;
                    color: #000;
                    border-color: #fff;
                }
                .cat-chip:hover:not(.active) {
                    border-color: #aaa;
                    color: #fff;
                }
                .app-grid {
                    max-width: 1100px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 24px;
                    padding: 0 24px;
                }
                .panda-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--panda-border);
                    border-radius: 24px;
                    padding: 32px;
                    transition: var(--transition);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                .panda-card::before {
                    content: '';
                    position: absolute;
                    inset: -50%;
                    background: conic-gradient(from 0deg, transparent, var(--panda-blue), transparent, var(--panda-red), transparent);
                    animation: rotate 10s linear infinite;
                    opacity: 0;
                    transition: var(--transition);
                }
                .panda-card:hover {
                    transform: translateY(-12px) scale(1.02);
                    border-color: #fff;
                    box-shadow: 0 0 30px rgba(0, 210, 255, 0.2), 0 0 60px rgba(229, 9, 20, 0.1);
                    z-index: 10;
                }
                .panda-card:hover::before { opacity: 0.1; }
                .price-tag {
                    font-size: 24px;
                    font-weight: 900;
                    letter-spacing: -1px;
                }
                .price-free {
                    background: linear-gradient(135deg, #00d2ff, #007bff);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .view-btn {
                    padding: 10px 24px;
                    background: #fff;
                    color: #000;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 14px;
                    transition: var(--transition);
                    border: none;
                    cursor: pointer;
                }
                .view-btn:hover {
                    transform: scale(1.05);
                    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
                    animation: glitch 0.3s infinite;
                }
            `}</style>

            <nav className="glass-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                    <span style={{ 
                        fontSize: 24, 
                        fontWeight: 900, 
                        background: "var(--panda-gradient)", 
                        WebkitBackgroundClip: "text", 
                        WebkitTextFillColor: "transparent",
                        letterSpacing: -0.5
                    }}>PANDASTORE</span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <Link to="/submit"><button className="nav-btn-primary">Submit App</button></Link>
                    <Link to="/profile"><button className="nav-btn-secondary">Profile</button></Link>
                    <button className="nav-btn-secondary" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <header className="hero-section" style={{ animation: "driftUp 1s var(--transition) forwards" }}>
                <h1 style={{ 
                    fontSize: " clamp(32px, 5vw, 64px)", 
                    fontWeight: 900, 
                    lineHeight: 1.1,
                    marginBottom: 20,
                    letterSpacing: -2,
                    animation: "revealPage 1.5s var(--transition) forwards"
                }}>
                    The future of <span style={{ color: "var(--panda-blue)", textShadow: "0 0 20px var(--panda-blue)" }}>apps</span> is here.
                </h1>
                <p style={{ color: "#888", fontSize: 18, maxWidth: 600, margin: "0 auto", opacity: 0, animation: "fadeIn 1s var(--transition) 0.5s forwards" }}>
                    Explore a curated collection of next-generation applications optimized for the Cosmic Era.
                </p>
            </header>

            <div className="dashboard-bar">
                <span style={{ fontSize: 20 }}>🔍</span>
                <input 
                    className="search-field" 
                    placeholder="Search the store..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest</option>
                    <option value="price-low">Lowest Price</option>
                    <option value="price-high">Highest Price</option>
                    <option value="name">A - Z</option>
                </select>
            </div>

            <div className="category-scroller">
                {CATEGORIES.map(cat => (
                    <div 
                        key={cat} 
                        className={`cat-chip ${category === cat ? "active" : ""}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat}
                    </div>
                ))}
            </div>

            <main className="app-grid">
                {loading && [1,2,3,4,5,6].map(n => (
                    <div key={n} className="panda-card" style={{ height: 320, opacity: 0.3 }}>
                        <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 12 }} />
                    </div>
                ))}

                {!loading && filtered.map((app, i) => (
                    <div key={app.id} className="panda-card" style={{ animation: `revealItem 0.8s var(--transition) ${i * 0.05}s forwards`, opacity: 0 }}>
                        <div style={{ fontSize: 52, marginBottom: 24 }}>{EMOJIS[app.id % 8]}</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--panda-blue)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{app.category}</div>
                        <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5 }}>{app.name}</h3>
                        <p style={{ color: "#888", fontSize: 15, lineHeight: 1.6, marginBottom: 24, flex: 1 }}>
                            {app.description?.length > 100 ? app.description.slice(0, 100) + "..." : app.description}
                        </p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Price</div>
                                <div className={`price-tag ${app.price === 0 ? "price-free" : ""}`}>
                                    {app.price === 0 ? "Free" : `$${app.price}`}
                                </div>
                            </div>
                            <Link to={`/apps/${app.id}`}>
                                <button className="view-btn">Details</button>
                            </Link>
                        </div>
                    </div>
                ))}
            </main>

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "100px 0" }}>
                    <div style={{ fontSize: 80, marginBottom: 24 }}>🌌</div>
                    <h2 style={{ fontSize: 32, fontWeight: 800 }}>Darkness reigns here.</h2>
                    <p style={{ color: "#666", marginTop: 12 }}>No apps matched your search criteria.</p>
                </div>
            )}
        </div>
    );
}