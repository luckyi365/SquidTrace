import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "online",
    app: "Squid Trace Real-Time Server",
    timestamp: new Date().toISOString(),
    activeRooms: Object.keys(rooms).length
  });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Squid Game classic player numbers pool
const SQUID_NUMBERS = ["456", "218", "067", "001", "199", "101", "240", "111", "069", "070", "212", "322", "360"];

// 9 Ranked Shapes (Difficulty 1 to 9)
export const SHAPE_CATALOG = {
  1: { level: 1, name: "Rhombus", threshold: 70, description: "Equilateral 4-sided diamond" },
  2: { level: 2, name: "Star", threshold: 75, description: "5-pointed celestial star" },
  3: { level: 3, name: "Triangular Prism", threshold: 80, description: "Dual triangle 3D wireframe" },
  4: { level: 4, name: "Pentagonal Pyramid", threshold: 82, description: "5-gon base apex solid" },
  5: { level: 5, name: "Umbrella", threshold: 85, description: "Classic Squid Game curved canopy" },
  6: { level: 6, name: "Butterfly", threshold: 88, description: "Symmetric quad-wing silhouette" },
  7: { level: 7, name: "Octagram", threshold: 90, description: "8-pointed intersecting dual-square" },
  8: { level: 8, name: "Nonagon", threshold: 92, description: "9-sided geometric polygon" },
  9: { level: 9, name: "Icosahedron", threshold: 95, description: "Complex 20-faced 3D network" }
};

// In-memory room store
const rooms = {};

// Helper: generate 6-character room code (e.g., SQ-7821 or 6-char alphanumeric)
function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "SQ-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper: clean room format for broadcasting
function getSanitizedRoom(room) {
  if (!room) return null;
  const playersList = Object.values(room.players).map(p => ({
    id: p.id,
    name: p.name,
    playerNumber: p.playerNumber,
    isHost: p.isHost,
    status: p.status,
    accuracy: p.accuracy || 0,
    lockedIn: p.lockedIn || false,
    // Shape is kept secret during TRACING phase unless results are revealed
    shapeLevel: room.state === "RESULTS" ? p.shapeLevel : undefined,
    shapeName: room.state === "RESULTS" ? (SHAPE_CATALOG[p.shapeLevel]?.name) : undefined
  }));

  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    players: playersList,
    timer: {
      duration: room.timer.duration,
      remaining: room.timer.remaining,
      endTime: room.timer.endTime
    }
  };
}

// End the game, calculate survivals, emit results
function finishGame(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.state === "RESULTS") return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }

  room.state = "RESULTS";

  const results = Object.values(room.players).map(p => {
    const shape = SHAPE_CATALOG[p.shapeLevel] || SHAPE_CATALOG[1];
    const finalAccuracy = Math.round(p.accuracy || 0);
    const survived = finalAccuracy >= shape.threshold;
    p.status = survived ? "SURVIVED" : "ELIMINATED";

    return {
      id: p.id,
      name: p.name,
      playerNumber: p.playerNumber,
      shapeLevel: p.shapeLevel,
      shapeName: shape.name,
      threshold: shape.threshold,
      finalAccuracy,
      survived,
      lockedIn: p.lockedIn || false
    };
  });

  // Rank: Survived first (highest accuracy), then eliminated (highest accuracy)
  results.sort((a, b) => {
    if (a.survived && !b.survived) return -1;
    if (!a.survived && b.survived) return 1;
    return b.finalAccuracy - a.finalAccuracy;
  });

  results.forEach((r, index) => {
    r.rank = index + 1;
  });

  io.to(roomCode).emit("game-over", {
    roomCode,
    results,
    room: getSanitizedRoom(room)
  });
}

