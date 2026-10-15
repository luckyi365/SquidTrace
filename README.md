# 🦑 SQUID TRACE: GESTURE SURVIVAL
### Real-Time Multiplayer Air-Tracing Web Application (Inspired by Squid Game)

A complete, production-ready, highly polished web application where players on multiple physical devices compete in real-time. Players join a shared room, the server secretly allocates one of **9 Ranked Shapes (Difficulty 1 to 9)** via a suspenseful wheel spin, and contenders must trace their assigned shape directly in the air using their webcam and computer vision within a synchronized 2-minute master timer.

---

## 📸 Visual Showcase

- **Real-Time Lobby & Room Codes**: Unique 6-character room codes (`SQ-XXXX`), live player roster with Squid Game player numbers (`#456`, `#218`, `#067`), host controls, and instant code copy.
- **The Wheel of Fate**: Server-synchronized suspenseful wheel spin allocating secret shapes independently to each player with tick audio physics.
- **The Tracing Arena**: Full-width mirrored webcam feed with glowing neon-cyan air-tracing canvas, index fingertip cursor crosshair, Top-Left synced master timer and accuracy gauge, and Top-Right secret wireframe reference card.
- **Elimination Scoreboard**: Stamped `SURVIVED` (Gold/Emerald) vs `ELIMINATED` (Blood Red) with gunshot bass impact sound, prize vault counter (₩45,600,000,000), and global leaderboard rankings.

---

## 📐 The 9 Ranked Shapes & Survival Thresholds

| Level | Shape Name | Threshold | Geometric Specification |
| :---: | :--- | :---: | :--- |
| **1** | **Rhombus** | **70%** | 4-corner equilateral diamond |
| **2** | **Star** | **75%** | 5-pointed celestial star with 10 alternating tips |
| **3** | **Triangular Prism** | **80%** | 3D wireframe composed of two parallel triangles connected by 3 edges |
| **4** | **Pentagonal Pyramid** | **82%** | 3D solid with 5-gon base converging to a sharp apex |
| **5** | **Umbrella** | **85%** | Iconic Squid Game honeycomb shape: arched dome & curved handle hook |
| **6** | **Butterfly** | **88%** | 4 symmetrical curved wing lobes with central slender thorax |
| **7** | **Octagram** | **90%** | Intricate 8-pointed star formed by two 45° intersecting squares |
| **8** | **Nonagon** | **92%** | Regular 9-sided polygon with equidistant vertices |
| **9** | **Icosahedron** | **95%** | Complex 20-faced 3D network with hexagonal frame & internal lattice |

---

## 🛠️ Architecture & Tech Stack

- **Frontend**:
  - **React (Vite)** with modern functional components and hooks
  - **Tailwind CSS** with custom Squid Game neon glow design tokens and glassmorphism
  - **Framer Motion & Canvas Confetti** for fluid animations and celebration fanfares
  - **Lucide React** for clean geometric iconography
  - **Web Audio API** synthesized sound engine (zero external audio file loading failures)
- **Computer Vision**:
  - Client-side real-time hand tracking using **@mediapipe/hands** and **@mediapipe/camera_utils**
  - Tracks Landmark 8 (**Index Finger Tip**) with mirrored coordinate mapping
  - Built-in **Mouse & Touch Mode Fallback** for seamless multi-tab testing or devices without camera access
- **Real-Time Synchronization**:
  - **Node.js + Express + Socket.io** companion server
  - Room management, synchronized 120-second master countdown timer, and private shape allocation

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ (tested on v24)
- **npm** v9+

### 2. Install Dependencies
Run in the project root:
```bash
# Install root dependencies
npm install

# Install companion backend dependencies
cd server && npm install && cd ..

# Install frontend client dependencies
cd client && npm install && cd ..
```

### 3. Run Both Server and Client Concurrently
```bash
npm run dev
```
- **Companion Backend Server**: http://localhost:3001
- **React Frontend**: http://localhost:5173 (or 5174)

Alternatively, you can run them in separate terminal tabs:
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

---

## 📱 Multi-Device Multiplayer on Local Wi-Fi

To play with friends or family on separate phones/laptops on the same Wi-Fi network:

1. Find your computer's local IP address (e.g. `192.168.1.79`):
   - **Windows**: Run `ipconfig` in Command Prompt
   - **macOS/Linux**: Run `ifconfig` or `ip a`
2. Ensure your backend server is running on port `3001`.
3. On another device (phone/tablet/laptop), open the browser and navigate to:
   ```
   http://192.168.1.79:5173
   ```
4. **Linking the Backend**:
   - The app automatically detects local network IPs and connects to `http://192.168.1.79:3001`.
   - You can also click the ⚙️ **Settings** icon on the top-right of the Lobby screen and enter your backend server URL at any time!

---

## ☁️ Production Cloud Deployment Guide

### Deploying the Companion Backend (Render or Railway)

1. **Deploy to Render**:
   - Create a new **Web Service** on [Render.com](https://render.com).
   - Point to your repository root or `server/` directory.
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `node server/index.js`
   - **Environment Variables**:
     - `PORT`: `3001` (or let Render set it automatically)
   - Copy the deployed URL (e.g., `https://squid-trace-backend.onrender.com`).

2. **Deploy to Railway**:
   - Create a new project on [Railway.app](https://railway.app).
   - Select the `server` directory as the root.
   - Railway will detect `package.json` and deploy the Node.js server automatically.

---

### Deploying the Frontend (Vercel or Netlify)

1. **Deploy to Vercel**:
   - Import your repository on [Vercel](https://vercel.com).
   - Set **Root Directory** to `client`.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_SOCKET_URL`: `https://squid-trace-backend.onrender.com` (your deployed backend URL)
2. Deploy! The frontend will now automatically connect to your cloud WebSocket server across all global devices.

---

## 🎯 How the Accuracy Matcher Works

The client-side geometric engine (`src/utils/shapeMatcher.js`) evaluates air-drawn paths against the reference shape:
1. **Bounding Box Area & Scale**: Ensures the drawing is at a visible scale (> 2500 px²).
2. **Aspect Ratio Match**: Compares the user's stroke bounding box against the shape's expected ratio.
3. **Corner / Directional Turn Detection**: Calculates angular inflection points along the smoothed stroke and matches them with `expectedTurns` (e.g. 4 for Rhombus, 10 for Star, 16 for Octagram).
4. **Perimeter & Radial Coverage**: Computes radial dispersion around the centroid across 8 directional octants to ensure proper 2D/3D enclosure.
5. **Score Aggregation**: Returns a real-time accuracy percentage (0% to 98%). If `accuracy >= threshold`, the contender survives!

---

## 🕹️ Controls & Shortcuts

- **Index Finger Pointing**: Draw in the air with your webcam feed.
- **Mouse / Touch Mode**: Click the bottom input toggle to switch to mouse drawing anytime.
- **Lock In**: Commit your drawing to the server.
- **Clear**: Reset your current drawing stroke to re-attempt.
- **Ghost Overlay**: Toggle a faint template guideline in the center of the screen.
- **Mute / Unmute**: Toggle synthesized sound effects in the bottom dock.
