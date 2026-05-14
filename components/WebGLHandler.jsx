import React from "react";
import { AlertTriangle } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   WEBGL CHECK
  ───────────────────────────────────────────────────────── */
export function isWebGLAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
}

/* ─────────────────────────────────────────────────────────
   ERROR BOUNDARY
  ───────────────────────────────────────────────────────── */
export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn("Canvas error caught by Boundary:", error?.message);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <NoWebGLBanner />;
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────
   NO WEBGL BANNER
  ───────────────────────────────────────────────────────── */
export function NoWebGLBanner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-4 z-10">
      <div
        className="w-36 h-56 rounded-[2.5rem] flex flex-col items-center justify-center border border-black/10 shadow-inner"
        style={{
          background: "rgba(255,255,255,0.22)",
          backdropFilter: "blur(10px)",
        }}
      >
        <svg viewBox="0 0 70 120" width="70" height="120" fill="none">
          <circle cx="35" cy="15" r="12" fill="rgba(0,0,0,0.13)" />
          <rect
            x="18"
            y="32"
            width="34"
            height="38"
            rx="9"
            fill="rgba(0,0,0,0.13)"
          />
          <rect
            x="5"
            y="34"
            width="12"
            height="30"
            rx="6"
            fill="rgba(0,0,0,0.10)"
          />
          <rect
            x="53"
            y="34"
            width="12"
            height="30"
            rx="6"
            fill="rgba(0,0,0,0.10)"
          />
          <rect
            x="18"
            y="70"
            width="14"
            height="42"
            rx="7"
            fill="rgba(0,0,0,0.10)"
          />
          <rect
            x="38"
            y="70"
            width="14"
            height="42"
            rx="7"
            fill="rgba(0,0,0,0.10)"
          />
        </svg>
        <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Avatar
        </span>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50/90 border border-amber-200/60 shadow-sm">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
          3D Rendering Paused
        </span>
      </div>
    </div>
  );
}

/**
 * Common GL settings to prevent context loss and improve performance
 */
export const DEFAULT_GL_SETTINGS = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
  precision: "mediump",
  preserveDrawingBuffer: false,
  failIfMajorPerformanceCaveat: false,
};
