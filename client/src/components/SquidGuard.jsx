import React from "react";

/**
 * Authentic Squid Game Soldier with Hood & Black Mask (Triangle/Circle/Square)
 * Rendered with SVG vectors, cinematic shadows, and metallic rim lighting.
 */
export default function SquidGuard({ maskSymbol = "triangle", className = "w-28 h-28" }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
      >
        <defs>
          {/* Hood Fabric Gradient */}
          <linearGradient id="hoodGrad" x1="100" y1="10" x2="100" y2="210" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bf133d" />
            <stop offset="35%" stopColor="#8c0d2b" />
            <stop offset="80%" stopColor="#540719" />
            <stop offset="100%" stopColor="#2e030c" />
          </linearGradient>

          {/* Mask Dark Grid Gradient */}
          <radialGradient id="maskGrad" cx="100" cy="95" r="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1e24" />
            <stop offset="70%" stopColor="#0d0d10" />
            <stop offset="100%" stopColor="#050507" />
          </radialGradient>

          {/* Golden Rim Highlight */}
          <linearGradient id="goldRim" x1="0" y1="0" x2="200" y2="220" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFC857" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#FFC857" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFC857" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Shoulders & Jacket */}
        <path
          d="M20 220 C20 170, 55 155, 75 150 L125 150 C145 155, 180 170, 180 220 Z"
          fill="url(#hoodGrad)"
          stroke="#400512"
          strokeWidth="3"
        />

        {/* Jacket Zipper */}
        <path d="M100 150 L100 220" stroke="#1a0206" strokeWidth="4" />
        <path d="M100 150 L100 220" stroke="#FFC857" strokeWidth="1" strokeDasharray="3 3" />

        {/* Outer Hood Contour */}
        <path
          d="M100 15 C55 15, 40 55, 42 105 C43 140, 60 162, 100 165 C140 162, 157 140, 158 105 C160 55, 145 15, 100 15 Z"
          fill="url(#hoodGrad)"
          stroke="url(#goldRim)"
          strokeWidth="2.5"
        />

        {/* Inner Hood Dark Shadow Fold */}
        <path
          d="M100 25 C62 25, 48 60, 50 105 C51 135, 68 152, 100 155 C132 152, 149 135, 150 105 C152 60, 138 25, 100 25 Z"
          fill="#0a0305"
        />

        {/* Mask Mesh Face Oval */}
        <ellipse
          cx="100"
          cy="98"
          rx="42"
          ry="48"
          fill="url(#maskGrad)"
          stroke="#26262e"
          strokeWidth="3"
        />

        {/* Fine Mesh Pattern Dots */}
        <g opacity="0.15">
          <circle cx="90" cy="80" r="1" fill="#fff" />
          <circle cx="100" cy="80" r="1" fill="#fff" />
          <circle cx="110" cy="80" r="1" fill="#fff" />
          <circle cx="85" cy="90" r="1" fill="#fff" />
          <circle cx="95" cy="90" r="1" fill="#fff" />
          <circle cx="105" cy="90" r="1" fill="#fff" />
          <circle cx="115" cy="90" r="1" fill="#fff" />
          <circle cx="90" cy="100" r="1" fill="#fff" />
          <circle cx="100" cy="100" r="1" fill="#fff" />
          <circle cx="110" cy="100" r="1" fill="#fff" />
          <circle cx="95" cy="110" r="1" fill="#fff" />
          <circle cx="105" cy="110" r="1" fill="#fff" />
        </g>

        {/* Mask Symbol: Triangle */}
        {maskSymbol === "triangle" && (
          <polygon
            points="100,68 126,116 74,116"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinejoin="round"
            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
          />
        )}

        {/* Mask Symbol: Circle */}
        {maskSymbol === "circle" && (
          <circle
            cx="100"
            cy="95"
            r="23"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
          />
        )}

        {/* Mask Symbol: Square */}
        {maskSymbol === "square" && (
          <rect
            x="78"
            y="73"
            width="44"
            height="44"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            className="filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]"
          />
        )}
      </svg>
    </div>
  );
}
