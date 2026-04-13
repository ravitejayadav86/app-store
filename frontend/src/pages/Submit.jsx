import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitApp, uploadAppFile } from "../api";

export default function Submit() {
    const [form, setForm] = useState({
        name: "", description: "", price: 0,
        category: "", version: "1.0.0"
    });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const categories = [
        "Utilities", "Games", "Education", "Music",
        "Productivity", "Social", "Health", "Finance"
    ];

    const handleSubmit = async () => {
        if (!form.name || !form.description || !form.category) {
            setError("Please fill all fields");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const { data } = await submitApp(form);
            
            if (file) {
                setMsg("Metadata synchronized. Transmitting binary...");
                const formData = new FormData();
                formData.append("file", file);
                await uploadAppFile(data.id, formData);
            }

            setMsg("App submitted successfully! 🎉");
            setTimeout(() => navigate("/"), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", paddingBottom: 60, animation: "revealPage 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
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
                .form-card {
                    background: var(--panda-glass);
                    backdrop-filter: blur(40px);
                    border: 1px solid var(--panda-border);
                    border-radius: 32px;
                    padding: 60px;
                    width: 100%;
                    max-width: 640px;
                    margin: 60px auto;
                    box-shadow: var(--shadow-lg);
                    animation: driftUp 1s var(--transition) forwards;
                }
                .form-input {
                    width: 100%;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--panda-border);
                    border-radius: 16px;
                    color: #fff;
                    font-size: 16px;
                    margin-bottom: 20px;
                    outline: none;
                    transition: var(--transition);
                }
                .form-input:focus {
                    border-color: var(--panda-blue);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 0 0 20px rgba(0, 210, 255, 0.1);
                }
                .form-select {
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 16px center;
                }
                .submit-btn-primary {
                    width: 100%;
                    padding: 18px;
                    background: var(--panda-gradient);
                    color: #fff;
                    font-weight: 800;
                    font-size: 16px;
                    border-radius: 16px;
                    border: none;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .submit-btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(229, 9, 20, 0.3);
                }
                .submit-btn-primary:active { transform: scale(0.98); }
                .submit-btn-primary:disabled { opacity: 0.5; cursor: default; }
                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 800;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                    margin-left: 4px;
                }
            `}</style>

            <nav className="glass-nav">
                <Link to="/home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
                    <span className="logo-float" style={{ fontSize: 32 }}>🐼</span>
                    <span style={{ fontSize: 24, fontWeight: 900, background: "var(--panda-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -0.5 }}>PANDASTORE</span>
                </Link>
                <Link to="/home"><button className="back-btn">Cancel Submission</button></Link>
            </nav>

            <div className="form-card">
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
                    <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: -1.5, marginBottom: 8 }}>Initialize Transmission</h1>
                    <p style={{ color: "#666", fontSize: 16 }}>Broadcast your application or musical creation to the storefront.</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(229, 9, 20, 0.1)", border: "1px solid var(--panda-red)", borderRadius: 12, padding: 16, marginBottom: 24, color: "var(--panda-red)", fontWeight: 700, fontSize: 14 }}>
                        {error}
                    </div>
                )}

                {msg && (
                    <div style={{ background: "rgba(0, 210, 255, 0.1)", border: "1px solid var(--panda-blue)", borderRadius: 12, padding: 16, marginBottom: 24, color: "var(--panda-blue)", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
                        {msg}
                    </div>
                )}

                <div>
                    <label className="form-label">Transmission Title</label>
                    <input
                        className="form-input"
                        placeholder="e.g. Nebula 3D or Starlight Symphony"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />

                    <label className="form-label">Manifest Description</label>
                    <textarea
                        className="form-input"
                        style={{ minHeight: 120, resize: "none" }}
                        placeholder="What makes this app or song essential?"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        <div>
                            <label className="form-label">Vertical</label>
                            <select
                                className="form-input form-select"
                                value={form.category}
                                onChange={e => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="" disabled>Select Vertical</option>
                                {categories.map(c => (
                                    <option key={c} value={c} style={{ background: "#000" }}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Version</label>
                            <input
                                className="form-input"
                                placeholder="1.0.0"
                                value={form.version}
                                onChange={e => setForm({ ...form, version: e.target.value })}
                            />
                        </div>
                    </div>

                    <label className="form-label">Acquisition Price (USD)</label>
                    <input
                        className="form-input"
                        type="number"
                        placeholder="0.00"
                        value={form.price}
                        min="0"
                        step="0.01"
                        onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                    />

                    <label className="form-label">Target Binary or Audio (ZIP, EXE, DMG, MP3, WAV)</label>
                    <input
                        className="form-input"
                        type="file"
                        onChange={e => setFile(e.target.files[0])}
                    />

                    <button
                        className="submit-btn-primary"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? "Transmitting..." : "Initialize Submission"}
                    </button>
                </div>
            </div>
        </div>
    );
}