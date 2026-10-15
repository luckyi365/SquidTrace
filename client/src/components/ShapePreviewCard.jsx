import React, { useEffect, useRef } from "react";
import { SHAPES } from "../types/shapes";
import { Eye, EyeOff } from "lucide-react";

export default function ShapePreviewCard({
  shapeLevel = 4,
  showGhost = false,
  onToggleGhost = null,
  isMini = false
}) {
  const canvasRef = useRef(null);
  const shape = SHAPES[shapeLevel] || SHAPES[4];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark arena background
    ctx.fillStyle = "#120E09";
    ctx.fillRect(0, 0, width, height);

    // Subtle golden radial glow behind the shape
    const radial = ctx.createRadialGradient(
      width / 2, height / 2, 5,
      width / 2, height / 2, width / 2
    );
    radial.addColorStop(0, "rgba(255, 200, 87, 0.18)");
    radial.addColorStop(1, "rgba(18, 14, 9, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Draw Shape with rich glowing gold wireframe
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = "#FFC857";
    const size = isMini ? 40 : 54;
    shape.draw(ctx, width / 2, height / 2, size, "#FFC857", 2.8);
    ctx.restore();
  }, [shapeLevel, isMini, shape]);

  return (
    <div className="relative metallic-gold-box rounded-xl p-3.5 flex flex-col justify-between h-full w-full max-w-[240px] shadow-2xl">
      {/* Corner Lights / Flares */}
      <span className="gold-corner-flare -top-1.5 -left-1.5" />
      <span className="gold-corner-flare -top-1.5 -right-1.5" />
      <span className="gold-corner-flare -bottom-1.5 -left-1.5" />
      <span className="gold-corner-flare -bottom-1.5 -right-1.5" />

      {/* Header: TARGET */}
      <div className="text-center pb-1">
        <h3 className="text-base font-black font-display tracking-widest text-gold gold-glow-text uppercase">
          TARGET
        </h3>
      </div>

      {/* Wireframe Canvas */}
      <div className="relative flex justify-center items-center my-auto py-2">
        <canvas
          ref={canvasRef}
          width={isMini ? 120 : 160}
          height={isMini ? 120 : 160}
          className="rounded-lg filter drop-shadow-[0_0_12px_rgba(255,200,87,0.5)]"
        />
      </div>

      {/* Footer Info: Lvl X: Shape Name */}
      <div className="text-center pt-1 border-t border-gold/20">
        <div className="text-xs sm:text-sm font-bold font-sans tracking-wide text-gold-light">
          Lvl {shape.level}: {shape.name}
        </div>
        <div className="text-[11px] font-mono text-gold-dark mt-0.5">
          Survival Req: <span className="font-bold text-gold">{shape.threshold}%</span>
        </div>

        {/* Optional Ghost overlay toggle */}
        {onToggleGhost && (
          <button
            onClick={onToggleGhost}
            className={`w-full mt-2 py-1 px-2 rounded flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold transition-all ${
              showGhost
                ? "bg-gold/20 text-gold border border-gold/40"
                : "bg-white/5 text-zinc-400 hover:text-gold border border-white/10"
            }`}
            title="Toggle reference ghost shape on camera"
          >
            {showGhost ? <Eye className="w-3 h-3 text-gold" /> : <EyeOff className="w-3 h-3" />}
            <span>{showGhost ? "Ghost Guide: ON" : "Ghost Guide: OFF"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
