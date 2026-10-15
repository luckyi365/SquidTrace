import { io } from "socket.io-client";

// Get base socket URL from localStorage, env variable, or smart host detection
export function getDefaultSocketUrl() {
  const saved = localStorage.getItem("squid_socket_url");
  if (saved && saved.trim()) {
    return saved.trim();
  }

  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  // If accessed via localhost, connect to local backend port 3001
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3001";
    }
    // If accessed via local LAN IP (e.g., 192.168.1.50) from phone, use that IP with port 3001!
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return `${protocol}//${hostname}:3001`;
    }
    // Otherwise fallback to same origin or production default
    return window.location.origin;
  }

  return "http://localhost:3001";
}

let socket = null;
let currentUrl = getDefaultSocketUrl();

export function getSocket(customUrl = null) {
  const targetUrl = customUrl || currentUrl;

  if (!socket || targetUrl !== currentUrl) {
    if (socket) {
      socket.disconnect();
    }
    currentUrl = targetUrl;
    socket = io(currentUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    socket.on("connect", () => {
      console.log(`[Socket.io Connected] Successfully linked to: ${currentUrl}`);
    });

    socket.on("connect_error", (err) => {
      console.warn(`[Socket.io Connection Error] Could not connect to: ${currentUrl}`, err.message);
    });
  }

  return socket;
}

export function setSocketServerUrl(newUrl) {
  if (!newUrl) return;
  const cleanUrl = newUrl.trim().replace(/\/$/, "");
  localStorage.setItem("squid_socket_url", cleanUrl);
  currentUrl = cleanUrl;
  return getSocket(cleanUrl);
}

export function getCurrentSocketUrl() {
  return currentUrl;
}
