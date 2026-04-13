import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { submitApp } from "../api";
import api from "../api";

export default function Submit() {
    const [form, setForm] = useState({
        name: "", description: "", price: 0,
        category: "", developer: "", version: "1.0.0"
    });
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!form.name || !form.category || !form.developer) {
            setMsg("Please fill all required fields");
            return;
        }
        setLoading(true);
        try {
            const { data } = await submitApp({
                ...form, price: parseFloat(form.price)
            });
            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                await api.post(`/apps/${data.id}/upload`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => {
                        setProgress(Math.round((e.loaded * 100) / e.total));
                    }
                });
            }
            setSuccess(true);
            setMsg("App submitted successfully! Waiting for admin approval 🎉");
        } catch (err) {
            setMsg(err.response?.data?.detail || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const categories = ["Games", "Utilities", "Music", "Social", "Education", "Finance", "Health", "Other"];

    return (
        <div style={{ minHeight: "100vh", padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(224,64,251,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 500,
            }}>
                <Link to="/">
                    <button style={{ padding: "8px 20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12, marginBottom: 20 }}>← Back</button>
                </Link>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: "#e040fb" }}>Submit Your App</h1>
                    <p style={{ color: "#9090bb", marginTop: 6 }}>Share your creation with the world ✨</p>
                </div>
                {msg && (
                    <div style={{ background: success ? "rgba(0,255,100,0.1)" : "rgba(255,50,50,0.1)", border: `1px solid ${success ? "rgba(0,255,100,0.3)" : "rgba(255,50,50,0.3)"}`, borderRadius: 12, padding: "10px 16px", marginBottom: 16, color: success ? "#00ff88" : "#ff6b6b", fontSize: 14, textAlign: "center" }}>{msg}</div>
                )}
                {!success ? (
                    <>
                        <input placeholder="App name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15 }} />
                        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15, minHeight: 100 }} />
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "#1a1a2e", color: "#fff", fontSize: 15 }}>
                            <option value="">Select category *</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input placeholder="Developer name *" value={form.developer} onChange={e => setForm({ ...form, developer: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15 }} />
                        <input placeholder="Version (e.g. 1.0.0)" value={form.version} onChange={e => setForm({ ...form, version: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15 }} />
                        <input type="number" placeholder="Price (0 for free)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 14, borderRadius: 12, border: "2px solid #4a4a8a", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 15 }} />
                        <div onClick={() => document.getElementById("fileInput").click()} style={{ border: "2px dashed #4a4a8a", borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", marginBottom: 14 }}>
                            {file ? <p style={{ color: "#00ff88" }}>{file.name}</p> : <p style={{ color: "#9090bb" }}>Click to upload app file</p>}
                        </div>
                        <input id="fileInput" type="file" style={{ display: "none" }} onChange={e => setFile(e.target.files[0])} />
                        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 14, fontSize: 16, background: "linear-gradient(135deg, #e040fb, #7c4dff)", color: "#fff", marginTop: 8, borderRadius: 12, border: "none", cursor: "pointer" }}>
                            {loading ? `Submitting... ${progress}%` : "Submit App 🚀"}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                        <p style={{ color: "#ccc", marginBottom: 20 }}>Your app is under review!</p>
                        <button onClick={() => navigate("/")} style={{ padding: "12px 32px", background: "linear-gradient(135deg, #e040fb, #7c4dff)", color: "#fff", borderRadius: 12, border: "none", cursor: "pointer" }}>Go Home 🏠</button>
                    </div>
                )}
            </div>
        </div>
    );
}