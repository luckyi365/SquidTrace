import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { soundManager } from "../utils/audio";
import {
  Trophy,
  Skull,
  RotateCcw,
  ShieldCheck,
  Award,
  Crown
} from "lucide-react";

export default function Scoreboard({
  results = [],
  player,
  isHost,
  onPlayAgain
}) {
  const currentPlayerResult = results.find((r) => r.id === player?.id);
  const didCurrentPlayerSurvive = currentPlayerResult?.survived;

  useEffect(() => {
    if (didCurrentPlayerSurvive) {
      soundManager.playVictory();
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#FFC857", "#F7E7B0", "#FFFFFF", "#B8860B"]
        });
      } catch (e) {}
    } else {
      soundManager.playElimination();
    }
  }, [didCurrentPlayerSurvive]);

  const totalSurvivors = results.filter((r) => r.survived).length;
  const totalEliminated = results.filter((r) => !r.survived).length;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 md:p-6 bg-[#100D08] overflow-x-hidden select-none">
      {/* Background ambient lighting */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-20 ${
          didCurrentPlayerSurvive
            ? "bg-gradient-to-b from-gold/30 via-transparent to-black"
            : "bg-gradient-to-b from-red-600/30 via-transparent to-black"
        }`}
      />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-3xl">
        {/* Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/40 text-gold font-mono text-xs font-bold uppercase tracking-widest shadow-lg shadow-gold/10 mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>SQUID TRACE • SURVIVAL VERDICT</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-display uppercase tracking-widest gold-metallic-text">
            FINAL SCOREBOARD
          </h1>
        </div>

        {/* Current Player Verdict Banner */}
        {currentPlayerResult && (
          <div
            className={`mb-6 p-6 rounded-3xl metallic-gold-box text-center shadow-2xl relative overflow-hidden ${
              didCurrentPlayerSurvive
                ? "border-gold shadow-gold/25"
                : "border-red-600 shadow-red-600/30"
            }`}
          >
            <span className="gold-corner-flare -top-1.5 -left-1.5" />
            <span className="gold-corner-flare -top-1.5 -right-1.5" />
            <span className="gold-corner-flare -bottom-1.5 -left-1.5" />
            <span className="gold-corner-flare -bottom-1.5 -right-1.5" />

            {/* Stamp watermark */}
            <div
              className={`inline-block px-8 py-3 rounded-2xl border-4 font-black text-2xl md:text-4xl tracking-widest uppercase font-display transform -rotate-3 animate-stamp ${
                didCurrentPlayerSurvive
                  ? "border-gold text-gold shadow-lg shadow-gold/40 bg-gold/10"
                  : "border-red-600 text-red-600 shadow-lg shadow-red-600/40 bg-red-600/10"
              }`}
            >
              {didCurrentPlayerSurvive ? "SURVIVED" : "ELIMINATED"}
            </div>

            <p className="mt-3 text-sm font-mono text-gold-light/80">
              You achieved <span className="font-bold text-white">{currentPlayerResult.finalAccuracy}%</span> on{" "}
              <span className="font-bold text-gold">{currentPlayerResult.shapeName}</span> (Required:{" "}
              {currentPlayerResult.threshold}%)
            </p>
          </div>
        )}

        {/* Stats Summary Pills */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl metallic-gold-box border border-gold/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gold-light/60 uppercase block">
                  Surviving Contenders
                </span>
                <span className="text-xl font-black font-mono text-gold">
                  {totalSurvivors}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl metallic-gold-box border border-red-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                <Skull className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-gold-light/60 uppercase block">
                  Eliminated Contenders
                </span>
                <span className="text-xl font-black font-mono text-red-400">
                  {totalEliminated}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Table */}
        <div className="metallic-gold-box rounded-3xl p-6 shadow-2xl mb-6">
          <span className="gold-corner-flare -top-2 -left-2" />
          <span className="gold-corner-flare -top-2 -right-2" />
          <span className="gold-corner-flare -bottom-2 -left-2" />
          <span className="gold-corner-flare -bottom-2 -right-2" />

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-mono font-bold text-gold uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              <span>GLOBAL ARENA RANKINGS</span>
            </h3>
            <span className="text-[11px] font-mono text-gold-dark">
              SHAPES DECLASSIFIED
            </span>
          </div>

          <div className="space-y-2.5">
            {results.map((r) => {
              const isCurrent = r.id === player?.id;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-gold/15 border-gold shadow-md shadow-gold/10"
                      : "bg-[#0A0805] border-gold/20"
                  }`}
                >
                  {/* Left: Rank & Player Tag */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                        r.rank === 1
                          ? "bg-gold text-black shadow-md shadow-gold/30 font-black"
                          : "bg-[#18130B] text-gold border border-gold/30"
                      }`}
                    >
                      #{r.rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                        <span>
                          #{r.playerNumber} {r.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gold/20 text-gold border border-gold/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gold-light/60">
                        Assigned: <span className="text-gold-light">{r.shapeName}</span> (Lvl {r.shapeLevel})
                      </div>
                    </div>
                  </div>

                  {/* Right: Accuracy vs Threshold & Status */}
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div
                        className={`text-base font-black font-mono ${
                          r.survived ? "text-gold" : "text-red-400"
                        }`}
                      >
                        {r.finalAccuracy}%
                      </div>
                      <span className="text-[10px] font-mono text-gold-light/40 block">
                        Req: {r.threshold}%
                      </span>
                    </div>

                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                        r.survived
                          ? "bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(255,200,87,0.3)]"
                          : "bg-red-500/20 text-red-400 border-red-500/40"
                      }`}
                    >
                      {r.survived ? "SURVIVED" : "ELIMINATED"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button: Play Again */}
        {isHost ? (
          <button
            onClick={onPlayAgain}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-dark via-gold to-gold-light text-black font-black text-base font-display uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-gold/30 hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-5 h-5 text-black" />
            <span>PLAY AGAIN (NEW SECRET SHAPES)</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl metallic-gold-box text-center text-xs font-mono text-gold-light/60">
            Waiting for the Host to initiate the next round...
          </div>
        )}
      </div>
    </div>
  );
}
