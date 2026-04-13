import { getApp, purchaseApp, downloadApp, getPurchases } from "../api";
import useParallax from "../hooks/useParallax";

const EMOJIS = ["🎮", "🎵", "📱", "🚀", "⚡", "🌟", "🎨", "🔥"];

export default function AppDetail() {
    const { id } = useParams();
    const [app, setApp] = useState(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [purchased, setPurchased] = useState(false);
    const navigate = useNavigate();
    const [downloading, setDownloading] = useState(false);
    const parallax = useParallax(15);

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
                .detail-stage {
                    max-width: 1100px;
                    margin: 60px auto;
                    padding: 0 24px;
                    display: grid;
                    grid-template-columns: 400px 1fr;
                    gap: 80px;
                }
                .app-artwork {
                    width: 400px;
                    height: 400px;
                    background: var(--panda-glass);
                    border: 1px solid #c0c0c0;
                    border-radius: 64px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 200px;
                    box-shadow: 0 40px 80px rgba(0,0,0,0.6);
                    transition: var(--transition);
                    animation: float 8s ease-in-out infinite;
                    backdrop-filter: blur(20px);
                }
                @keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-20px) rotate(1deg); } }
                
                .info-pill {
                    background: var(--panda-glass);
                    border: 1px solid var(--panda-border);
                    padding: 16px 24px;
                    border-radius: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .info-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: #666;
                    letter-spacing: 1px;
                }
                .info-value {
                    font-size: 16px;
                    font-weight: 900;
                }
                .status-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    background: rgba(0, 243, 255, 0.1);
                    color: var(--panda-blue);
                    border: 1px solid var(--panda-blue);
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    margin-bottom: 24px;
                }
                .action-btn-primary {
                    width: 100%;
                    padding: 20px;
                    background: var(--panda-gradient);
                    color: #fff;
                    font-weight: 900;
                    font-size: 16px;
                    border-radius: 20px;
                    border: none;
                    transition: var(--transition);
                    cursor: pointer;
                    box-shadow: 0 10px 30px rgba(0, 243, 255, 0.2);
                }
                .action-btn-primary:hover:not(:disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px rgba(0, 243, 255, 0.4);
                }
                .action-btn-secondary {
                    width: 100%;
                    padding: 20px;
                    background: #fff;
                    color: #000;
                    font-weight: 900;
                    font-size: 16px;
                    border-radius: 20px;
                    border: none;
                    margin-top: 16px;
                    transition: var(--transition);
                    cursor: pointer;
                }
                .action-btn-secondary:hover:not(:disabled) {
                    transform: translateY(-4px);
                    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
                }
            `}</style>

            <nav className="glass-nav">
                <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                    <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                    <span style={{ fontSize: 24, fontWeight: 900, background: "var(--panda-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>PANDASTORE</span>
                </Link>
                <button className="back-btn" onClick={() => navigate(-1)}>Back to Browse</button>
            </nav>

            <main className="detail-stage" style={{ 
                transform: `translate(${parallax.x}px, ${parallax.y}px)`, 
                transition: "transform 0.2s ease-out" 
            }}>
                <div style={{ position: "relative" }}>
                    <div className="app-artwork">
                        {appEmoji}
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 40 }}>
                        <div className="info-pill">
                            <span className="info-label">Developer</span>
                            <span className="info-value">{app.developer || "PandaTeam"}</span>
                        </div>
                        <div className="info-pill">
                            <span className="info-label">Version</span>
                            <span className="info-value">v{app.version}</span>
                        </div>
                    </div>
                </div>

                <div style={{ padding: "20px 0" }}>
                    <div className="status-badge">{app.category}</div>
                    <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: -3, marginBottom: 20, lineHeight: 1 }}>{app.name}</h1>
                    <p style={{ color: "#888", fontSize: 20, lineHeight: 1.6, marginBottom: 40, maxWidth: 600 }}>
                        {app.description || "The definitive experience for modern users. This application pushes the boundaries of what's possible in the Cosmic Era."}
                    </p>

                    <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 60 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 900, color: "var(--panda-blue)", marginBottom: 8, letterSpacing: 2 }}>Investment Access</div>
                            <div style={{ fontSize: 56, fontWeight: 900, color: app.price === 0 ? "var(--panda-blue)" : "#fff" }}>
                                {app.price === 0 ? "Complimentary" : `$${app.price}`}
                            </div>
                        </div>
                    </div>

                    {msg && (
                        <div style={{ background: purchased ? "rgba(0, 243, 255, 0.1)" : "rgba(229, 9, 20, 0.1)", border: `1px solid ${purchased ? "var(--panda-blue)" : "var(--panda-red)"}`, borderRadius: 20, padding: "20px 24px", marginBottom: 32, color: purchased ? "var(--panda-blue)" : "var(--panda-red)", fontWeight: 800, fontSize: 14 }}>
                            {msg}
                        </div>
                    )}

                    <button className="action-btn-primary" onClick={handlePurchase} disabled={loading || purchased}>
                        {loading ? "Authenticating..." : purchased ? "Licensed & Secured" : app.price === 0 ? "Add to My Collection" : "Acquire License"}
                    </button>

                    {(purchased || app.price === 0) && (
                        app.file_path ? (
                            <button className="action-btn-secondary" onClick={handleDownload} disabled={downloading}>
                                {downloading ? "Transmitting Binary..." : "Download Resources"}
                            </button>
                        ) : (
                            <div style={{ 
                                marginTop: 24, 
                                padding: 24, 
                                background: "rgba(255, 255, 255, 0.05)", 
                                border: "1px dashed var(--panda-border)", 
                                borderRadius: 24,
                                textAlign: "center",
                                color: "#666",
                                fontSize: 14
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
