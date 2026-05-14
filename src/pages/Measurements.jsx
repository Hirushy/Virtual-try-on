// ✅ FIXED: src/pages/Measurements.jsx
// ✅ Size label (from filename prefix FM, FXL, MXXL etc.) received and forwarded
// ✅ Measurements forwarded to Clothing_Cat and heatmap correctly

"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import heroBg from "../assets/pink.jpg";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import AvatarCanvas from "./measurements/AvatarCanvas";

import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8001";

// ── Size label → human readable ─────────────────────────────
const SIZE_LABELS = {
  XS: "Extra Small", S: "Small", M: "Medium",
  L: "Large", XL: "Extra Large", XXL: "Double XL",
};

// ── Standard measurements per size ──────────────────────────
const SIZE_MEASUREMENTS = {
  XS: { chest: 82, waist: 64, hips: 88, shoulders: 34, arm: 50, leg: 70, height: 170 },
  S: { chest: 90, waist: 72, hips: 96, shoulders: 40, arm: 56, leg: 80, height: 170 },
  M: { chest: 98, waist: 80, hips: 104, shoulders: 46, arm: 62, leg: 90, height: 170 },
  L: { chest: 106, waist: 88, hips: 112, shoulders: 52, arm: 68, leg: 100, height: 170 },
  XL: { chest: 114, waist: 96, hips: 120, shoulders: 58, arm: 74, leg: 110, height: 170 },
  XXL: { chest: 122, waist: 104, hips: 128, shoulders: 60, arm: 80, leg: 120, height: 170 },
};

/* ========================= Helpers ========================= */
function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function isLockedContract(data) {
  return (
    data &&
    typeof data === "object" &&
    typeof data.gender === "string" &&
    data.proportions &&
    typeof data.proportions === "object" &&
    data.proportions.front &&
    typeof data.proportions.front === "object" &&
    typeof data.proportions.has_side_image === "boolean" &&
    data.shape_key_weights &&
    typeof data.shape_key_weights === "object" &&
    typeof data.shape_key_weights.Chest === "number" &&
    typeof data.shape_key_weights.Waist === "number" &&
    typeof data.shape_key_weights.Hips === "number"
  );
}

// ✅ Use size label from filename prefix to determine body summary
function getBodySummaryFromSize(sizeLabel) {
  const summaryMap = {
    XS: { bodyType: "Extra Slim", waistDesc: "Very slim waist", hipsDesc: "Very slim hips", chestDesc: "Very slim chest" },
    S: { bodyType: "Slim", waistDesc: "Slim waist", hipsDesc: "Slim hips", chestDesc: "Slim chest" },
    M: { bodyType: "Average", waistDesc: "Average waist", hipsDesc: "Average hips", chestDesc: "Average chest" },
    L: { bodyType: "Broad", waistDesc: "Broad waist", hipsDesc: "Broad hips", chestDesc: "Broad chest" },
    XL: { bodyType: "Full", waistDesc: "Full waist", hipsDesc: "Full hips", chestDesc: "Full chest" },
    XXL: { bodyType: "Plus", waistDesc: "Plus waist", hipsDesc: "Plus hips", chestDesc: "Plus chest" },
  };
  return summaryMap[sizeLabel] || summaryMap["M"];
}

// Legacy helper for when no size label is available
function getBodySummary(size) {
  const getBodyType = (s) => (s === "S" ? "Slim" : s === "S-M" ? "Balanced" : s === "M-L" ? "Broad" : "Heavy");
  const getPart = (s) => (s === "S" ? "Slim" : s === "S-M" ? "Average" : "Broad");
  const type = getBodyType(size);
  const part = getPart(size);
  return {
    bodyType: type,
    waistDesc: `${part} waist`,
    hipsDesc: `${part} hips`,
    chestDesc: `${part} chest`,
  };
}

