import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000" });
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

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
            const { data } = await api.post("/apps/submit", {
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
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 20px #e040fb; }
          50% { box-shadow: 0 0 40px #e040fb, 0 0 60px #7c4dff; }
        }
        .submit-card { animation: fadeIn 0.6s ease forwards; }
        .submit-btn { animation: pulse 2s infinite; }
        .submit-btn:hover { transform: scale(1.05); }
        .icon-float { animation: float 3s ease-in-out infinite; display: inline-block; }
        select {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #4a4a8a;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          cursor: pointer;
        }
        select:focus { border-color: #e040fb; }
        select option { background: #1a1a2e; color: #fff; }
        textarea {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 14px;
          border-radius: 12px;
          border: 2px solid #4a4a8a;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-size: 15px;
          font-family: 'Nunito', sans-serif;
          outline: none;
          resize: vertical;
          min-height: 100px;
        }
        textarea:focus { border-color: #e040fb; }
        textarea::placeholder { color: #9090bb; }
        .file-drop {
          border: 2px dashed #4a4a8a;
          border-radius: 12px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          margin-bottom: 14px;
          transition: border-color 0.3s;
        }
        .file-drop:hover { border-color: #e040fb; }
      `}</style>

            <div className="submit-card" style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(224,64,251,0.3)",
                borderRadius: 24,
                padding: 40,
                width: "100%",
                maxWidth: 500,
            }}>
                <Link to="/" style={{ display: "inline-block", marginBottom: 20 }}>
                    <button style={{
                        padding: "8px 20px",
                        background: "rgba(255,255,255,0.1)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 12,
                    }}>← Back</button>
                </Link>

                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <span className="icon-float" style={{ fontSize: 52 }}>🚀</span>
                    <h1 style={{
                        fontSize: 28,
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        marginTop: 8,
                    }}>Submit Your App</h1>
                    <p style={{ color: "#9090bb", marginTop: 6 }}>Share your creation with the world ✨</p>
                </div>

                {msg && (
                    <div style={{
                        background: success ? "rgba(0,255,100,0.1)" : "rgba(255,50,50,0.1)",
                        border: `1px solid ${success ? "rgba(0,255,100,0.3)" : "rgba(255,50,50,0.3)"}`,
                        borderRadius: 12,
                        padding: "10px 16px",
                        marginBottom: 16,
                        color: success ? "#00ff88" : "#ff6b6b",
                        fontSize: 14,
                        textAlign: "center",
                    }}>{msg}</div>
                )}

                {!success ? (
                    <>
                        <input
                            placeholder="App name *"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                        />
                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                        >
                            <option value="">Select category *</option>
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input
                            placeholder="Developer name *"
                            value={form.developer}
                            onChange={e => setForm({ ...form, developer: e.target.value })}
                        />
                        <input
                            placeholder="Version (e.g. 1.0.0)"
                            value={form.version}
                            onChange={e => setForm({ ...form, version: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Price (0 for free)"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                        />

                        <div className="file-drop" onClick={() => document.getElementById("fileInput").click()}>
                            {file ? (
                                <div>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
                                    <p style={{ color: "#00ff88", fontWeight: 700 }}>{file.name}</p>
                                    <p style={{ color: "#9090bb", fontSize: 12, marginTop: 4 }}>
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                                    <p style={{ color: "#9090bb" }}>Click to upload app file</p>
                                    <p style={{ color: "#6060aa", fontSize: 12, marginTop: 4 }}>
                                        APK, ZIP, EXE or any file
                                    </p>
                                </div>
                            )}
                        </div>
                        <input
                            id="fileInput"
                            type="file"
                            style={{ display: "none" }}
                            onChange={e => setFile(e.target.files[0])}
                        />

                        {loading && progress > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#9090bb" }}>
                                    <span>Uploading...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, height: 8 }}>
                                    <div style={{
                                        width: `${progress}%`,
                                        height: "100%",
                                        background: "linear-gradient(135deg, #e040fb, #00e5ff)",
                                        borderRadius: 8,
                                        transition: "width 0.3s",
                                    }} />
                                </div>
                            </div>
                        )}

                        <button
                            className="submit-btn"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: 14,
                                fontSize: 16,
                                background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                                color: "#fff",
                                marginTop: 8,
                                borderRadius: 12,
                            }}
                        >
                            {loading ? `Submitting... ${progress}%` : "Submit App 🚀"}
                        </button>
                    </>
                ) : (
                    <div style={{ textAlign: "center", padding: 20 }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                        <p style={{ color: "#ccc", marginBottom: 20 }}>Your app is under review. Admin will approve it soon!</p>
                        <button
                            onClick={() => navigate("/")}
                            style={{
                                padding: "12px 32px",
                                background: "linear-gradient(135deg, #e040fb, #7c4dff)",
                                color: "#fff",
                                borderRadius: 12,
                            }}
                        >Go Home 🏠</button>
                    </div>
                )}
            </div>
        </div>
    );
}