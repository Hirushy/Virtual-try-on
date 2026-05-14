// Body details configuration

"use client";

import React, { useState, useEffect, Suspense, useRef, useCallback, Component } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, Stage } from "@react-three/drei";
import * as THREE from "three";
import { User, Ruler, Activity, Save, RotateCcw, AlertTriangle } from "lucide-react";
import heroBg from "../assets/pink.jpg";
import Footer from "../components/Footer";
import { CanvasErrorBoundary, isWebGLAvailable, DEFAULT_GL_SETTINGS } from "../components/WebGLHandler";

// Avatar placeholder used when WebGL is unavailable

function AvatarPlaceholder({ gender }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
      <div
        className="w-40 h-64 rounded-[3rem] flex flex-col items-center justify-center gap-3 border border-black/10 shadow-inner"
        style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}
      >
        {/* Simple silhouette SVG */}
        <svg viewBox="0 0 80 140" width="80" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="40" cy="18" r="14" fill="rgba(0,0,0,0.12)" />
          {/* Neck */}
          <rect x="35" y="30" width="10" height="8" rx="3" fill="rgba(0,0,0,0.10)" />
          {/* Torso */}
          <rect x="22" y="38" width="36" height="44" rx="10" fill="rgba(0,0,0,0.12)" />
          {/* Left arm */}
          <rect x="6" y="40" width="14" height="34" rx="7" fill="rgba(0,0,0,0.10)" />
          {/* Right arm */}
          <rect x="60" y="40" width="14" height="34" rx="7" fill="rgba(0,0,0,0.10)" />
          {/* Left leg */}
          <rect x="22" y="82" width="15" height="48" rx="7" fill="rgba(0,0,0,0.10)" />
          {/* Right leg */}
          <rect x="43" y="82" width="15" height="48" rx="7" fill="rgba(0,0,0,0.10)" />
        </svg>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">
          {gender === "female" ? "Female" : "Male"} Model
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50/80 border border-amber-200/60 shadow-sm">
        <AlertTriangle size={13} className="text-amber-500 flex-shrink-0" />
        <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">
          3D Preview Unavailable
        </span>
      </div>
    </div>
  );
}

// Configuration constants

const MORPH_RANGES = {
  female: { height: [140, 210], chest: [70, 140], waist: [55, 130], hips: [70, 140], shoulders: [30, 60], arm: [45, 80], leg: [60, 120] },
  male: { height: [150, 215], chest: [75, 150], waist: [60, 140], hips: [78, 155], shoulders: [38, 62], arm: [54, 76], leg: [88, 132] },
};

const DEFAULTS = {
  female: { height: 170, chest: 96, waist: 72, hips: 100, shoulders: 42, arm: 58, leg: 85 },
  male: { height: 182, chest: 105, waist: 88, hips: 104, shoulders: 48, arm: 64, leg: 95 },
};

// Helper function to apply morph targets to the model

function applyMorph(obj, gender, part, value) {
  if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
  const dict = obj.morphTargetDictionary;
  const influences = obj.morphTargetInfluences;
  const tokenize = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "").split("_").filter(Boolean)
    .map(t => t.replace(/hips/g, "hip").replace(/shoulders/g, "shoulder"));
  const findKey = (suffix) => {
    const need = [
      gender.toLowerCase(),
      part.toLowerCase().replace(/hips/g, "hip").replace(/shoulders/g, "shoulder"),
      suffix.toLowerCase(),
    ];
    return Object.keys(dict).find(k => need.every(t => tokenize(k).includes(t)));
  };
  const k = findKey("Smaller");
  if (k !== undefined && dict[k] !== undefined)
    influences[dict[k]] = Math.max(0, Math.min(1, value));
}

