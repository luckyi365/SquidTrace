import React, { useState } from "react";
import { getCurrentSocketUrl, setSocketServerUrl } from "../services/socket";
import { Server, Check, RefreshCw, X, Wifi, ExternalLink } from "lucide-react";

export default function ServerModal({ isOpen, onClose, onServerChanged }) {
  const [url, setUrl] = useState(getCurrentSocketUrl());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSocketServerUrl(url.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      if (onServerChanged) onServerChanged(url.trim());
      onClose();
    }, 800);
  };

  const handleResetLocal = () => {
    const defaultLocal = "http://localhost:3001";
    setUrl(defaultLocal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-squid-teal/10 border border-squid-teal/30 flex items-center justify-center text-squid-teal">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">
              WebSocket Server Config
            </h3>
            <p className="text-xs text-zinc-400">
              Multiplayer synchronization backend URL
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5 uppercase font-semibold">
              Server URL
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="e.g. http://192.168.1.15:3001 or https://my-server.onrender.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-squid-teal transition-colors"
              />
            </div>
            <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center gap-1">
              <Wifi className="w-3 h-3 text-squid-teal" />
              <span>For mobile phones on same Wi-Fi, enter your PC's IP address (e.g. <code className="text-squid-teal">http://192.168.x.x:3001</code>)</span>
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleResetLocal}
              className="px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 border border-white/5 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset localhost:3001</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-squid-teal hover:bg-squid-teal/90 text-black font-bold text-sm font-display flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-squid-teal/20"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save & Connect</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