// Start master 2-minute timer for a room
function startMasterTimer(roomCode) {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
  }

  const durationSec = 120; // 2 minutes
  const now = Date.now();
  room.timer = {
    duration: durationSec,
    remaining: durationSec,
    endTime: now + durationSec * 1000
  };

  io.to(roomCode).emit("timer-started", {
    duration: durationSec,
    remaining: durationSec,
    endTime: room.timer.endTime
  });

  room.timerInterval = setInterval(() => {
    const currentRoom = rooms[roomCode];
    if (!currentRoom || currentRoom.state !== "TRACING") {
      clearInterval(room.timerInterval);
      return;
    }

    const currentRemaining = Math.max(0, Math.ceil((currentRoom.timer.endTime - Date.now()) / 1000));
    currentRoom.timer.remaining = currentRemaining;

    io.to(roomCode).emit("timer-tick", {
      remaining: currentRemaining,
      endTime: currentRoom.timer.endTime
    });

    if (currentRemaining <= 0) {
      clearInterval(currentRoom.timerInterval);
      currentRoom.timerInterval = null;
      finishGame(roomCode);
    }
  }, 1000);
}

io.on("connection", (socket) => {
  console.log(`[Socket Connected] ID: ${socket.id}`);

  // Create Room
  socket.on("create-room", ({ playerName }, callback) => {
    const cleanName = (playerName || "Host Player").trim().substring(0, 16);
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    const playerNumber = SQUID_NUMBERS[0];
    const player = {
      id: socket.id,
      name: cleanName,
      playerNumber,
      isHost: true,
      status: "WAITING",
      shapeLevel: 1,
      accuracy: 0,
      lockedIn: false
    };

    rooms[roomCode] = {
      code: roomCode,
      hostId: socket.id,
      state: "LOBBY",
      players: { [socket.id]: player },
      timer: { duration: 120, remaining: 120, endTime: null },
      timerInterval: null
    };

    socket.join(roomCode);
    socket.roomCode = roomCode;

    if (typeof callback === "function") {
      callback({ success: true, roomCode, player, room: getSanitizedRoom(rooms[roomCode]) });
    }
    io.to(roomCode).emit("room-updated", getSanitizedRoom(rooms[roomCode]));
  });

  // Join Room
  socket.on("join-room", ({ roomCode, playerName }, callback) => {
    const upperCode = (roomCode || "").toUpperCase().trim();
    const room = rooms[upperCode];

    if (!room) {
      if (typeof callback === "function") {
        callback({ success: false, message: "Room not found. Check the code." });
      }
      return;
    }

    if (room.state !== "LOBBY") {
      if (typeof callback === "function") {
        callback({ success: false, message: "Game has already started in this room." });
      }
      return;
    }

    const cleanName = (playerName || "Contender").trim().substring(0, 16);
    const existingCount = Object.keys(room.players).length;
    const playerNumber = SQUID_NUMBERS[existingCount % SQUID_NUMBERS.length] || `0${existingCount + 1}`;

    const player = {
      id: socket.id,
      name: cleanName,
      playerNumber,
      isHost: false,
      status: "WAITING",
      shapeLevel: 1,
      accuracy: 0,
      lockedIn: false
    };

    room.players[socket.id] = player;
    socket.join(upperCode);
    socket.roomCode = upperCode;

    if (typeof callback === "function") {
      callback({ success: true, roomCode: upperCode, player, room: getSanitizedRoom(room) });
    }

    io.to(upperCode).emit("room-updated", getSanitizedRoom(room));
    io.to(upperCode).emit("player-joined-announcement", {
      name: cleanName,
      playerNumber
    });
  });

  // Host starts game -> trigger Secret Wheel Spin
  socket.on("start-game", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    room.state = "SPINNING";

    // Allocate a random shape level (1 to 9) to each player independently
    Object.values(room.players).forEach((p) => {
      const assignedLevel = Math.floor(Math.random() * 9) + 1;
      p.shapeLevel = assignedLevel;
      p.status = "SPINNING";
      p.accuracy = 0;
      p.lockedIn = false;

      const shapeInfo = SHAPE_CATALOG[assignedLevel];

      // Send the shape privately to this specific player socket
      io.to(p.id).emit("secret-shape-assigned", {
        shapeLevel: assignedLevel,
        shapeName: shapeInfo.name,
        threshold: shapeInfo.threshold,
        description: shapeInfo.description
      });
    });

    // Notify room that wheel spin has commenced
    io.to(roomCode).emit("game-started", {
      state: "SPINNING",
      room: getSanitizedRoom(room)
    });
  });

  // Client signals they finished wheel reveal and enter Tracing Arena
  socket.on("ready-for-tracing", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (room.players[socket.id]) {
      room.players[socket.id].status = "TRACING";
    }

    // If room is still in SPINNING state, transition it to TRACING and start the master timer
    if (room.state === "SPINNING") {
      room.state = "TRACING";
      io.to(roomCode).emit("tracing-phase-started", {
        room: getSanitizedRoom(room)
      });
      startMasterTimer(roomCode);
    } else {
      io.to(roomCode).emit("room-updated", getSanitizedRoom(room));
    }
  });

  // Real-time progress update (accuracy percentage)
  socket.on("update-progress", ({ roomCode, accuracy }) => {
    const room = rooms[roomCode];
    if (!room || !room.players[socket.id] || room.state !== "TRACING") return;

    const p = room.players[socket.id];
    if (p.lockedIn) return; // Ignore if already locked in

    p.accuracy = Math.min(100, Math.max(0, Math.round(accuracy || 0)));

    // Emit light progress packet to other players
    socket.to(roomCode).emit("player-progress-updated", {
      playerId: p.id,
      playerNumber: p.playerNumber,
      name: p.name,
      accuracy: p.accuracy,
      lockedIn: p.lockedIn
    });
  });

  // Player locks in their drawing
  socket.on("lock-in", ({ roomCode, finalAccuracy }) => {
    const room = rooms[roomCode];
    if (!room || !room.players[socket.id] || room.state !== "TRACING") return;

    const p = room.players[socket.id];
    p.accuracy = Math.min(100, Math.max(0, Math.round(finalAccuracy || p.accuracy || 0)));
    p.lockedIn = true;
    p.status = "LOCKED_IN";

    io.to(roomCode).emit("player-locked-in", {
      playerId: p.id,
      playerNumber: p.playerNumber,
      name: p.name,
      accuracy: p.accuracy
    });

    io.to(roomCode).emit("room-updated", getSanitizedRoom(room));

    // Check if ALL players are locked in
    const allLocked = Object.values(room.players).every(player => player.lockedIn);
    if (allLocked) {
      setTimeout(() => {
        finishGame(roomCode);
      }, 1000);
    }
  });

  // Play Again (Host resets room back to LOBBY)
  socket.on("play-again", ({ roomCode }) => {
    const room = rooms[roomCode];
    if (!room || room.hostId !== socket.id) return;

    if (room.timerInterval) {
      clearInterval(room.timerInterval);
      room.timerInterval = null;
    }

    room.state = "LOBBY";
    room.timer = { duration: 120, remaining: 120, endTime: null };

    Object.values(room.players).forEach(p => {
      p.status = "WAITING";
      p.accuracy = 0;
      p.lockedIn = false;
      p.shapeLevel = 1;
    });

    io.to(roomCode).emit("room-reset", getSanitizedRoom(room));
  });

  // Handle Disconnection
  socket.on("disconnect", () => {
    console.log(`[Socket Disconnected] ID: ${socket.id}`);
    const roomCode = socket.roomCode;
    if (!roomCode || !rooms[roomCode]) return;

    const room = rooms[roomCode];
    const departingPlayer = room.players[socket.id];
    delete room.players[socket.id];

    const remainingPlayers = Object.values(room.players);

    if (remainingPlayers.length === 0) {
      if (room.timerInterval) {
        clearInterval(room.timerInterval);
      }
      delete rooms[roomCode];
      console.log(`[Room Cleaned] Code: ${roomCode}`);
    } else {
      // If host left, assign new host
      if (room.hostId === socket.id) {
        room.hostId = remainingPlayers[0].id;
        remainingPlayers[0].isHost = true;
      }

      io.to(roomCode).emit("room-updated", getSanitizedRoom(room));
      if (departingPlayer) {
        io.to(roomCode).emit("player-left-announcement", {
          name: departingPlayer.name,
          playerNumber: departingPlayer.playerNumber
        });
      }

      // If in tracing phase and now all remaining players are locked in, finish
      if (room.state === "TRACING") {
        const allLocked = remainingPlayers.every(p => p.lockedIn);
        if (allLocked) {
          finishGame(roomCode);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🦑 SQUID TRACE WebSocket Server active on http://localhost:${PORT}`);
  console.log(`🌐 Ready for multi-device cross-network connections`);
});