const weightStatus = (weight) => {
  if (weight < 40) return { label: "Thin", cls: "text-blue-400" };
  if (weight < 50) return { label: "Slim", cls: "text-emerald-400" };
  if (weight < 55) return { label: "Average", cls: "text-emerald-600" };
  if (weight < 65) return { label: "Curvy", cls: "text-violet-500" };
  if (weight < 100) return { label: "Plus-size", cls: "text-amber-500" };
  return { label: "Extra Plus", cls: "text-rose-500" };
};

/* ─────────────────────────────────────────────
   AVATAR MODEL
───────────────────────────────────────────── */

function AvatarModel({ config, focusRegion }) {
  const { scene } = useGLTF("/avatar.glb");
  const { gender, hair, height, waist, chest, hips, shoulders, armLength, legLength } = config;

  useEffect(() => {
    if (!scene) return;
    const ranges = MORPH_RANGES[gender] || MORPH_RANGES.female;
    const mv = (val, key) => {
      const [mn, mx] = ranges[key];
      return mx === mn ? 0 : Math.max(0, Math.min(1, (mx - val) / (mx - mn)));
    };
    const [hMin, hMax] = ranges.height;
    const hScale = hMax === hMin ? 1 : 0.88 + ((height - hMin) / (hMax - hMin)) * 0.20;

    scene.traverse(obj => {
      const n = obj.name || "";
      const nl = n.toLowerCase();

      // Body detection
      const isFemaleBody = (n === "Female_Body" || n === "Female_Root" || n === "LOD7_aiStandardSurface1_0");
      const isMaleBody = (["Male_body", "Male_Root", "Male1_aiStandardSurface1_0", "Male_Body"].includes(n));
      const isHair = nl.includes("hair");

      if (isHair) {
        obj.visible = false;
      } else if (isFemaleBody) {
        obj.visible = (gender === "female");
      } else if (isMaleBody) {
        obj.visible = (gender === "male");
      } else if (obj.isMesh) {
        obj.visible = false;
      }

      if ((gender === "male" && n === "Male_Root") || (gender === "female" && n === "Female_Root"))
        obj.scale.set(1, hScale, 1);

      if (obj.isMesh && obj.visible && obj.morphTargetDictionary) {
        obj.morphTargetInfluences?.fill(0);
        applyMorph(obj, gender, "Waist", mv(waist, "waist"));
        applyMorph(obj, gender, "Chest", mv(chest, "chest"));
        applyMorph(obj, gender, "Hips", mv(hips, "hips"));
        applyMorph(obj, gender, "Shoulders", mv(shoulders, "shoulders"));
        applyMorph(obj, gender, "Arm", mv(armLength, "arm"));
        applyMorph(obj, gender, "Leg", mv(legLength, "leg"));
      }
    });

  }, [scene, gender, height, waist, chest, hips, shoulders, armLength, legLength]);

  useFrame(() => {
    if (!scene) return;
    scene.traverse(obj => {
      if (!obj.isMesh || !obj.visible) return;
      const nm = obj.name.toLowerCase();
      let ts = 1, te = 0;
      if (focusRegion === "chest girth" && nm.includes("chest")) { ts = 1.08; te = 0.3; }
      if (focusRegion === "waist girth" && nm.includes("waist")) { ts = 1.08; te = 0.3; }
      if (focusRegion === "hip girth" && nm.includes("hip")) { ts = 1.08; te = 0.3; }
      if (focusRegion === "leg span" && (nm.includes("leg") || nm.includes("thigh"))) { ts = 1.08; te = 0.3; }
      obj.scale.set(
        THREE.MathUtils.lerp(obj.scale.x, ts, 0.1),
        THREE.MathUtils.lerp(obj.scale.y, ts, 0.1),
        THREE.MathUtils.lerp(obj.scale.z, ts, 0.1),
      );
      if (obj.material) {
        if (!obj.material._origEmissive)
          obj.material._origEmissive = obj.material.emissive?.clone() || new THREE.Color(0.001, 0.001, 0.001);

        const currentIntensity = obj.material.emissiveIntensity || 0.001;
        obj.material.emissiveIntensity = THREE.MathUtils.lerp(currentIntensity, Math.max(0.001, te), 0.1);

        if (te > 0) obj.material.emissive.set("#ff99aa");
        else if (obj.material.emissiveIntensity < 0.02)
          obj.material.emissive.copy(obj.material._origEmissive);
      }
    });
  });

  return <primitive object={scene} position={[0, 0, 0]} />;
}

