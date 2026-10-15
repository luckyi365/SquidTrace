import React, { useState } from "react";
import { soundManager } from "../utils/audio";
import {
  Users,
  Play,
  Copy,
  Check,
  Crown,
  Sparkles,
  Settings,
  ArrowRight,
  Radio,
  UserPlus
} from "lucide-react";

export default function Lobby({
  socket,
  room,
  player,
  onOpenServerModal,
  isConnected
}) {
  const [tab, setTab] = useState("create"); // 'create' | 'join'
  const [playerName, setPlayerName] = useState(
    localStorage.getItem("squid_player_name") || ""
  );
  const [roomCodeInput, setRoomCodeInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Create Room
  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!socket || !isConnected) {
      setErrorMsg("WebSocket is connecting... Please wait a moment.");
      return;
    }
    const cleanName = playerName.trim() || "Player 01";
    localStorage.setItem("squid_player_name", cleanName);
    setErrorMsg("");
    setIsSubmitting(true);
    soundManager.playTick(600);

    socket.emit("create-room", { playerName: cleanName }, (res) => {
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message || "Failed to create room.");
      }
    });
  };

  // Handle Join Room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!socket || !isConnected) {
      setErrorMsg("WebSocket is connecting... Please wait a moment.");
      return;
    }
    const cleanName = playerName.trim() || "Contender";
    const cleanCode = roomCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg("Please enter a 6-character room code.");
      return;
    }

    localStorage.setItem("squid_player_name", cleanName);
    setErrorMsg("");
    setIsSubmitting(true);
    soundManager.playTick(600);

    socket.emit("join-room", { roomCode: cleanCode, playerName: cleanName }, (res) => {
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.message || "Room not found or game already in progress.");
      }
    });
  };

  // Host starts game
  const handleStartGame = () => {
    if (!socket || !room || !player?.isHost) return;
    soundManager.playLockIn();
    socket.emit("start-game", { roomCode: room.code });
  };

  // Copy Room Code
  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    soundManager.playTick(800);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#100D08] overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-gold/10 via-transparent to-black pointer-events-none" />

      {/* Background glowing Squid Game shapes watermark in Gold */}
      <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-around select-none">
        <span className="text-[25vw] font-black text-gold">△</span>
        <span className="text-[25vw] font-black text-gold">◯</span>
        <span className="text-[25vw] font-black text-gold">□</span>
      </div>

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between py-3 mb-6 border-b border-gold/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gold gold-glow-text">
            <svg viewBox="0 0 32 32" className="w-5 h-5 stroke-current fill-none stroke-[2.5]">
              <polygon points="16,4 29,27 3,27" />
            </svg>
            <svg viewBox="0 0 32 32" className="w-5 h-5 stroke-current fill-none stroke-[2.5]">
              <circle cx="16" cy="16" r="12" />
            </svg>
            <svg viewBox="0 0 32 32" className="w-5 h-5 stroke-current fill-none stroke-[2.5]">
              <rect x="5" y="5" width="22" height="22" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 shadow-lg shadow-gold/10">
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-gold uppercase">
              ARENA PROTOCOL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection status badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
              isConnected
                ? "bg-gold/15 text-gold border-gold/40"
                : "bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>{isConnected ? "ONLINE" : "CONNECTING"}</span>
          </div>

          {/* Server Config Modal Trigger */}
          <button
            onClick={onOpenServerModal}
            className="p-2 rounded-xl bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold-light hover:text-white transition-colors"
            title="Configure WebSocket Server URL"
          >
            <Settings className="w-4 h-4 text-gold" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-xl">
        {/* Title & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] uppercase font-display gold-metallic-text mb-1 drop-shadow-md">
            SQUID TRACE
          </h1>
          <p className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] uppercase text-gold-light opacity-90">
            GESTURE SURVIVAL
          </p>
          <p className="text-xs text-gold-light/60 max-w-md mx-auto mt-2">
            Black & Gold Survival Arena • Index finger computer vision air-tracing
          </p>
        </div>

        {/* View 1: Room Active (Inside Room Lobby) */}
        {room ? (
          <div className="metallic-gold-box rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
            <span className="gold-corner-flare -top-2 -left-2" />
            <span className="gold-corner-flare -top-2 -right-2" />
            <span className="gold-corner-flare -bottom-2 -left-2" />
            <span className="gold-corner-flare -bottom-2 -right-2" />

            {/* Room Code Card */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D0A06] border border-gold/40">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-gold-light/60">
                  ROOM PASSCODE
                </span>
                <div className="text-3xl font-black font-mono tracking-widest text-gold gold-glow-text">
                  {room.code}
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold-light font-mono text-xs font-bold flex items-center justify-center gap-2 border border-gold/40 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-gold" />
                    <span>COPIED CODE</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-gold" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            {/* Connected Contenders Roster */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-gold uppercase tracking-wider">
                  <Users className="w-4 h-4 text-gold" />
                  <span>CONNECTED CONTENDERS ({room.players?.length || 1})</span>
                </div>
                <span className="text-[11px] font-mono text-gold-dark">
                  ARENA LOBBY READY
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {room.players?.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      p.id === socket.id
                        ? "bg-gold/15 border-gold shadow-md shadow-gold/10"
                        : "bg-[#0A0805] border-gold/20"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#18130B] border border-gold/40 flex items-center justify-center font-mono font-black text-sm text-gold">
                        #{p.playerNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white font-display">
                          <span>{p.name}</span>
                          {p.isHost && (
                            <Crown className="w-3.5 h-3.5 text-gold fill-gold" />
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-gold-light/60">
                          {p.id === socket.id ? "You (Contender)" : "Opponent"}
                        </span>
                      </div>
                    </div>

                    <div className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Host Controls */}
            {player?.isHost ? (
              <div className="pt-2">
                <button
                  onClick={handleStartGame}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-black text-lg tracking-wider font-display uppercase flex items-center justify-center gap-3 shadow-xl shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START SURVIVAL ROUND</span>
                </button>
                <p className="text-center text-[11px] font-mono text-gold-light/60 mt-2">
                  Initiates server-synchronized secret wheel spin and secretly allocates shapes.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#0A0805] border border-gold/20 text-center">
                <div className="inline-flex items-center gap-2 text-gold font-mono text-sm font-bold">
                  <Sparkles className="w-4 h-4 animate-spin-slow text-gold" />
                  <span>WAITING FOR HOST TO START</span>
                </div>
                <p className="text-xs text-gold-light/60 mt-1">
                  Keep your webcam ready! The secret wheel will spin as soon as the host launches the round.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* View 2: Create / Join Room Form */
          <div className="metallic-gold-box rounded-3xl p-6 md:p-8 shadow-2xl">
            <span className="gold-corner-flare -top-2 -left-2" />
            <span className="gold-corner-flare -top-2 -right-2" />
            <span className="gold-corner-flare -bottom-2 -left-2" />
            <span className="gold-corner-flare -bottom-2 -right-2" />

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0A0805] rounded-2xl mb-6 border border-gold/30">
              <button
                type="button"
                onClick={() => {
                  setTab("create");
                  setErrorMsg("");
                  soundManager.playTick(500);
                }}
                className={`py-2.5 text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all ${
                  tab === "create"
                    ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20 font-black"
                    : "text-gold-light/60 hover:text-gold"
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("join");
                  setErrorMsg("");
                  soundManager.playTick(500);
                }}
                className={`py-2.5 text-xs font-mono font-bold tracking-wider uppercase rounded-xl transition-all ${
                  tab === "join"
                    ? "bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black shadow-lg shadow-gold/20 font-black"
                    : "text-gold-light/60 hover:text-gold"
                }`}
              >
                Join Room
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            {/* Create Room Form */}
            {tab === "create" ? (
              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gold mb-2">
                    Contender Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Player 01"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0A0805] border border-gold/40 text-gold-light font-display text-base focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:brightness-110 disabled:opacity-50 text-black font-black text-base font-display uppercase tracking-wider shadow-xl shadow-gold/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5 text-black" />
                  <span>{isSubmitting ? "Generating Room..." : "Create Room"}</span>
                </button>
              </form>
            ) : (
              /* Join Room Form */
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gold mb-2">
                    Room Passcode
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. SQ-7B29"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0A0805] border border-gold/40 text-gold font-mono text-lg font-black tracking-widest uppercase focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gold mb-2">
                    Contender Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Contender 02"
                    className="w-full px-4 py-3 rounded-2xl bg-[#0A0805] border border-gold/40 text-gold-light font-display text-base focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !isConnected}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light hover:brightness-110 disabled:opacity-50 text-black font-black text-base font-display uppercase tracking-wider shadow-xl shadow-gold/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5 text-black" />
                  <span>{isSubmitting ? "Connecting..." : "Join Contest"}</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
