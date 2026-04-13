import { getMe, getPurchases, downloadApp, getSubmissions } from "../api";
import useParallax from "../hooks/useParallax";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [purchases, setPurchases] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const navigate = useNavigate();
    const parallax = useParallax(12);

    useEffect(() => {
        getMe().then(({ data }) => setUser(data)).catch(() => navigate("/login"));
        getPurchases().then(({ data }) => setPurchases(data)).catch(() => {});
        getSubmissions().then(({ data }) => setSubmissions(data)).catch(() => {});
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    if (!user) return (
        <div style={{ minHeight: "100vh", background: "var(--panda-black)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "var(--panda-red)", fontSize: 32, fontWeight: 800 }}>🐼 Loading...</div>
        </div>
    );

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
                .profile-stage {
                    max-width: 900px;
                    margin: 60px auto;
                    padding: 0 24px;
                }
                .user-hero {
                    background: var(--panda-glass);
                    backdrop-filter: blur(40px);
                    border: 1px solid #c0c0c0;
                    border-radius: 32px;
                    padding: 48px;
                    display: flex;
                    align-items: center;
                    gap: 40px;
                    margin-bottom: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    animation: float 10s ease-in-out infinite;
                }
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
                .avatar-lg {
                    width: 120px;
                    height: 120px;
                    border-radius: 40px;
                    background: var(--panda-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 56px;
                    box-shadow: 0 20px 40px rgba(0, 243, 255, 0.2);
                }
                .stat-card {
                    background: var(--panda-glass);
                    border: 1px solid #c0c0c0;
                    border-radius: 20px;
                    padding: 24px;
                    text-align: center;
                    transition: var(--transition);
                }
                .stat-card:hover {
                    border-color: var(--panda-blue);
                    transform: translateY(-4px);
                }
                .purchase-row {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--panda-border);
                    border-radius: 16px;
                    padding: 20px 24px;
                    margin-bottom: 12px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    transition: var(--transition);
                }
                .purchase-row:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: var(--panda-blue);
                    transform: translateX(8px);
                }
                .badge-premium {
                    padding: 6px 16px;
                    background: rgba(0, 210, 255, 0.1);
                    border: 1px solid var(--panda-border);
                    border-radius: 100px;
                    color: var(--panda-blue);
                    font-size: 11px;
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
            `}</style>

            <nav className="glass-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                        <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                        <span style={{ fontSize: 24, fontWeight: 900, background: "var(--panda-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>PANDASTORE</span>
                    </Link>
                    <div style={{ display: "flex", gap: 24 }}>
                        <Link to="/home" className="nav-btn-secondary" style={{ border: "none" }}>Browse</Link>
                        <Link to="/submit" className="nav-btn-secondary" style={{ border: "none" }}>Publish</Link>
                        {user.is_admin && <Link to="/admin" className="nav-btn-secondary" style={{ border: "none" }}>Admin</Link>}
                    </div>
                </div>
                <button className="nav-btn-secondary" onClick={handleLogout}>Sign Out</button>
            </nav>

            <main className="profile-stage" style={{ 
                transform: `translate(${parallax.x}px, ${parallax.y}px)`,
                transition: "transform 0.2s ease-out"
            }}>
                <div className="user-hero">
                    <div className="avatar-lg">🐼</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
                            <h1 style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1.5 }}>{user.username}</h1>
                            {user.is_admin && <span className="badge-premium" style={{ color: "var(--panda-red)", borderColor: "var(--panda-red)", background: "rgba(229,9,20,0.1)" }}>Overlord</span>}
                        </div>
                        <p style={{ color: "#666", fontSize: 18, marginBottom: 20 }}>{user.email}</p>
                        <div className="badge-premium">Cosmic Associate</div>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 60 }}>
                    <div className="stat-card">
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Active Since</div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{new Date(user.created_at).getFullYear()}</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Total Fleet</div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{purchases.length} Apps</div>
                    </div>
                    <div className="stat-card">
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Missions</div>
                        <div style={{ fontSize: 20, fontWeight: 900 }}>{submissions.length} Submissions</div>
                    </div>
                </div>

                <section style={{ marginBottom: 60 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                        <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>My Transmissions</h2>
                        <Link to="/submit" className="badge-premium" style={{ textDecoration: "none", background: "var(--panda-gradient)", color: "#fff", border: "none" }}>+ New Broadcast</Link>
                    </div>
                    {submissions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, background: "rgba(255,255,255,0.01)", borderRadius: 24, border: "1px dashed var(--panda-border)" }}>
                            <p style={{ color: "#444", fontSize: 14 }}>No data transmissions detected from this vessel.</p>
                        </div>
                    ) : (
                        submissions.map((s, i) => (
                            <div key={s.id} className="purchase-row" style={{ animation: `revealItem 0.8s var(--transition) ${i * 0.05}s forwards`, opacity: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                    <div style={{ fontSize: 24 }}>{s.category === "Music" ? "🎵" : "🚀"}</div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{s.name}</div>
                                        <div style={{ fontSize: 12, color: "#666" }}>v{s.version} • {s.category}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    {s.is_approved ? (
                                        <span style={{ fontSize: 10, fontWeight: 900, color: "var(--panda-blue)", padding: "4px 10px", border: "1px solid var(--panda-blue)", borderRadius: 100 }}>LIVE</span>
                                    ) : (
                                        <span style={{ fontSize: 10, fontWeight: 900, color: "#666", padding: "4px 10px", border: "1px solid #333", borderRadius: 100 }}>PENDING REVIEW</span>
                                    )}
                                    <Link to={`/app/${s.id}`} style={{ fontSize: 12, color: "#888", fontWeight: 700, textDecoration: "none" }}>View Page</Link>
                                </div>
                            </div>
                        ))
                    )}
                </section>

                <section>
                    <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 24, letterSpacing: -0.5 }}>Command History</h2>
                    {purchases.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 80, background: "rgba(255,255,255,0.02)", borderRadius: 32, border: "1px dashed var(--panda-border)" }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>🪐</div>
                            <p style={{ color: "#666" }}>Your command history is currently empty.</p>
                            <Link to="/home"><button className="nav-btn-secondary" style={{ marginTop: 20 }}>Initialize Discovery</button></Link>
                        </div>
                    ) : (
                        purchases.map((p, i) => (
                            <div key={p.id} className="purchase-row" style={{ animation: `revealItem 0.8s var(--transition) ${i * 0.05}s forwards`, opacity: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--panda-glass)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📱</div>
                                    <div>
                                        <div style={{ fontWeight: 800 }}>{p.app?.name || `App Interface #${p.app_id}`}</div>
                                        <div style={{ fontSize: 12, color: "#666" }}>Acquired on {new Date(p.purchased_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ color: "var(--panda-blue)", fontWeight: 800, fontSize: 13 }}>SUCCESSFUL</div>
                                    {p.app?.file_path ? (
                                        <button 
                                            onClick={async () => {
                                                try {
                                                    const response = await downloadApp(p.app_id);
                                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                                    const link = document.createElement("a");
                                                    link.href = url;
                                                    link.setAttribute("download", p.app.file_path.split('/').pop() || "download");
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    link.parentNode.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch {
                                                    alert("Download failed.");
                                                }
                                            }}
                                            className="nav-btn-secondary" 
                                            style={{ fontSize: 12, padding: "4px 12px" }}
                                        >
                                            Download
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 11, color: "#444", fontWeight: 700 }}>No Binary</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            </main>

            <footer style={{ textAlign: "center", padding: "60px 0", color: "#333", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>
                PandaStore Protocol &copy; 2026
            </footer>
        </div>
    );
}