import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getApp, purchaseApp, downloadApp } from "../api";

const EMOJIS = ["🎮", "🎵", "📱", "🚀", "⚡", "🌟", "🎨", "🔥"];

export default function AppDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        getApp(id).then(({ data }) => setApp(data)).catch(() => setMsg("App not found"));
        // Check if already purchased
        getPurchases().then(({ data }) => {
            if (data.some(p => p.app_id === parseInt(id))) {
                setPurchased(true);
            }
        }).catch(() => {});
    }, [id]);

    const handlePurchase = async () => {
        setLoading(true);
        try {
            await purchaseApp(id);
            setMsg("App purchased successfully!");
            setPurchased(true);
        } catch (err) {
            if (err.response?.status === 400 && err.response?.data?.detail === "Already purchased") {
                setPurchased(true);
                setMsg("You already own this application.");
            } else {
                setMsg(err.response?.data?.detail || "Purchase failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!app?.file_path) return;
        setDownloading(true);
        try {
            const response = await downloadApp(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", app.file_path.split('/').pop() || "download");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch {
            setMsg("Download failed. Make sure you have purchased this app.");
        } finally {
            setDownloading(false);
        }
    };

    if (!app) return (
        <div style={{ minHeight: "100vh", background: "var(--panda-black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "var(--panda-red)", fontSize: 24, fontWeight: 800 }}>Loading...</div>
        </div>
    );

    const appEmoji = EMOJIS[app.id % 8];

    return (
        <div style={{ minHeight: "100vh", paddingBottom: 100, animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
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
                .back-btn {
                    padding: 8px 20px;
                    background: transparent;
                    border: 1px solid var(--panda-border);
                    color: #fff;
                    font-size: 14px;
                    border-radius: 100px;
                    transition: var(--transition);
                }
                .back-btn:hover {
                    background: var(--panda-glass);
                    border-color: #fff;
                }
                .hero-stage {
                    position: relative;
                    width: 100%;
                    max-width: 1000px;
                    margin: 60px auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                    align-items: center;
                    padding: 0 40px;
                }
                .emoji-stage {
                    position: relative;
                    aspect-ratio: 1;
                    background: var(--panda-glass);
                    border: 1px solid var(--panda-border);
                    border-radius: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 120px;
                    box-shadow: var(--shadow-lg);
                    z-index: 2;
                    animation: float 6s ease-in-out infinite;
                }
                .emoji-stage:hover {
                    animation: float 6s ease-in-out infinite, glitch 0.5s infinite;
                    border-color: #fff;
                }
                .emoji-reflection {
                    position: absolute;
                    inset: -40px;
                    background: var(--panda-red);
                    filter: blur(120px);
                    opacity: 0.15;
                    border-radius: 50%;
                    z-index: 1;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: var(--panda-glass);
                    border: 1px solid var(--panda-border);
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 800;
                    color: var(--panda-blue);
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 24px;
                }
                .action-btn-primary {
                    width: 100%;
                    padding: 18px;
                    background: var(--panda-gradient);
                    color: #fff;
                    font-weight: 800;
                    font-size: 16px;
                    border-radius: 16px;
                    border: none;
                    transition: var(--transition);
                    cursor: pointer;
                }
                .action-btn-primary:hover:not(:disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(229, 9, 20, 0.4);
                    animation: glitch 0.3s infinite;
                }
                .action-btn-secondary {
                    width: 100%;
                    padding: 18px;
                    background: #fff;
                    color: #000;
                    font-weight: 800;
                    font-size: 16px;
                    border-radius: 16px;
                    border: none;
                    margin-top: 16px;
                    transition: var(--transition);
                    cursor: pointer;
                }
                .action-btn-secondary:hover:not(:disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(255, 255, 255, 0.3);
                }
                .info-pill {
                    background: var(--panda-glass);
                    border: 1px solid var(--panda-border);
                    padding: 12px 20px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .info-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 700;
                    color: #666;
                }
                .info-value {
                    font-size: 14px;
                    font-weight: 800;
                }
            `}</style>

            <nav className="glass-nav">
                <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                    <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                    <span style={{ fontSize: 24, fontWeight: 900, background: "var(--panda-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>PANDASTORE</span>
                </Link>
                <button className="back-btn" onClick={() => navigate(-1)}>Back to Browse</button>
            </nav>

            <main className="hero-stage">
                <div style={{ position: "relative", animation: "driftUp 1s var(--transition) forwards" }}>
                    <div className="emoji-reflection" style={{ animation: "singularityPulse 4s infinite" }} />
                    <div className="emoji-stage">{appEmoji}</div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 40 }}>
                        <div className="info-pill">
                            <span className="info-label">Developer</span>
                            <span className="info-value">{app.developer}</span>
                        </div>
                        <div className="info-pill">
                            <span className="info-label">Version</span>
                            <span className="info-value">v{app.version}</span>
                        </div>
                    </div>
                </div>

                <div style={{ animation: "slideRight 1s var(--transition) forwards" }}>
                    <div className="status-badge">{app.category}</div>
                    <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: -2, marginBottom: 20, lineHeight: 1 }}>{app.name}</h1>
                    <p style={{ color: "#888", fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
                        {app.description || "The definitive experience for modern users. This application pushes the boundaries of what's possible in the Cosmic Era."}
                    </p>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 40 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 800, color: "var(--panda-blue)", marginBottom: 8, letterSpacing: 1 }}>Investment</div>
                            <div style={{ fontSize: 48, fontWeight: 900, color: app.price === 0 ? "var(--panda-blue)" : "#fff" }}>
                                {app.price === 0 ? "Complimentary" : `$${app.price}`}
                            </div>
                        </div>
                    </div>

                    {msg && (
                        <div style={{ background: purchased ? "rgba(0, 210, 255, 0.1)" : "rgba(229, 9, 20, 0.1)", border: `1px solid ${purchased ? "var(--panda-blue)" : "var(--panda-red)"}`, borderRadius: 12, padding: 16, marginBottom: 24, color: purchased ? "var(--panda-blue)" : "var(--panda-red)", fontWeight: 700, fontSize: 14 }}>
                            {msg}
                        </div>
                    )}

                    <button className="action-btn-primary" onClick={handlePurchase} disabled={loading || purchased}>
                        {loading ? "Authenticating..." : purchased ? "Owned" : app.price === 0 ? "Add to My Collection" : "Acquire License"}
                    </button>

                    {(purchased || app.price === 0) && (
                        app.file_path ? (
                            <button className="action-btn-secondary" onClick={handleDownload} disabled={downloading}>
                                {downloading ? "Transmitting..." : "Download Resources"}
                            </button>
                        ) : (
                            <div style={{ 
                                marginTop: 16, 
                                padding: 16, 
                                background: "rgba(255, 255, 255, 0.05)", 
                                border: "1px dashed var(--panda-border)", 
                                borderRadius: 16,
                                textAlign: "center",
                                color: "#666",
                                fontSize: 13
                            }}>
                                📡 No binary resources are currently associated with this transmission.
                            </div>
                        )
                    )}
                </div>
            </main>
        </div>
    );
}

