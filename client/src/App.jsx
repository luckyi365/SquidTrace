import React, { useState, useEffect, useCallback } from "react";
import { getSocket, getCurrentSocketUrl } from "./services/socket";
import Lobby from "./components/Lobby";
import SecretWheel from "./components/SecretWheel";
import TracingArena from "./components/TracingArena";
import Scoreboard from "./components/Scoreboard";
import ServerModal from "./components/ServerModal";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [player, setPlayer] = useState(null);
  const [secretShape, setSecretShape] = useState(null); // { shapeLevel, shapeName, threshold, description }
  const [gameResults, setGameResults] = useState([]);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // Initialize Socket connection
  const initSocket = useCallback(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);

    // Room update events
    s.on("room-updated", (updatedRoom) => {
      setRoom(updatedRoom);
      // Synchronize self player state
      if (updatedRoom && updatedRoom.players) {
        const me = updatedRoom.players.find((p) => p.id === s.id);
        if (me) setPlayer(me);
      }
    });

    // Game start -> transition to Secret Wheel Spin
    s.on("game-started", ({ state, room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    // Private shape allocation sent specifically to this player socket
    s.on("secret-shape-assigned", (shapeInfo) => {
      console.log("[Secret Target Received]:", shapeInfo);
      setSecretShape(shapeInfo);
    });

    // Tracing phase started
    s.on("tracing-phase-started", ({ room: updatedRoom }) => {
      setRoom(updatedRoom);
    });

    // Periodic timer ticks from server
    s.on("timer-tick", ({ remaining, endTime }) => {
      setRoom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          timer: {
            ...prev.timer,
            remaining,
            endTime
          }
        };
      });
    });

    // Game over -> transition to Scoreboard
    s.on("game-over", ({ results, room: updatedRoom }) => {
      setGameResults(results);
      setRoom(updatedRoom);
    });

    // Room reset for Play Again
    s.on("room-reset", (resetRoom) => {
      setRoom(resetRoom);
      setGameResults([]);
      setSecretShape(null);
    });

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("room-updated");
      s.off("game-started");
      s.off("secret-shape-assigned");
      s.off("tracing-phase-started");
      s.off("timer-tick");
      s.off("game-over");
      s.off("room-reset");
    };
  }, []);

  useEffect(() => {
    const cleanup = initSocket();
    return () => cleanup && cleanup();
  }, [initSocket]);

  // Transition from Secret Wheel reveal to Tracing Arena
  const handleReadyToTrace = () => {
    if (socket && room?.code) {
      socket.emit("ready-for-tracing", { roomCode: room.code });
    }
  };

  // Host resets room to play another round
  const handlePlayAgain = () => {
    if (socket && room?.code) {
      socket.emit("play-again", { roomCode: room.code });
    }
  };

  // Determine current screen state
  const gameState = room?.state || "LOBBY";

  return (
    <div className="min-h-screen bg-squid-dark text-slate-100 font-sans">
      {/* 1. LOBBY VIEW */}
      {gameState === "LOBBY" && (
        <Lobby
          socket={socket}
          room={room}
          player={player}
          isConnected={isConnected}
          onOpenServerModal={() => setIsServerModalOpen(true)}
        />
      )}

      {/* 2. SECRET WHEEL SPIN PHASE */}
      {gameState === "SPINNING" && (
        <SecretWheel
          secretShape={secretShape}
          onReadyToTrace={handleReadyToTrace}
        />
      )}

      {/* 3. THE TRACING ARENA */}
      {gameState === "TRACING" && (
        <TracingArena
          socket={socket}
          room={room}
          player={player}
          secretShape={secretShape}
          onGameEnd={() => {}}
        />
      )}

      {/* 4. RESULTS SCOREBOARD & ELIMINATION */}
      {gameState === "RESULTS" && (
        <Scoreboard
          results={gameResults}
          player={player}
          isHost={player?.isHost}
          onPlayAgain={handlePlayAgain}
        />
      )}

      {/* Server Configuration Modal */}
      <ServerModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        onServerChanged={(newUrl) => {
          initSocket();
        }}
      />
    </div>
  );
}
