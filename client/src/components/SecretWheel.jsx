import React, { useEffect, useState, useRef } from "react";
import { SHAPES } from "../types/shapes";
import { soundManager } from "../utils/audio";
import { ShieldAlert, ArrowRight, EyeOff, Sparkles } from "lucide-react";

export default function SecretWheel({
  secretShape,
  onReadyToTrace
}) {
  const canvasRef = useRef(null);
  const [spinPhase, setSpinPhase] = useState("spinning"); // 'spinning' | 'revealed'
  const [currentDisplayLevel, setCurrentDisplayLevel] = useState(1);
  const [countdown, setCountdown] = useState(5);

  const targetLevel = secretShape?.shapeLevel || 1;

  useEffect(() => {
    let angle = 0;
    let speed = 0.45;
    let friction = 0.988;
    let animationFrameId;
    let tickCounter = 0;

    const numSectors = 9;
    const sectorAngle = (Math.PI * 2) / numSectors;

    const renderWheel = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 25;

      ctx.clearRect(0, 0, w, h);

      // Outer metallic golden rim
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 15, 0, Math.PI * 2);
      ctx.strokeStyle = "#FFC857";
      ctx.lineWidth = 6;
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#FFC857";
      ctx.stroke();
      ctx.restore();

      // Outer bezel studs in alternate Gold / Pale-Gold
      for (let i = 0; i < 36; i++) {
        const a = (i * Math.PI * 2) / 36;
        const bx = cx + (radius + 15) * Math.cos(a);
        const by = cy + (radius + 15) * Math.sin(a);
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? "#FFC857" : "#F7E7B0";
        ctx.fill();
      }

      // Draw 9 Sectors
      for (let i = 0; i < numSectors; i++) {
        const startA = angle + i * sectorAngle;
        const endA = startA + sectorAngle;
        const levelNum = i + 1;
        const shapeDef = SHAPES[levelNum];

        // Sector Slice
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startA, endA);
        ctx.closePath();

        // Alternating dark bronze/gold tones
        ctx.fillStyle = i % 2 === 0 ? "#120E09" : "#1A140D";
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 200, 87, 0.4)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Sector content (Mini wireframe & Level number)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startA + sectorAngle / 2);
        ctx.textAlign = "right";

        if (shapeDef) {
          shapeDef.draw(ctx, radius * 0.72, 0, 14, "#FFC857", 1.8);
        }

        ctx.font = "bold 13px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#F7E7B0";
        ctx.fillText(`L${levelNum}`, radius * 0.92, 4);

        ctx.restore();
      }

      // Center Hub
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fillStyle = "#100D08";
      ctx.fill();
      ctx.strokeStyle = "#FFC857";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#FFC857";
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("△◯□", cx, cy);
      ctx.restore();

      // Top Needle Indicator in Gold
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - radius - 20);
      ctx.lineTo(cx + 16, cy - radius - 20);
      ctx.lineTo(cx, cy - radius + 10);
      ctx.closePath();
      ctx.fillStyle = "#FFC857";
      ctx.shadowBlur = 18;
      ctx.shadowColor = "#FFC857";
      ctx.fill();
      ctx.restore();

      // Physics update
      if (speed > 0.002) {
        angle += speed;
        speed *= friction;
        tickCounter += speed;

        if (tickCounter > 0.35) {
          tickCounter = 0;
          soundManager.playTick(500 + Math.random() * 200, 0.03);
          const currentSlice = Math.floor(((Math.PI * 2 - (angle % (Math.PI * 2))) / sectorAngle) % 9) + 1;
          setCurrentDisplayLevel(currentSlice);
        }

        animationFrameId = requestAnimationFrame(renderWheel);
      } else {
        setCurrentDisplayLevel(targetLevel);
        setSpinPhase("revealed");
        soundManager.playLockIn();
      }
    };

    animationFrameId = requestAnimationFrame(renderWheel);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [targetLevel]);

  // Auto-countdown after reveal
  useEffect(() => {
    if (spinPhase !== "revealed") return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onReadyToTrace();
          return 0;
        }
        soundManager.playTick(800, 0.05);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [spinPhase, onReadyToTrace]);

  const assignedShape = SHAPES[targetLevel] || SHAPES[1];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#100D08] overflow-hidden select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-gold/15 via-transparent to-black pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold font-mono text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold/20 mb-2">
          <EyeOff className="w-3.5 h-3.5" />
          <span>CONFIDENTIAL TARGET ALLOCATION</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-display uppercase tracking-wider gold-metallic-text">
          THE WHEEL OF FATE
        </h2>
        <p className="text-xs md:text-sm text-gold-light/70 mt-1 max-w-sm mx-auto">
          Each contender receives a unique secret target. Keep your screen protected from opponents.
        </p>
      </div>

      {/* Wheel Canvas & Reveal Presentation */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative p-2 rounded-full metallic-gold-box shadow-2xl border-2 border-gold/70">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full drop-shadow-[0_0_25px_rgba(255,200,87,0.4)]"
          />
        </div>

        {/* Revealed Shape Card Modal */}
        {spinPhase === "revealed" && (
          <div className="mt-6 w-full max-w-md metallic-gold-box rounded-2xl p-6 shadow-2xl animate-stamp text-center">
            <span className="gold-corner-flare -top-1.5 -left-1.5" />
            <span className="gold-corner-flare -top-1.5 -right-1.5" />
            <span className="gold-corner-flare -bottom-1.5 -left-1.5" />
            <span className="gold-corner-flare -bottom-1.5 -right-1.5" />

            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 animate-spin-slow text-gold" />
              <span>YOUR ASSIGNED SURVIVAL TARGET</span>
            </div>

            <h3 className="text-3xl font-black text-white font-display uppercase tracking-wide my-1">
              LEVEL {assignedShape.level}:{" "}
              <span className="text-gold gold-glow-text">
                {assignedShape.name}
              </span>
            </h3>

            <p className="text-xs text-gold-light/70 font-mono mb-4">
              {assignedShape.description}
            </p>

            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#0D0A06] border border-gold/30 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-light/60 block">
                  Survival Requirement
                </span>
                <span className="text-xl font-black font-mono text-gold">
                  ≥ {assignedShape.threshold}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-gold-light/60 block">
                  Arena Countdown
                </span>
                <span className="text-xl font-black font-mono text-gold-light animate-pulse">
                  {countdown}s
                </span>
              </div>
            </div>

            <button
              onClick={onReadyToTrace}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-black font-display text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-gold/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>ENTER THE ARENA NOW</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