/* ─────────────────────────────────────────────
   UI HELPERS
───────────────────────────────────────────── */

const NavIcon = ({ icon: Icon, active, onClick, tooltip }) => (
  <button
    onClick={onClick}
    className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${active
      ? "bg-slate-900 border-slate-900 text-white shadow-xl scale-110"
      : "bg-white/40 border-black/5 text-slate-500 hover:border-black/20 hover:text-slate-900 shadow-sm"
      }`}
  >
    <Icon size={20} />
    <div className="absolute left-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-white/90 backdrop-blur-md border border-black/5 px-4 py-2 rounded-xl shadow-2xl whitespace-nowrap z-50">
      <span className="text-[10px] font-black tracking-widest uppercase text-slate-800">{tooltip}</span>
    </div>
  </button>
);

const ProportionSlider = ({ label, value, unit = "cm", min, max, onChange, onFocus }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-10">
      <div className="flex justify-between items-baseline mb-4">
        <span className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-700">
          {label}
        </span>
        <span className="text-3xl font-black text-slate-900 italic tracking-tighter">
          {value}<small className="text-[12px] ml-1.5 opacity-40 not-italic uppercase font-bold">{unit}</small>
        </span>
      </div>
      <div className="relative h-8 flex items-center">
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          onMouseDown={() => onFocus(label.toLowerCase())}
          onMouseUp={() => onFocus(null)}
          className="absolute w-full h-full z-10 opacity-0 cursor-pointer"
        />
        <div className="w-full h-[3px] bg-black/5 rounded-full overflow-hidden">
          <div className="h-full bg-slate-900 shadow-lg" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   SCENE BRIDGE
───────────────────────────────────────────── */

function SceneBridge({ config, focusRegion, onSceneReady }) {
  const { scene } = useGLTF("/avatar.glb");
  useEffect(() => { if (scene) onSceneReady(scene); }, [scene, onSceneReady]);
  return <AvatarModel config={config} focusRegion={focusRegion} />;
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */

export default function BodyDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("sculpt");
  const [focusRegion, setFocusRegion] = useState(null);
  const [sharedScene, setSharedScene] = useState(null);
  const [webGLSupported] = useState(() => isWebGLAvailable());
  const [canvasError, setCanvasError] = useState(false);

  const initialM = location.state?.measurements || {};
  const [config, setConfig] = useState({
    gender: initialM.gender || "female",
    hair: initialM.hair || "F_hair1",
    height: initialM.height || 170,
    chest: initialM.chest || 96,
    waist: initialM.waist || 72,
    hips: initialM.hips || 100,
    shoulders: initialM.shoulders || 42,
    armLength: initialM.armLength || 58,
    legLength: initialM.legLength || 85,
  });

  const updateConfig = useCallback((key, val) => setConfig(p => ({ ...p, [key]: val })), []);
  const resetAll = useCallback(() => setConfig(p => ({ ...DEFAULTS[p.gender], gender: p.gender, hair: p.hair })), []);
  const handleSceneReady = useCallback(sc => setSharedScene(sc), []);
  const handleSave = useCallback(() => {
    navigate("/building_u", { state: { ...location.state, avatarConfig: config } });
  }, [navigate, location.state, config]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.repeat) {
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const baseGirth = config.waist * 0.4 + config.hips * 0.3 + config.chest * 0.3;
  const girthFactor = baseGirth / 90;
  const approxWeight = Math.round(55 * Math.pow(girthFactor, 2.5) * (config.height / 170));
  const { label: bodyTypeLabel, cls: bodyTypeCls } = weightStatus(approxWeight);

  const show3D = webGLSupported && !canvasError;

  return (
    <div className="relative min-h-screen bg-[#f3f0ee] font-['Didact_Gothic'] text-slate-900 antialiased overflow-x-hidden">

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.75,
        }}
      />

      {/* 3-D CANVAS — fixed in background */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
        {show3D ? (
          <CanvasErrorBoundary
            fallback={<AvatarPlaceholder gender={config.gender} />}
            onError={() => setCanvasError(true)}
          >
            <Canvas
              camera={{ position: [0, 10, 0], fov: 50 }}
              shadows
              dpr={[1, 2]}
              style={{ width: "100%", height: "100%" }}
              gl={DEFAULT_GL_SETTINGS}
              onCreated={({ gl }) => {
                if (!gl) setCanvasError(true);
              }}
            >
              <Suspense fallback={
                <Html center>
                  <div className="text-slate-400 font-bold tracking-widest uppercase animate-pulse">
                    Initializing Studio…
                  </div>
                </Html>
              }>
                <Stage
                  environment="city"
                  intensity={0.6}
                  contactShadow
                  shadows
                  adjustCamera={false}
                >
                  <SceneBridge
                    config={config}
                    focusRegion={focusRegion}
                    onSceneReady={handleSceneReady}
                  />
                </Stage>
              </Suspense>

              <OrbitControls
                makeDefault
                minDistance={25}
                maxDistance={45}
                target={[5.5, -1, 0]}
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </CanvasErrorBoundary>
        ) : (
          <AvatarPlaceholder gender={config.gender} />
        )}
      </div>

      {/* UI OVERLAY */}
      <div className="relative z-10 w-full min-h-screen flex flex-col pointer-events-none">

        {/* TOP HUD */}
        <header className="h-28 flex justify-between items-center px-16 pointer-events-auto">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate("/")}>
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">
              STUDIO<span className="text-slate-400 opacity-50">.</span>BASE
            </h1>
          </div>
        </header>

        {/* MIDDLE */}
        <div className="flex-1 flex justify-between items-center px-16">

          {/* LEFT NAV */}
          <aside className="flex flex-col gap-6 pointer-events-auto">
            <NavIcon icon={User} active={activeTab === "sculpt"} onClick={() => setActiveTab("sculpt")} tooltip="Bone Structure" />
            <NavIcon icon={Activity} active={activeTab === "metrics"} onClick={() => setActiveTab("metrics")} tooltip="Analysis Report" />
            <div className="h-[1px] w-10 bg-black/5 mx-auto my-4" />
            <button
              onClick={resetAll}
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white/40 border border-black/5 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all pointer-events-auto shadow-sm active:scale-90"
            >
              <RotateCcw size={22} />
            </button>
          </aside>

          {/* RIGHT PANEL - Unified Identity and Proportions */}
          <aside className="w-[600px] max-h-[85vh] bg-white/20 backdrop-blur-3xl border border-white/20 rounded-[4rem] p-16 pointer-events-auto overflow-hidden flex flex-col shadow-[0_40px_120px_rgba(0,0,0,0.2)] ring-1 ring-white/30 transition-all duration-700">
            <AnimatePresence mode="wait">

              {activeTab === "sculpt" && (
                <motion.div key="sculpt"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex-1 overflow-y-auto pr-3 custom-scrollbarCinematic"
                >
                  <div className="space-y-16">
                    {/* Part 1: Identity/Gender */}
                    <div>
                      <h2 className="text-[18px] font-black tracking-[0.5em] text-slate-800 mb-8 uppercase">Avatar Identity</h2>
                      <span className="text-[14px] text-slate-500 font-black uppercase tracking-[0.25em] block mb-5 italic opacity-80">
                        Baseline Affinity
                      </span>
                      <div className="grid grid-cols-2 gap-4 p-2 bg-black/5 rounded-[2rem] border border-black/5">
                        {["male", "female"].map(g => (
                          <button
                            key={g}
                            onClick={() => {
                              updateConfig("gender", g);
                              updateConfig("hair", g === "female" ? "F_hair1" : "M_hair1");
                            }}
                            className={`py-5 text-sm font-black rounded-3xl transition-all uppercase tracking-widest ${config.gender === g
                              ? "bg-white text-slate-950 shadow-xl scale-[1.02]"
                              : "text-slate-400 hover:text-slate-900"
                              }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Part 2: Bone Proportions */}
                    <div>
                      <h2 className="text-[18px] font-black tracking-[0.5em] text-slate-800 mb-10 uppercase">Bone Proportions</h2>
                      <ProportionSlider label="Body Height" value={config.height} min={130} max={200} onChange={v => updateConfig("height", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Chest Girth" value={config.chest} min={65} max={140} onChange={v => updateConfig("chest", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Shoulder Span" value={config.shoulders} min={34} max={65} onChange={v => updateConfig("shoulders", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Waist Girth" value={config.waist} min={60} max={120} onChange={v => updateConfig("waist", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Hip Girth" value={config.hips} min={75} max={140} onChange={v => updateConfig("hips", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Arm Span" value={config.armLength} min={15} max={50} onChange={v => updateConfig("armLength", v)} onFocus={setFocusRegion} />
                      <ProportionSlider label="Leg Span" value={config.legLength} min={25} max={80} onChange={v => updateConfig("legLength", v)} onFocus={setFocusRegion} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "metrics" && (
                <motion.div key="metrics"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="flex-1 overflow-y-auto pr-3 custom-scrollbarCinematic text-center py-6"
                >
                  <div className="w-24 h-24 mx-auto rounded-[2.5rem] bg-white border border-black/5 flex items-center justify-center mb-10 shadow-sm">
                    <Activity size={50} className="text-slate-900 opacity-30" />
                  </div>
                  <h2 className="text-2xl font-black tracking-[0.4em] uppercase mb-8 text-slate-900">Entity Report</h2>
                  <p className="text-[18px] text-slate-700 uppercase font-black mb-14 tracking-[0.4em] italic">Integrity: Nominal</p>
                  <div className="grid grid-cols-1 gap-8 text-left">
                    <div className="bg-white/40 p-10 rounded-[2.5rem] border border-black/5 shadow-sm">
                      <span className="text-[18px] font-black text-slate-600 uppercase tracking-widest block mb-4">Calculated Mass</span>
                      <div className="text-4xl font-black text-slate-900 tracking-tighter italic">
                        {approxWeight} <small className="text-lg text-slate-500 uppercase not-italic font-bold ml-2">kg</small>
                      </div>
                    </div>
                    <div className="bg-white/40 p-10 rounded-[2.5rem] border border-black/5 shadow-sm">
                      <span className="text-[18px] font-black text-slate-600 uppercase tracking-widest block mb-4">Physique Score</span>
                      <div className={`text-2xl font-black italic uppercase tracking-tighter ${bodyTypeCls}`}>{bodyTypeLabel}</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            <button
              onClick={handleSave}
              className="mt-10 group relative w-full py-8 bg-slate-900 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] active:scale-[0.98] pointer-events-auto border border-white/10"
            >
              {/* Premium Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              <div className="relative flex items-center justify-center">
                <span className="text-xl font-black uppercase tracking-[0.6em] text-white ml-[0.6em]">
                  Confirm
                </span>
              </div>
            </button>
          </aside>
        </div>

        {/* FOOTER */}
        <div className="pointer-events-auto mt-20">
          <Footer isLightPage={true} />
        </div>
      </div>

      <style>{`
        .custom-scrollbarCinematic::-webkit-scrollbar{width:5px}
        .custom-scrollbarCinematic::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbarCinematic::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.05);border-radius:30px}
        .custom-scrollbarCinematic::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.1)}
        input[type='range']::-webkit-slider-thumb{opacity:0}
      `}</style>
    </div>
  );
}