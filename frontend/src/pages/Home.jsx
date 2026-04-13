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
        <div style={{ minHeight: "100vh", padding: "24px", animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
            <style>{`
        @keyframes revealPage {
          from { opacity: 0; transform: scale(0.98); filter: blur(10px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes revealItem {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .app-card {
          animation: revealItem 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
          opacity: 0;
        }
        .app-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,210,255,0.25);
          border-color: #00d2ff;
        }
        .nav-btn { 
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
          cursor: pointer;
        }
        .nav-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .nav-btn:active { transform: scale(0.96); }
        .cat-pill { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer; }
        .cat-pill:hover { transform: translateY(-2px); }
        .cat-pill:active { transform: scale(0.94); }
        .logo-float { animation: float 3s ease-in-out infinite; display: inline-block; }
        .search-input { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .search-input:focus { border-color: #e50914 !important; box-shadow: 0 0 15px rgba(229,9,20,0.1); transform: scale(1.01); }
        .spinner { animation: spin 1s linear infinite; display: inline-block; }
        select {
          background: rgba(255,255,255,0.07);
          border: 2px solid #333;
          color: #fff;
          padding: 10px 14px;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        select:hover { border-color: #e5091444; }
        select option { background: #141414; }
      `}</style>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(20,20,20,0.95)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(229,9,20,0.2)",
                borderRadius: 16,
                padding: "14px 24px",
                marginBottom: 32,
                maxWidth: 1100,
                margin: "0 auto 32px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="logo-float" style={{ fontSize: 28 }}>🐼</span>
                    <span style={{
                        fontSize: 22, fontWeight: 900,
                        background: "linear-gradient(135deg, #e50914, #00d2ff)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        letterSpacing: 2
                    }}>PANDASTORE</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <Link to="/submit">
                        <button className="nav-btn" style={{
                            padding: "8px 18px",
                            background: "linear-gradient(135deg, #e50914, #b9090b)",
                            color: "#fff", borderRadius: 12, border: "none", fontWeight: 700
                        }}>🚀 Submit</button>
                    </Link>
                    <Link to="/profile">
                        <button className="nav-btn" style={{
                            padding: "8px 18px",
                            background: "transparent",
                            color: "#00d2ff", border: "1px solid #00d2ff", borderRadius: 12, fontWeight: 700
                        }}>👤 Profile</button>
                    </Link>
                    <button className="nav-btn" onClick={handleLogout} style={{
                        padding: "8px 18px",
                        background: "transparent",
                        color: "#fff", borderRadius: 12, border: "1px solid #444", fontWeight: 700
                    }}>Logout 🚪</button>
                </div>
            </div>

            {/* Hero */}
            <div style={{ textAlign: "center", maxWidth: 1100, margin: "0 auto 36px" }}>
                <h1 style={{
                    fontSize: 48, fontWeight: 900,
                    background: "linear-gradient(135deg, #e50914, #fff, #00d2ff)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    marginBottom: 12,
                }}>Discover Amazing Apps 🐼</h1>
                <p style={{ color: "#737373", fontSize: 18 }}>
                    Find and download the best apps in the universe 🌌
                </p>
            </div>

            {/* Search + Sort */}
            <div style={{
                maxWidth: 1100, margin: "0 auto 24px",
                display: "flex", gap: 12, flexWrap: "wrap",
            }}>
                <input
                    className="search-input"
                    placeholder="🔍 Search apps..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        flex: 1, minWidth: 200,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "2px solid #333",
                        background: "rgba(255,255,255,0.07)",
                        color: "#fff", fontSize: 15,
                        fontFamily: "'Nunito', sans-serif",
                        outline: "none", marginBottom: 0,
                        transition: "border 0.3s",
                    }}
                />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                </select>
            </div>

            {/* Category Pills */}
            <div style={{
                maxWidth: 1100, margin: "0 auto 28px",
                display: "flex", gap: 10, flexWrap: "wrap",
            }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className="cat-pill"
                        onClick={() => setCategory(cat)}
                        style={{
                            padding: "8px 18px",
                            borderRadius: 20,
                            border: "none",
                            fontSize: 13, fontWeight: 700,
                            background: category === cat
                                ? "linear-gradient(135deg, #e50914, #00d2ff)"
                                : "rgba(255,255,255,0.08)",
                            color: category === cat ? "#fff" : "#737373",
                            boxShadow: category === cat ? "0 0 15px rgba(0,210,255,0.4)" : "none",
                        }}
                    >{cat}</button>
                ))}
            </div>

            {/* Results count */}
            <div style={{ maxWidth: 1100, margin: "0 auto 16px" }}>
                <p style={{ color: "#9090bb", fontSize: 14 }}>
                    {loading ? "" : `${filtered.length} app${filtered.length !== 1 ? "s" : ""} found`}
                </p>
            </div>

            {/* Apps Grid */}
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {error && <p style={{ color: "#ff6b6b", textAlign: "center" }}>{error}</p>}

                {loading && (
                    <div style={{ textAlign: "center", padding: 60 }}>
                        <span className="spinner" style={{ fontSize: 48 }}>🌀</span>
                    </div>
                )}

                {!loading && filtered.length === 0 && (
                    <div style={{ textAlign: "center", color: "#9090bb", marginTop: 60 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🌠</div>
                        <p style={{ fontSize: 18 }}>No apps found</p>
                        <p style={{ fontSize: 14, marginTop: 8 }}>Try a different search or category</p>
                    </div>
                )}

                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                }}>
                    {filtered.map((app, i) => (
                        <div key={app.id} className="app-card" style={{
                            background: "rgba(255,255,255,0.05)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(224,64,251,0.2)",
                            borderRadius: 20,
                            padding: 24,
                            animationDelay: `${i * 0.05}s`,
                        }}>
                            <div style={{ fontSize: 40, marginBottom: 12, textAlign: "center" }}>
                                {EMOJIS[app.id % 8]}
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{app.name}</h3>
                             <span style={{
                                display: "inline-block",
                                padding: "3px 10px", borderRadius: 20,
                                fontSize: 12, fontWeight: 700,
                                background: "rgba(0,210,255,0.15)",
                                border: "1px solid rgba(0,210,255,0.5)",
                                color: "#00d2ff", marginBottom: 10,
                            }}>{app.category}</span>
                            <p style={{ color: "#a3a3a3", fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>
                                {app.description?.length > 80
                                    ? app.description.slice(0, 80) + "..."
                                    : app.description}
                            </p>
                            <p style={{ color: "#737373", fontSize: 12, marginBottom: 12 }}>
                                👨‍💻 {app.developer}
                            </p>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{
                                    fontSize: 20, fontWeight: 900,
                                    background: "linear-gradient(135deg, #fff, #00d2ff)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                }}>{app.price === 0 ? "Free" : `$${app.price}`}</span>
                                <Link to={`/apps/${app.id}`}>
                                    <button style={{
                                        padding: "8px 20px",
                                        background: "linear-gradient(135deg, #00d2ff, #007bff)",
                                        color: "#000", fontSize: 14, borderRadius: 10, fontWeight: 700,
                                        border: "none", cursor: "pointer"
                                    }}>View 👁️</button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}