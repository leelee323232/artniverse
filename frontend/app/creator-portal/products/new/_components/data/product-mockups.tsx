import React from "react";

// Product mockup SVG components for each zone
export const ProductMockups: Record<
  string,
  Record<string, React.FC<{ className?: string; zoneHighlight?: string }>>
> = {
  tshirt: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M50 50 L80 30 L120 30 L150 50 L170 70 L155 85 L140 70 L140 170 L60 170 L60 70 L45 85 L30 70 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <rect
          x="75"
          y="55"
          width="50"
          height="70"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="130" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M50 50 L80 30 L120 30 L150 50 L170 70 L155 85 L140 70 L140 170 L60 170 L60 70 L45 85 L30 70 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <rect
          x="75"
          y="55"
          width="50"
          height="70"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="130" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  hoodie: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M45 55 L75 35 L85 35 L100 50 L115 35 L125 35 L155 55 L175 75 L160 90 L145 75 L145 170 L55 170 L55 75 L40 90 L25 75 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <ellipse
          cx="100"
          cy="40"
          rx="15"
          ry="12"
          fill="#2a2a2a"
          stroke="#555"
        />
        <rect
          x="70"
          y="60"
          width="60"
          height="65"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <path
          d="M45 55 L75 35 L85 35 L100 50 L115 35 L125 35 L155 55 L175 75 L160 90 L145 75 L145 170 L55 170 L55 75 L40 90 L25 75 Z"
          fill="#3a3a3a"
          stroke="#555"
          strokeWidth="2"
        />
        <ellipse
          cx="100"
          cy="40"
          rx="15"
          ry="12"
          fill="#2a2a2a"
          stroke="#555"
        />
        <rect
          x="70"
          y="60"
          width="60"
          height="65"
          fill={zoneHighlight || "#2a2a2a"}
          rx="2"
          opacity={zoneHighlight ? "0.3" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="140" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  mug: {
    left: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="50"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="65" y="170" textAnchor="middle" fill="#666" fontSize="8">
          左側
        </text>
      </svg>
    ),
    center: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="75"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="90" y="170" textAnchor="middle" fill="#666" fontSize="8">
          中間
        </text>
      </svg>
    ),
    right: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="50"
          width="90"
          height="110"
          rx="8"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <path
          d="M135 70 Q165 70 165 100 Q165 130 135 130"
          fill="none"
          stroke="#ccc"
          strokeWidth="8"
        />
        <rect
          x="100"
          y="60"
          width="30"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="4"
          opacity={zoneHighlight ? "0.5" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="115" y="170" textAnchor="middle" fill="#666" fontSize="8">
          右側
        </text>
      </svg>
    ),
  },
  "tote-bag": {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="40"
          y="60"
          width="120"
          height="120"
          fill="#d4c4b0"
          stroke="#b5a590"
          strokeWidth="2"
        />
        <path
          d="M70 60 Q70 30 100 30 Q130 30 130 60"
          fill="none"
          stroke="#b5a590"
          strokeWidth="6"
        />
        <rect
          x="55"
          y="75"
          width="90"
          height="90"
          fill={zoneHighlight || "#c9b9a5"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="40"
          y="60"
          width="120"
          height="120"
          fill="#d4c4b0"
          stroke="#b5a590"
          strokeWidth="2"
        />
        <path
          d="M70 60 Q70 30 100 30 Q130 30 130 60"
          fill="none"
          stroke="#b5a590"
          strokeWidth="6"
        />
        <rect
          x="55"
          y="75"
          width="90"
          height="90"
          fill={zoneHighlight || "#c9b9a5"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.5"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  "phone-case": {
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="60"
          y="25"
          width="80"
          height="150"
          rx="12"
          fill="#2a2a2a"
          stroke="#444"
          strokeWidth="2"
        />
        <rect x="68" y="35" width="64" height="120" rx="4" fill="#1a1a1a" />
        <circle cx="100" cy="165" r="6" fill="#333" />
        <rect
          x="72"
          y="40"
          width="56"
          height="100"
          fill={zoneHighlight || "#222"}
          rx="2"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  poster: {
    full: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="35"
          y="20"
          width="130"
          height="160"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="30"
          width="110"
          height="140"
          fill={zoneHighlight || "#f8f8f8"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.8"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="190" textAnchor="middle" fill="#666" fontSize="8">
          整面
        </text>
      </svg>
    ),
  },
  "sticker-pack": {
    sticker: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="50"
          y="50"
          width="60"
          height="60"
          rx="8"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
          transform="rotate(-15 80 80)"
        />
        <rect
          x="80"
          y="60"
          width="60"
          height="60"
          rx="8"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
          transform="rotate(10 110 90)"
        />
        <rect
          x="65"
          y="90"
          width="60"
          height="60"
          rx="8"
          fill={zoneHighlight || "#fff"}
          stroke={zoneHighlight ? "#a855f7" : "#ddd"}
          strokeWidth="2"
          transform="rotate(-5 95 120)"
          strokeDasharray={zoneHighlight ? "4" : "0"}
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          貼紙
        </text>
      </svg>
    ),
  },
  notebook: {
    cover: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="45"
          y="30"
          width="110"
          height="140"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="2"
        />
        <rect x="45" y="30" width="15" height="140" fill="#e74c3c" />
        <line x1="70" y1="30" x2="70" y2="170" stroke="#ddd" strokeWidth="1" />
        <rect
          x="80"
          y="40"
          width="65"
          height="120"
          fill={zoneHighlight || "#f9f9f9"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          封面
        </text>
      </svg>
    ),
  },
  pillow: {
    front: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="30"
          y="40"
          width="140"
          height="120"
          rx="20"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="55"
          width="110"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="10"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          正面
        </text>
      </svg>
    ),
    back: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="30"
          y="40"
          width="140"
          height="120"
          rx="20"
          fill="#e8e8e8"
          stroke="#ccc"
          strokeWidth="2"
        />
        <rect
          x="45"
          y="55"
          width="110"
          height="90"
          fill={zoneHighlight || "#f5f5f5"}
          rx="10"
          opacity={zoneHighlight ? "0.4" : "0.6"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="175" textAnchor="middle" fill="#666" fontSize="8">
          背面
        </text>
      </svg>
    ),
  },
  canvas: {
    full: ({ className, zoneHighlight }) => (
      <svg viewBox="0 0 200 200" className={className} fill="none">
        <rect
          x="25"
          y="25"
          width="150"
          height="150"
          fill="#8b7355"
          stroke="#6b5344"
          strokeWidth="3"
        />
        <rect
          x="35"
          y="35"
          width="130"
          height="130"
          fill="#fff"
          stroke="#ddd"
          strokeWidth="1"
        />
        <rect
          x="45"
          y="45"
          width="110"
          height="110"
          fill={zoneHighlight || "#fafafa"}
          rx="1"
          opacity={zoneHighlight ? "0.4" : "0.7"}
          stroke={zoneHighlight ? "#a855f7" : "none"}
          strokeWidth="2"
          strokeDasharray="4"
        />
        <text x="100" y="185" textAnchor="middle" fill="#666" fontSize="8">
          整面
        </text>
      </svg>
    ),
  },
};