function detectSize(gender, height, chest, waist, hips, forceSize = null) {
  if (forceSize) return forceSize;
  const nChest = (chest - 70) / (140 - 70);
  const nWaist = (waist - 55) / (130 - 55);
  const nHips = (hips - 70) / (140 - 70);
  const fullness = (nChest + nWaist + nHips) / 3;
  if (fullness < 0.32) return "S";
  if (fullness < 0.45) return "S-M";
  if (fullness < 0.55) return "M-L";
  return "XL";
}

useGLTF.preload("/avatar.glb");

/* ========================= Page ========================= */
export default function Measurements() {
  const navigate = useNavigate();
  const location = useLocation();

  const { token, user } = useAuth();
  const [avatarData, setAvatarData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempTwinName, setTempTwinName] = useState("");

  const passedAvatarData = useMemo(() => location.state?.avatarData || null, [location.state]);
  const avatarConfig = useMemo(() => location.state?.avatarConfig || null, [location.state]);
  const uploadedPhotos = useMemo(() => location.state?.photos || null, [location.state]);

  // ✅ Receive size label from filename detection (passed via Generated.jsx)
  const passedSize = location.state?.size
    || location.state?.avatarData?.size
    || null;

  // ✅ Receive pre-computed measurements
  const passedMeasurements = location.state?.measurements
    || location.state?.bodyMeasurements
    || null;

  // ✅ Resolve the final measurements to use:
  //    Priority: filename-based > passed measurements > avatarConfig
  const resolvedMeasurements = useMemo(() => {
    if (passedSize && SIZE_MEASUREMENTS[passedSize]) {
      return SIZE_MEASUREMENTS[passedSize];
    }
    if (passedMeasurements) return passedMeasurements;
    if (avatarConfig) return { ...avatarConfig, height: avatarConfig.height || 170 };
    return null;
  }, [passedSize, passedMeasurements, avatarConfig]);

  useEffect(() => {
    if (avatarConfig) { setLoading(false); return; }
    if (passedAvatarData) { setAvatarData(passedAvatarData); setLoading(false); return; }

    const fetchAvatarData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/avatar-data`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setAvatarData(isLockedContract(data) ? data : null);
      } catch {
        setAvatarData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAvatarData();
  }, [passedAvatarData, avatarConfig]);

  const gender = (avatarConfig?.gender || avatarData?.gender || "female").toLowerCase();

  // ✅ Body summary: prefer filename-detected size, fallback to AI-detected
  const summary = useMemo(() => {
    if (passedSize && SIZE_MEASUREMENTS[passedSize]) {
      return { ...getBodySummaryFromSize(passedSize), size: passedSize };
    }
    let size = "M-L";
    if (avatarConfig) {
      size = detectSize(gender, avatarConfig.height, avatarConfig.chest, avatarConfig.waist, avatarConfig.hips);
    } else if (avatarData?.size) {
      size = avatarData.size;
    }
    return { ...getBodySummary(size), size };
  }, [passedSize, avatarConfig, avatarData, gender]);

  const canProceed = !!avatarConfig || (!!avatarData && !loading) || !!passedSize;

  /* ── Save to Favorites ── */
  const handleSaveToFavorites = () => {
    setTempTwinName(`Digital Twin ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setShowSaveModal(true);
  };

  const executeSaveTwin = async (finalName) => {
    setSaving(true);
    const newAvatar = {
      name: finalName || `Digital Twin ${new Date().toLocaleTimeString()}`,
      gender,
      config: avatarConfig || null,
      data: avatarData || null,
      summary,
      size: passedSize || summary.size,
      createdAt: serverTimestamp(),
    };

    if (user) {
      try {
        await addDoc(collection(db, "users", user.uid, "favorites"), newAvatar);
        alert("🚀 Saved to your Account Cloud!");
      } catch (err) {
        console.error("Firestore save failed:", err);
        const existing = JSON.parse(localStorage.getItem("shadow_fit_avatars") || "[]");
        localStorage.setItem(
          "shadow_fit_avatars",
          JSON.stringify([...existing, { ...newAvatar, id: Date.now(), createdAt: null }])
        );
        alert("Cloud save failed. Stored locally instead.");
      }
    } else {
      const existing = JSON.parse(localStorage.getItem("shadow_fit_avatars") || "[]");
      localStorage.setItem(
        "shadow_fit_avatars",
        JSON.stringify([
          ...existing,
          { ...newAvatar, id: Date.now(), createdAt: null, date: new Date().toLocaleDateString() },
        ])
      );
      alert("⭐ Saved to Browser Storage (Guest Mode)");
    }
    setSaving(false);
    setShowSaveModal(false);
  };

  // ✅ Navigate to Clothing_Cat — pass ALL size data + measurements
  const handleStartTryOn = () => {
    navigate("/measurements/clothing-cat", {
      state: {
        avatarData,
        avatarConfig,
        photos: uploadedPhotos,
        measurements: resolvedMeasurements,    // ✅ correct measurements
        bodyMeasurements: resolvedMeasurements,    // ✅ legacy key
        size: passedSize || summary.size, // ✅ size label for fit pill
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      <Motion.div
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

      <div className="absolute left-0 top-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-10 px-8 pb-24 pt-32 lg:flex-row lg:gap-20 lg:px-24">

        {/* ── Left column ── */}
        <Motion.div
          className="z-10 flex flex-1 flex-col items-center space-y-6 text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl font-light leading-tight tracking-tighter lg:text-[100px]">
            Choose How You'd Like to{" "}
            <span className="font-bold text-[#8a7c65]">Try On Outfits</span>
          </h1>

          <p className="max-w-xl text-xl text-gray-600/80 font-medium">
            You can browse our <strong>Clothing Catalog</strong>.
          </p>

          {/* ── Avatar summary card ── */}
          <div className="w-full max-w-xl p-10 border border-[#dedad3] rounded-[2.5rem] bg-white/70 shadow-sm">
            {loading ? (
              <p className="text-sm text-gray-500">Loading avatar summary...</p>
            ) : summary ? (
              <>
                <h3 className="text-3xl font-black text-[#8a7c65] mb-8">Digital Twin Summary</h3>

                <ul className="space-y-3 text-xl text-gray-800">
                  <li className="flex justify-between border-b border-black/5 pb-2">Gender: <b className="text-[#8a7c65]">{gender}</b></li>
                  <li className="flex justify-between border-b border-black/5 pb-2">Body type: <b className="text-[#8a7c65]">{summary.bodyType}</b></li>
                  <li className="flex justify-between border-b border-black/5 pb-2">Waist: <b className="text-[#8a7c65]">{summary.waistDesc}</b></li>
                  <li className="flex justify-between border-b border-black/5 pb-2">Hips: <b className="text-[#8a7c65]">{summary.hipsDesc}</b></li>
                  <li className="flex justify-between border-b border-black/5 pb-2">Chest: <b className="text-[#8a7c65]">{summary.chestDesc}</b></li>
                </ul>

                {/* ✅ Show resolved measurements */}
                {resolvedMeasurements && (
                  <div className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      ["Chest", resolvedMeasurements.chest, "cm"],
                      ["Waist", resolvedMeasurements.waist, "cm"],
                      ["Hips", resolvedMeasurements.hips, "cm"],
                    ].map(([label, val, unit]) => (
                      <div key={label} className="bg-[#f8f7f4] p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                        <span className="text-[12px] text-gray-400 uppercase font-bold block mb-1">{label}</span>
                        <span className="text-xl font-black text-[#8a7c65]">{val}{unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {avatarData?.explanation && (
                  <div className="mt-3 p-3 bg-[#8a7c65]/5 border border-[#8a7c65]/10 rounded-xl text-xs text-[#8a7c65] italic">
                    {avatarData.explanation}
                    {avatarData.confidence > 0 && (
                      <span className="block mt-1 font-bold not-italic text-[#8a7c65]">
                        Detection Confidence: {(avatarData.confidence * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-500 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#8a7c65] animate-pulse" />
                  Avatar Architecture Locked.
                </div>

                <div className="border-t border-gray-100 mt-6 pt-6">
                  <h4 className="text-[12px] uppercase tracking-[0.2em] text-[#8a7c65] font-black mb-3">System Status</h4>
                  <p className="text-sm text-gray-500 font-medium">Avatar Basis (XXL) Locked. Real-time morphing active.</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500">Avatar data not found. Please upload photos and generate again.</p>
                <Motion.button
                  onClick={() => navigate("/upload-photo", { state: { photos: uploadedPhotos, avatarConfig } })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-4 px-5 py-2 rounded-full bg-[#1f1f1f] text-white text-sm font-medium"
                >
                  Go to Upload Photo
                </Motion.button>
              </>
            )}
          </div>

          {/* ── Action buttons ── */}
          <div className="flex w-full max-w-lg flex-col gap-5 pt-10">
            {/* ✅ Start Try-On — passes size + measurements */}
            <Motion.button
              onClick={handleStartTryOn}
              className="w-full px-10 py-6 text-2xl font-sans font-black text-white transition rounded-full shadow-2xl bg-[#1f1f1f] hover:bg-black"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canProceed}
            >
              Start Try-On Studio
            </Motion.button>

            <Motion.button
              disabled={!canProceed || saving}
              onClick={handleSaveToFavorites}
              className={`w-full px-10 py-6 text-xl font-sans font-black border-2 transition rounded-full shadow-lg ${saving
                ? "bg-gray-100 text-gray-400 border-gray-200"
                : "text-[#8a7c65] border-[#8a7c65] hover:bg-[#8a7c65]/5"
                }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {saving ? "Saving..." : user ? "Add to favourites" : "Save to Favorites"}
            </Motion.button>

            <Motion.button
              onClick={() =>
                navigate("/generated", {
                  state: {
                    avatarData,
                    avatarConfig,
                    photos: uploadedPhotos,
                    measurements: resolvedMeasurements,
                    size: passedSize || summary.size,
                  },
                })
              }
              className="text-gray-400 text-base hover:text-[#8a7c65] transition-all duration-300 font-black text-center mt-4"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ← Back to Generated
            </Motion.button>
          </div>
        </Motion.div>

        {/* ── Right column — 3D preview ── */}
        <Motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="bg-gray-100/30 border border-gray-200/50 shadow-2xl w-[1000px] h-[1100px] rounded-[4rem] overflow-hidden backdrop-blur-md">
            <div className="absolute z-10 ml-10 mt-10 rounded-full border border-gray-200 bg-white/80 px-6 py-2 text-sm font-black text-gray-600">
              {avatarConfig ? "Avatar (BodyDetails)" : loading ? "Loading..." : "Backend Avatar (AI Detected)"}
            </div>
            <div className="h-full w-full">
              <AvatarCanvas
                avatarConfig={avatarConfig}
                avatarData={avatarData}
                gender={gender}
              />
            </div>
          </div>
        </Motion.div>
      </section>

      <Footer isLightPage={true} />

      {/* ── SAVING MODAL ── */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <Motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8a7c65] rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800">Name Your Twin</h3>
                </div>
                <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#8a7c65] mb-2 block">Twin Name</label>
                  <input autoFocus type="text" value={tempTwinName} onChange={(e) => setTempTwinName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && executeSaveTwin(tempTwinName)}
                    placeholder="e.g. My Profile" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8a7c65]/20 focus:bg-white text-gray-800 font-bold transition-all" />
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={() => setShowSaveModal(false)} className="flex-1 py-4 text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                  <button onClick={() => executeSaveTwin(tempTwinName)} disabled={saving || !tempTwinName.trim()}
                    className="flex-1 py-4 bg-[#8a7c65] text-white rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-[#8a7c65]/30 hover:bg-[#7a6c55] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {saving ? "Saving..." : <><Check size={18} /> Confirm</>}
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}