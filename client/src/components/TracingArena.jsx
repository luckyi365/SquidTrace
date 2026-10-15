import React, { useEffect, useRef, useState, useCallback } from "react";
import { SHAPES } from "../types/shapes";
import { evaluateDrawing } from "../utils/shapeMatcher";
import { soundManager } from "../utils/audio";
import { useHandTracker } from "../hooks/useHandTracker";
import ShapePreviewCard from "./ShapePreviewCard";
import SquidGuard from "./SquidGuard";
import {
  Camera,
  MousePointer,
  RotateCcw,
  Lock,
  Volume2,
  VolumeX,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

export default function TracingArena({
  socket,
  room,
  player,
  secretShape,
  onGameEnd
}) {
  const canvasRef = useRef(null);
  const pathRef = useRef([]); // [{ x, y }]

  const [accuracy, setAccuracy] = useState(0);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [showGhost, setShowGhost] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(0);

  const shapeLevel = secretShape?.shapeLevel || player?.shapeLevel || 4; // default 4 (Pentagonal Pyramid)
  const targetShape = SHAPES[shapeLevel] || SHAPES[4];

  // Callback whenever a point is tracked by webcam index finger or mouse
  const handlePointTracked = useCallback((point, isDrawing) => {
    if (isLockedIn) return;

    if (isDrawing && point) {
      pathRef.current.push(point);

      // Evaluate accuracy in real-time
      const currentAcc = evaluateDrawing(pathRef.current, shapeLevel);
      setAccuracy(currentAcc);

      // Periodic throttle to emit accuracy updates to server
      if (socket && room?.code && pathRef.current.length % 5 === 0) {
        socket.emit("update-progress", {
          roomCode: room.code,
          accuracy: currentAcc
        });
      }
    }
  }, [isLockedIn, room?.code, shapeLevel, socket]);

  // MediaPipe Hand Tracker hook
  const {
    videoRef,
    isCameraActive,
    cameraError,
    isHandDetected,
    cursorPos,
    inputMode,
    setInputMode,
    pointerHandlers
  } = useHandTracker({
    onPointTracked: handlePointTracked,
    isTracingEnabled: !isLockedIn
  });

  // Render the Canvas overlay (Gold Path + Glow + Fingertip Cursor + Ghost Template)
  useEffect(() => {
    let animationId;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Optional Ghost Overlay in center of camera
      if (showGhost && targetShape) {
        ctx.save();
        ctx.globalAlpha = 0.25;
        targetShape.draw(ctx, w / 2, h / 2, 130, "#FFC857", 3);
        ctx.restore();
      }

      // 2. Draw Air-Tracing Path with Brilliant Gold Luminescence
      const path = pathRef.current;
      if (path.length > 1) {
        // Outer glowing gold bloom
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = "#FFC857";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowBlur = 24;
        ctx.shadowColor = "#FFC857";
        ctx.stroke();

        // Inner bright white/pale-gold core stroke
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#FFF3D1";
        ctx.stroke();
        ctx.restore();
      }

      // 3. Draw Holographic Fingertip Cursor & Targeting Crosshair in Gold
      if (cursorPos && !isLockedIn) {
        ctx.save();
        const { x, y } = cursorPos;

        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = "#FFC857";
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 14;
        ctx.shadowColor = "#FFC857";
        ctx.stroke();

        // Inner core
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#FFFFFF";
        ctx.fill();

        // Crosshair ticks
        const tickLen = 8;
        ctx.strokeStyle = "rgba(255, 200, 87, 0.85)";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(x - 22, y);
        ctx.lineTo(x - 22 + tickLen, y);
        ctx.moveTo(x + 22, y);
        ctx.lineTo(x + 22 - tickLen, y);
        ctx.moveTo(x, y - 22);
        ctx.lineTo(x, y - 22 + tickLen);
        ctx.moveTo(x, y + 22);
        ctx.lineTo(x, y + 22 - tickLen);
        ctx.stroke();

        // Cursor label
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#FFC857";
        ctx.fillText("INDEX TRACKED", x + 24, y - 8);
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [cursorPos, isLockedIn, showGhost, targetShape]);

  // Synchronized Timer
  const remainingSec = room?.timer?.remaining !== undefined ? room.timer.remaining : 38;

  useEffect(() => {
    if (remainingSec <= 15 && remainingSec > 0 && remainingSec % 5 === 0) {
      if (remainingSec !== lastAlertTime) {
        soundManager.playAlert();
        setLastAlertTime(remainingSec);
      }
    }
  }, [remainingSec, lastAlertTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Lock In Action
  const handleLockIn = useCallback(() => {
    if (isLockedIn || !socket || !room?.code) return;
    setIsLockedIn(true);
    soundManager.playLockIn();
    socket.emit("lock-in", {
      roomCode: room.code,
      finalAccuracy: accuracy
    });
  }, [accuracy, isLockedIn, room?.code, socket]);

  // Clear Path Action
  const handleClear = () => {
    if (isLockedIn) return;
    pathRef.current = [];
    setAccuracy(0);
    soundManager.playTick(400);
    if (socket && room?.code) {
      socket.emit("update-progress", {
        roomCode: room.code,
        accuracy: 0
      });
    }
  };

  // Keyboard shortcut 'q' to lock in or quit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "q" || e.key === "Q") {
        handleLockIn();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleLockIn]);

  const playerDisplayName = player?.name
    ? `${player.name.toUpperCase()}`
    : "PLAYER 01";
  const playerNumberTag = player?.playerNumber
    ? `PLAYER ${player.playerNumber}`
    : "PLAYER 01";

  return (
    <div className="relative w-screen h-screen bg-[#100D08] flex flex-col justify-between p-3 sm:p-5 overflow-hidden select-none font-sans">
      {/* Outer Golden Metallic Shell Border */}
      <div className="absolute inset-2 sm:inset-3 border-2 border-gold/70 rounded-2xl pointer-events-none shadow-[0_0_25px_rgba(255,200,87,0.25)] z-40">
        <span className="gold-corner-flare -top-2 -left-2" />
        <span className="gold-corner-flare -top-2 -right-2" />
        <span className="gold-corner-flare -bottom-2 -left-2" />
        <span className="gold-corner-flare -bottom-2 -right-2" />
      </div>

      {/* 1. TOP HEADER BAR */}
      <header className="relative z-30 flex items-center justify-between px-4 py-2 border-b border-gold/30">
        {/* Left: Squid Game Icons (Triangle, Circle, Square) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gold gold-glow-text">
            {/* Triangle */}
            <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 stroke-current fill-none stroke-[2.5]">
              <polygon points="16,4 29,27 3,27" />
            </svg>
            {/* Circle */}
            <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 stroke-current fill-none stroke-[2.5]">
              <circle cx="16" cy="16" r="12" />
            </svg>
            {/* Square */}
            <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 stroke-current fill-none stroke-[2.5]">
              <rect x="5" y="5" width="22" height="22" />
            </svg>
          </div>
        </div>

        {/* Center: Title & Subtitle */}
        <div className="text-center">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-[0.2em] uppercase font-display gold-metallic-text leading-tight">
            SQUID TRACE
          </h1>
          <p className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.3em] uppercase text-gold-light opacity-90">
            GESTURE SURVIVAL
          </p>
        </div>

        {/* Right: Player Tag (e.g. PLAYER 01) */}
        <div className="text-right">
          <span className="text-sm sm:text-base md:text-lg font-mono font-black tracking-wider text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]">
            {playerNumberTag}
          </span>
        </div>
      </header>

      {/* 2. MAIN ARENA BODY (3-Column Layout) */}
      <div className="relative z-20 flex-1 grid grid-cols-12 gap-3 sm:gap-4 my-2 sm:my-3 min-h-0">
        {/* LEFT COLUMN: ACCURACY + TIME + SQUID GUARD */}
        <div className="col-span-3 sm:col-span-3 md:col-span-3 lg:col-span-3 flex flex-col justify-between gap-3 h-full">
          {/* Top Box: ACCURACY */}
          <div className="metallic-gold-box rounded-xl p-3 sm:p-4 shadow-xl">
            <span className="gold-corner-flare -top-1 -left-1" />
            <span className="gold-corner-flare -top-1 -right-1" />
            <span className="gold-corner-flare -bottom-1 -left-1" />
            <span className="gold-corner-flare -bottom-1 -right-1" />

            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-gold uppercase mb-1">
              ACCURACY
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black font-sans text-gold-light gold-glow-subtle tracking-tight mb-2">
              {accuracy}%
            </div>

            {/* Custom Gold Progress Bar */}
            <div className="w-full h-3 sm:h-4 rounded-full bg-[#0a0805] border border-gold/40 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-dark via-gold to-gold-light shadow-[0_0_10px_rgba(255,200,87,0.7)] transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, accuracy))}%` }}
              />
            </div>
          </div>

          {/* Middle Box: TIME */}
          <div className="metallic-gold-box rounded-xl p-3 sm:p-4 shadow-xl">
            <span className="gold-corner-flare -top-1 -left-1" />
            <span className="gold-corner-flare -top-1 -right-1" />
            <span className="gold-corner-flare -bottom-1 -left-1" />
            <span className="gold-corner-flare -bottom-1 -right-1" />

            <div className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-gold uppercase mb-1">
              TIME
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-black font-mono tracking-wider text-gold gold-glow-text">
              {formatTime(remainingSec)}
            </div>
          </div>

          {/* Bottom Left: Squid Guard Avatar */}
          <div className="relative flex justify-center items-end flex-1 max-h-36 sm:max-h-48 overflow-hidden rounded-xl border border-gold/20 bg-[#0d0905]/70 p-1">
            <SquidGuard maskSymbol="triangle" className="w-28 sm:w-36 h-28 sm:h-36 object-contain" />
          </div>
        </div>

        {/* CENTER COLUMN: MAIN WEBCAM STAGE WITH CANVAS OVERLAY */}
        <div className="col-span-6 sm:col-span-6 md:col-span-6 lg:col-span-6 relative metallic-gold-box rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-black">
          <span className="gold-corner-flare -top-1.5 -left-1.5" />
          <span className="gold-corner-flare -top-1.5 -right-1.5" />
          <span className="gold-corner-flare -bottom-1.5 -left-1.5" />
          <span className="gold-corner-flare -bottom-1.5 -right-1.5" />

          {/* Video Feed Mirrored */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
              inputMode === "mouse" ? "opacity-35 blur-sm" : "opacity-90"
            }`}
          />

          {/* Golden Scanline overlay */}
          <div className="scanlines-gold absolute inset-0 z-10 pointer-events-none" />

          {/* Neon Golden Air-Tracing Canvas */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            {...pointerHandlers}
            className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
          />

          {/* Camera Error / Fallback Notice */}
          {cameraError && inputMode === "mouse" && (
            <div className="absolute top-4 left-4 right-4 z-30 p-2.5 rounded-lg bg-black/80 border border-gold/40 text-gold-light text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gold shrink-0" />
                <span>{cameraError}</span>
              </div>
              <button
                onClick={() => setInputMode("camera")}
                className="px-2 py-0.5 rounded bg-gold text-black font-bold text-[10px]"
              >
                Retry Cam
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: TARGET SHAPE CARD */}
        <div className="col-span-3 sm:col-span-3 md:col-span-3 lg:col-span-3 flex flex-col justify-between h-full">
          <ShapePreviewCard
            shapeLevel={shapeLevel}
            showGhost={showGhost}
            onToggleGhost={() => setShowGhost(!showGhost)}
          />
        </div>
      </div>

      {/* 3. BOTTOM CONTROL BAR */}
      <footer className="relative z-30 metallic-gold-box rounded-xl px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xl border border-gold/60">
        <span className="gold-corner-flare -top-1 -left-1" />
        <span className="gold-corner-flare -top-1 -right-1" />
        <span className="gold-corner-flare -bottom-1 -left-1" />
        <span className="gold-corner-flare -bottom-1 -right-1" />

        {/* Left: Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Clear Trace */}
          <button
            onClick={handleClear}
            disabled={isLockedIn || pathRef.current.length === 0}
            className="px-3 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 disabled:opacity-30 text-gold-light font-mono text-xs font-bold border border-gold/30 flex items-center gap-1.5 transition-all"
            title="Clear the current trace"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gold" />
            <span className="hidden sm:inline">CLEAR</span>
          </button>

          {/* Input Switcher (Camera vs Mouse) */}
          <button
            onClick={() => {
              const nextMode = inputMode === "camera" ? "mouse" : "camera";
              setInputMode(nextMode);
              soundManager.playTick(600);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 transition-all ${
              inputMode === "camera"
                ? "bg-gold/15 text-gold border-gold/50 shadow-[0_0_8px_rgba(255,200,87,0.3)]"
                : "bg-sky-500/15 text-sky-300 border-sky-500/30"
            }`}
            title="Switch between Camera Hand Tracking and Mouse/Touch"
          >
            {inputMode === "camera" ? (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CAM TRACKING</span>
              </>
            ) : (
              <>
                <MousePointer className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MOUSE / TOUCH</span>
              </>
            )}
          </button>

          {/* Lock In Button */}
          <button
            onClick={handleLockIn}
            disabled={isLockedIn || pathRef.current.length < 10}
            className={`px-4 sm:px-6 py-1.5 rounded-lg font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all ${
              isLockedIn
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black hover:scale-105 shadow-gold/30"
            } disabled:opacity-40 disabled:hover:scale-100`}
          >
            <Lock className="w-4 h-4" />
            <span>{isLockedIn ? "LOCKED IN" : "LOCK IN SHAPE"}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const muted = soundManager.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 text-gold-light border border-gold/30 transition-colors"
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-gold" />}
          </button>
        </div>

        {/* Center Status: TRACE THE SHAPE */}
        <div className="text-center font-display font-black text-sm sm:text-base tracking-[0.25em] text-gold gold-glow-text uppercase animate-pulse">
          {isLockedIn ? "SUBMISSION COMMITTED" : "TRACE THE SHAPE"}
        </div>

        {/* Right Info: Press 'Q' to Quit / Lock In */}
        <div className="text-right text-xs font-mono text-gold-light/80 hidden sm:block">
          Press <span className="text-gold font-bold font-mono">'Q'</span> to Lock In
        </div>
      </footer>
    </div>
  );
}
