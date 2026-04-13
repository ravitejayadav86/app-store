import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function AdminDashboard() {
    const [pending, setPending] = useState([]);
    const [allApps, setAllApps] = useState([]);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState(null);

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const [pendingRes, allRes] = await Promise.all([
                    api.get("/admin/pending"),
                    api.get("/apps/")
                ]);
                setPending(pendingRes.data);
                setAllApps(allRes.data);
            } catch {
                setMsg("Access denied - admin only");
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.post(`/admin/approve/${id}`);
            setPending(prev => prev.filter(app => app.id !== id));
            setMsg("App approved and live!");
        } catch { setMsg("Approval failed"); }
    };

    const handleApproveAll = async () => {
        try {
            const res = await api.post("/admin/approve-all");
            setPending([]);
            setMsg(res.data.message);
        } catch { setMsg("Bulk approval failed"); }
    };

    const handleReject = async (id) => {
        try {
            await api.delete(`/admin/apps/${id}`);
            setPending(pending.filter(app => app.id !== id));
            setMsg("App rejected");
        } catch { setMsg("Rejection failed"); }
    };

    const handleUpload = async (id, file) => {
        if (!file) return;
        setUploadingId(id);
        const formData = new FormData();
        formData.append("file", file);
        try {
            await api.post(`/apps/${id}/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setMsg("Binary transmission successful!");
            // Refresh app list to show new file_path status if we had one
        } catch {
            setMsg("Upload failed");
        } finally {
            setUploadingId(null);
        }
    };

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
                .admin-stage {
                    max-width: 1000px;
                    margin: 60px auto;
                    padding: 0 24px;
                    animation: driftUp 1s var(--transition) forwards;
                }
                .app-card-admin {
                    background: var(--panda-glass);
                    backdrop-filter: blur(40px);
                    border: 1px solid var(--panda-border);
                    border-radius: 32px;
                    padding: 32px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: var(--shadow-lg);
                    transition: var(--transition);
                }
                .app-card-admin:hover {
                    border-color: var(--panda-blue);
                    transform: translateY(-4px);
                }
                .btn-approve {
                    padding: 12px 28px;
                    background: var(--panda-blue);
                    color: #000;
                    font-weight: 800;
                    font-size: 14px;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .btn-approve:hover {
                    background: #fff;
                    transform: scale(1.05);
                }
                .btn-reject {
                    padding: 12px 28px;
                    background: transparent;
                    border: 1px solid var(--panda-red);
                    color: var(--panda-red);
                    font-weight: 800;
                    font-size: 14px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .btn-reject:hover {
                    background: var(--panda-red);
                    color: #fff;
                }
                .badge-admin {
                    padding: 4px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--panda-border);
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #888;
                }
            `}</style>

            <nav className="glass-nav">
                <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
                    <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                        <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                        <span style={{ fontSize: 24, fontWeight: 900, background: "var(--panda-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>PANDASTORE</span>
                    </Link>
                    <div style={{ display: "flex", gap: 24 }}>
                        <Link to="/home" className="nav-btn-secondary" style={{ border: "none" }}>Storefront</Link>
                        <Link to="/profile" className="nav-btn-secondary" style={{ border: "none" }}>Fleet Control</Link>
                    </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: "var(--panda-red)", textTransform: "uppercase", letterSpacing: 2 }}>Command Center</div>
            </nav>

            <main className="admin-stage">
                <div style={{ marginBottom: 48, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
                    <div>
                        <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, marginBottom: 8 }}>Inbound Manifest</h1>
                        <p style={{ color: "#666", fontSize: 18 }}>
                            Moderation queue — <strong style={{ color: pending.length > 0 ? "var(--panda-red)" : "#666" }}>{pending.length} pending</strong> transmission{pending.length !== 1 ? "s" : ""}.
                        </p>
                    </div>
                    {pending.length > 0 && (
                        <button
                            onClick={handleApproveAll}
                            style={{ padding: "14px 28px", background: "var(--panda-blue)", color: "#000", fontWeight: 900, fontSize: 14, borderRadius: 16, border: "none", cursor: "pointer", transition: "var(--transition)" }}
                        >
                            ✅ Approve All ({pending.length})
                        </button>
                    )}
                </div>

                {msg && (
                    <div style={{ background: "rgba(0, 210, 255, 0.1)", border: "1px solid var(--panda-blue)", borderRadius: 16, padding: "16px 24px", marginBottom: 32, color: "var(--panda-blue)", fontWeight: 700, fontSize: 14 }}>
                        {msg}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: "center", padding: 100, color: "var(--panda-blue)", fontWeight: 800 }}>Scanning for transmissions...</div>
                ) : pending.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 100, background: "rgba(255,255,255,0.02)", borderRadius: 40, border: "2px dashed var(--panda-border)" }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>🔭</div>
                        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#444" }}>All Clear</h2>
                        <p style={{ color: "#333" }}>No pending transmissions detected in this sector.</p>
                    </div>
                ) : (
                    pending.map((app, i) => (
                        <div key={app.id} className="app-card-admin" style={{ animation: `revealItem 0.8s var(--transition) ${i * 0.1}s forwards`, opacity: 0 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                                    <h3 style={{ fontSize: 24, fontWeight: 900, letterSpacing: -0.5 }}>{app.name}</h3>
                                    <span className="badge-admin">{app.category}</span>
                                    <span className="badge-admin" style={{ color: "var(--panda-blue)" }}>v{app.version}</span>
                                </div>
                                <p style={{ color: "#666", fontSize: 15, marginBottom: 20, maxWidth: 600 }}>{app.description || "Manifest missing description details."}</p>
                                <div style={{ display: "flex", gap: 24, fontSize: 12, fontWeight: 800, color: "#444", textTransform: "uppercase", letterSpacing: 1 }}>
                                    <span>Signal Source: <span style={{ color: "#888" }}>{app.developer}</span></span>
                                    <span>Valuation: <span style={{ color: app.price === 0 ? "var(--panda-blue)" : "#888" }}>{app.price === 0 ? "Complimentary" : `$${app.price}`}</span></span>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 16 }}>
                                <button className="btn-reject" onClick={() => handleReject(app.id)}>Neutralize</button>
                                <button className="btn-approve" onClick={() => handleApprove(app.id)}>Authorize</button>
                            </div>
                        </div>
                    ))
                )}

                <div style={{ marginTop: 80, marginBottom: 48 }}>
                    <h2 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1, marginBottom: 8 }}>Active Storefront</h2>
                    <p style={{ color: "#666", fontSize: 16 }}>Manage binaries for currently live applications.</p>
                </div>

                {allApps.map((app, i) => (
                    <div key={app.id} className="app-card-admin" style={{ animation: `revealItem 0.8s var(--transition) ${i * 0.05}s forwards`, opacity: 0 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                                <h3 style={{ fontSize: 20, fontWeight: 900 }}>{app.name}</h3>
                                <div className="badge-admin" style={{ color: app.file_path ? "var(--panda-blue)" : "var(--panda-red)", borderColor: app.file_path ? "var(--panda-blue)" : "var(--panda-red)" }}>
                                    {app.file_path ? "BINARY ATTACHED" : "MISSING BINARY"}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: 24, fontSize: 12, fontWeight: 800, color: "#444", textTransform: "uppercase" }}>
                                <span>Signal: {app.developer}</span>
                                <span>Version: {app.version}</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <label className="nav-btn-secondary" style={{ cursor: "pointer", display: "inline-block" }}>
                                {uploadingId === app.id ? "TRANSMITTING..." : "ATTACH BINARY"}
                                <input 
                                    type="file" 
                                    hidden 
                                    onChange={(e) => handleUpload(app.id, e.target.files[0])}
                                    disabled={uploadingId !== null}
                                />
                            </label>
                            <Link to={`/app/${app.id}`} className="nav-btn-secondary" style={{ border: "none" }}>VIEW</Link>
                        </div>
                    </div>
                ))}
            </main>

            <footer style={{ textAlign: "center", padding: "60px 0", color: "#333", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 3 }}>
                Security Protocol Active &copy; 2026
            </footer>
        </div>
    );
}

