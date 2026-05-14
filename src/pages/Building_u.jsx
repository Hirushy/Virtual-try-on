"use client";
import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, Scan, Layers, Box, ArrowLeft } from "lucide-react";
import { useGLTF } from "@react-three/drei"; // ← preload GLB here
import heroBg from "../assets/pink.jpg";
import Footer from "../components/Footer";

/* ─────────────────────────────────────────────
   SIZE DETECTION
───────────────────────────────────────────── */
function detectSize(gender, height, chest, waist, hips) {
  const nChest = (chest - 70) / (140 - 70);
  const nWaist = (waist - 55) / (130 - 55);
  const nHips = (hips - 70) / (140 - 70);
  const fullness = (nChest + nWaist + nHips) / 3;
  if (fullness < 0.32) return "S";
  if (fullness < 0.45) return "S-M";
  if (fullness < 0.55) return "M-L";
  return "XL";
}

/* ─────────────────────────────────────────────
   PHASE CONFIG
───────────────────────────────────────────── */
const PHASES = [
  { id: 0, icon: Scan, label: "Reading measurements", sub: "Parsing your body data" },
  { id: 1, icon: Layers, label: "Mapping shape keys", sub: "Translating to 3D morphs" },
  { id: 2, icon: Box, label: "Building your avatar", sub: "Finalising geometry" },
];

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Building_u() {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const uploadedPhotos = useMemo(
    () => location.state?.photos || { front: null, back: null },
    [location.state]
  );
  const avatarConfig = useMemo(
    () => location.state?.avatarConfig || {
      gender: "female", hair: "hair_long",
      height: 170, waist: 75, chest: 95, hips: 100,
      shoulders: 44, armLength: 60, legLength: 80,
    },
    [location.state]
  );

  const shapeKeys = [
    { name: "Waist", value: Math.max(0, Math.min(100, ((avatarConfig.waist - 55) / 75) * 100)) },
    { name: "Chest", value: Math.max(0, Math.min(100, ((avatarConfig.chest - 70) / 70) * 100)) },
    { name: "Hips", value: Math.max(0, Math.min(100, ((avatarConfig.hips - 70) / 70) * 100)) },
    { name: "Shoulders", value: Math.max(0, Math.min(100, ((avatarConfig.shoulders - 30) / 30) * 100)) },
  ];

  useEffect(() => {
    // 🚀 Preload — starts immediately on mount in background
    useGLTF.preload("/avatar.glb");

    // ⚡ Fast sequence (Total ~1.5s)
    const t1 = setTimeout(() => setPhase(1), 500); 
    const t2 = setTimeout(() => setPhase(2), 1000); 
    const t3 = setTimeout(() => {
      navigate("/generated", {
        state: {
          photos: uploadedPhotos,
          avatarConfig,
          avatarData: location.state?.avatarData,
        },
      });
    }, 1500); 

    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [navigate, uploadedPhotos, avatarConfig, location.state]);

  const detectedSize = detectSize(
    avatarConfig.gender, avatarConfig.height,
    avatarConfig.chest, avatarConfig.waist, avatarConfig.hips
  );

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-white text-slate-900 antialiased flex flex-col"
      style={{ fontFamily: "'Didact Gothic', sans-serif" }}
    >
      {/* ── LAYER 0: Cinematic pink background ── */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
          opacity: 0.4,
        }}
      />

      {/* ── TOP HUD ── */}
      <header className="relative z-20 h-28 flex justify-between items-center px-16 flex-shrink-0">
        <div
          className="flex items-center gap-4 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 shadow-xl group-hover:scale-125 transition-transform" />
          <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
            STUDIO<span className="text-slate-400 opacity-50">.</span>BASE
          </h1>
        </div>
        <div className="hidden lg:flex flex-col items-end justify-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Model Sequence</span>
          <span className="text-xs font-bold text-slate-900 tracking-wider font-mono uppercase">
            ID_STUDIO_BASE
          </span>
        </div>
      </header>

      {/* ── CENTERED CONTENT ── */}
      <div className="relative z-20 flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl bg-white/20 backdrop-blur-2xl border border-white/20 rounded-[4rem] p-16 flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.15)] ring-1 ring-white/30"
        >
          {/* Spinner */}
          <div className="flex justify-center mb-10">
            <motion.div
              className="w-14 h-14 border-4 border-slate-200 border-t-slate-900 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          </div>

          {/* Header */}
          <div className="mb-12 text-center">
            <p className="text-[13px] font-black tracking-[0.4em] uppercase text-slate-500 mb-4">Step 3 of 4</p>
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-tight">
              Generating your<br />digital twin
            </h2>
          </div>

          {/* Phase steps */}
          <div className="space-y-3 mb-8">
            {PHASES.map((p) => {
              const Icon = p.icon;
              const isDone = phase > p.id;
              const isActive = phase === p.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: p.id * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-[1.5rem] border transition-all duration-500 ${isActive ? "bg-white/60 border-black/10 shadow-sm"
                      : isDone ? "bg-white/40 border-black/5"
                        : "bg-transparent border-black/5 opacity-40"
                    }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isActive || isDone ? "bg-slate-900 shadow-lg" : "bg-black/10"
                    }`}>
                    {isDone
                      ? <CheckCircle2 size={20} className="text-white" />
                      : <Icon size={20} className={isActive ? "text-white" : "text-slate-400"} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-black uppercase tracking-[0.15em] ${isActive || isDone ? "text-slate-900" : "text-slate-400"
                      }`}>{p.label}</p>
                    <p className="text-[12px] text-slate-400 font-medium mt-1">{p.sub}</p>
                  </div>
                  {isActive && (
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-slate-900"
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Data card */}
          <AnimatePresence mode="wait">
            {phase === 0 && (
              <motion.div
                key="meas"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white/40 border border-black/5 rounded-[2rem] p-6"
              >
                <p className="text-[12px] font-black tracking-[0.3em] uppercase text-slate-500 mb-6">Measurements</p>
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  {[
                    ["Height", avatarConfig.height],
                    ["Chest", avatarConfig.chest],
                    ["Waist", avatarConfig.waist],
                    ["Hips", avatarConfig.hips],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between items-baseline border-b border-black/5 pb-2">
                      <span className="text-[12px] text-slate-500 uppercase tracking-widest font-black">{k}</span>
                      <span className="text-lg font-black text-slate-900 font-mono italic">
                        {v}<small className="text-[10px] ml-1 opacity-40 not-italic font-normal">cm</small>
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 1 && (
              <motion.div
                key="shapes"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white/40 border border-black/5 rounded-[2rem] p-6 space-y-4"
              >
                <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">Shape Keys</p>
                {shapeKeys.map((k, i) => (
                  <div key={k.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">{k.name}</span>
                      <span className="text-[10px] text-slate-900 font-black font-mono italic">{k.value.toFixed(0)}%</span>
                    </div>
                    <div className="h-[2px] w-full bg-black/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-slate-900 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${k.value}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {phase === 2 && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="bg-white/40 border border-black/5 rounded-[2rem] p-6 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Avatar Ready</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Redirecting to your result…</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 border-t border-black/5" />

          {/* Back */}
          <button
            onClick={() => navigate("/body-details", { state: { photos: uploadedPhotos, avatarConfig } })}
            className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeft size={12} /> Back to body details
          </button>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <Footer isLightPage={true} compact={true} />
    </div>
  );
}