import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Intro() {
    const [phase, setPhase] = useState(0); // 0: Singularity, 1: Big Bang, 2: Transmission, 3: Warp Launch
    const navigate = useNavigate();

    useEffect(() => {
        const timers = [];
        timers.push(setTimeout(() => setPhase(1), 2000)); // Singularity for 2s
        timers.push(setTimeout(() => setPhase(2), 3000)); // Big Bang duration
        timers.push(setTimeout(() => setPhase(3), 6000)); // Transmission duration
        timers.push(setTimeout(() => {
            navigate(localStorage.getItem("token") ? "/home" : "/login");
        }, 7500)); // Warp launch finale

        return () => timers.forEach(clearTimeout);
    }, [navigate]);

    return (
        <div style={{
            minHeight: "100vh",
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            zIndex: 9999
        }}>
            <style>{`
                .singularity {
                    width: 4px;
                    height: 4px;
                    background: #fff;
                    border-radius: 50%;
                    animation: singularityPulse 2s infinite ease-in-out;
                }
                .big-bang-ring {
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: #fff;
                    border-radius: 50%;
                    animation: bigBang 1.5s ease-out forwards;
                }
                .glitch-logo {
                    font-size: 80px;
                    font-weight: 950;
                    letter-spacing: 12px;
                    color: #fff;
                    text-transform: uppercase;
                    animation: glitch 0.5s infinite;
                    text-shadow: 3px 0 var(--panda-red), -3px 0 var(--panda-blue);
                }
                .warp-container {
                    animation: warpLaunch 1.5s ease-in forwards;
                }
            `}</style>

            {/* Act 1: The Singularity */}
            {phase === 0 && <div className="singularity" />}

            {/* Act 2: The Big Bang */}
            {phase === 1 && (
                <>
                    {[...Array(50)].map((_, i) => (
                        <div key={i} className="big-bang-ring" style={{
                            transform: `rotate(${i * 7.2}deg)`,
                            animationDelay: `${Math.random() * 0.2}s`
                        }} />
                    ))}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        background: "#fff",
                        animation: "fadeInOut 1s ease-out forwards"
                    }} />
                    <style>{`
                        @keyframes fadeInOut {
                            0% { opacity: 0; }
                            50% { opacity: 1; }
                            100% { opacity: 0; }
                        }
                    `}</style>
                </>
            )}

            {/* Act 3: Transmission */}
            {phase === 2 && (
                <div style={{ textAlign: "center", animation: "revealPage 1s ease-out forwards" }}>
                    <div className="glitch-logo">PANDASTORE</div>
                    <div style={{
                        marginTop: 20,
                        fontSize: 14,
                        letterSpacing: 8,
                        color: "var(--panda-blue)",
                        textTransform: "uppercase",
                        opacity: 0,
                        animation: "driftUp 1s ease-out 0.5s forwards"
                    }}>Initialising Galactic Interface</div>
                </div>
            )}

            {/* Act 4: Warp Launch */}
            {phase === 3 && (
                <div className="warp-container" style={{ textAlign: "center" }}>
                    <div className="glitch-logo" style={{ animation: "none", opacity: 0.5 }}>PANDASTORE</div>
                    <div style={{ fontSize: 24, marginTop: 40 }}>🚀</div>
                </div>
            )}
        </div>
    );
}