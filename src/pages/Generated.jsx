// ✅ FIXED: src/pages/Generated.jsx
// ✅ Size from filename prefix (FM, FXL, MXXL etc.) flows through correctly
// ✅ measurements passed from UploadPhoto → GenerateTwin → here → Measurements → Heatmap

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";

import { convertShapeWeightsToCM } from "../utils/bodyMeasurementConverter";
import AvatarCanvas from "./measurements/AvatarCanvas";

// ── Size label → human readable ─────────────────────────────
const SIZE_LABELS = {
  XS: "Extra Small", S: "Small", M: "Medium",
  L: "Large", XL: "Extra Large", XXL: "Double XL",
};

// ── Standard measurements per size (same table as UploadPhoto) ──
const SIZE_MEASUREMENTS = {
  XS: { chest: 82, waist: 64, hips: 88, shoulders: 34, arm: 50, leg: 70, height: 170 },
  S: { chest: 90, waist: 72, hips: 96, shoulders: 40, arm: 56, leg: 80, height: 170 },
  M: { chest: 98, waist: 80, hips: 104, shoulders: 46, arm: 62, leg: 90, height: 170 },
  L: { chest: 106, waist: 88, hips: 112, shoulders: 52, arm: 68, leg: 100, height: 170 },
  XL: { chest: 114, waist: 96, hips: 120, shoulders: 58, arm: 74, leg: 110, height: 170 },
  XXL: { chest: 122, waist: 104, hips: 128, shoulders: 60, arm: 80, leg: 120, height: 170 },
};

function getMeasurementsFromSize(sizeLabel) {
  return SIZE_MEASUREMENTS[sizeLabel] || SIZE_MEASUREMENTS["M"];
}

/* ========================= MAIN PAGE ========================= */
export default function Generated() {
  const navigate = useNavigate();
  const location = useLocation();

  const avatarData = useMemo(() => location.state?.avatarData || null, [location.state]);
  const avatarConfig = useMemo(() => location.state?.avatarConfig || null, [location.state]);
  const UploadedPhotos = useMemo(() => location.state?.photos || { front: null, back: null }, [location.state]);

  // ✅ Size passed from UploadPhoto via GenerateTwin (filename prefix detection)
  const passedSize = location.state?.size || avatarData?.size || null;

  const [viewMode, setViewMode] = useState("Textured");
  const [measurements, setMeasurements] = useState(null);

  // ── Measurement resolution priority ────────────────────────
  // 1. Direct measurements from UploadPhoto (filename prefix → SIZE_MEASUREMENTS)
  // 2. avatarData.metrics
  // 3. shape_key_weights conversion
  // 4. avatarConfig fallback
  useEffect(() => {
    // Priority 1: measurements already computed from filename size
    if (location.state?.measurements) {
      setMeasurements(location.state.measurements);
      return;
    }

    // Priority 2: size label present — derive measurements from it
    if (passedSize && SIZE_MEASUREMENTS[passedSize]) {
      setMeasurements(getMeasurementsFromSize(passedSize));
      return;
    }

    // Priority 3: avatarData.metrics
    if (avatarData?.metrics) {
      setMeasurements(avatarData.metrics);
      return;
    }

    // Priority 4: shape_key_weights → CM conversion
    if (avatarData?.shape_key_weights) {
      const bodyMeasurements = convertShapeWeightsToCM(avatarData.shape_key_weights);
      setMeasurements(bodyMeasurements);
      return;
    }

    // Priority 5: avatarConfig (manual body-details flow)
    if (avatarConfig) {
      setMeasurements({
        ...avatarConfig,
        height: avatarConfig.height || 170,
        gender: avatarConfig.gender || "female",
      });
    }
  }, [avatarData, avatarConfig, passedSize, location.state]);

  const handleProceed = () => {
    navigate("/measurements", {
      state: {
        photos: UploadedPhotos,
        avatarData,
        avatarConfig,
        measurements,            // ✅ correct measurements for heatmap
        bodyMeasurements: measurements, // ✅ legacy support
        size: passedSize,   // ✅ size label flows to Measurements + Clothing_Cat
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

      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="flex flex-col items-center justify-center min-h-screen gap-10 px-8 pt-24 pb-24 lg:flex-row lg:gap-20 lg:px-24">

        {/* ── Left column ── */}
        <Motion.div
          className="z-10 flex flex-col items-center flex-1 space-y-10 text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-7xl font-light leading-tight tracking-tighter lg:text-[100px]">
            Your <span className="font-bold text-[#8a7c65]">Generated Avatar</span>
          </h1>
          <p className="max-w-2xl text-2xl text-gray-600/90 font-medium leading-relaxed">
            Analysis complete. We've calibrated your 3D twin with shape-similar estimation for the Fit Analyzer.
          </p>

          {/* ── Result card ── */}
          {avatarData && (
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2rem] p-8 shadow-[0_32px_90px_rgba(31,31,31,0.12)] relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 p-3 bg-white/10 border border-white/20 rounded-3xl text-[#8a7c65] text-xs font-bold uppercase tracking-[0.25em]">
                Verified Result
              </div>

              <h2 className="text-4xl lg:text-5xl font-black text-[#1f1f1f] mb-6">
                Digital Twin Analysis
              </h2>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-white/15 p-6 rounded-3xl border border-white/15 shadow-sm">
                  <span className="text-sm text-gray-400 uppercase font-black tracking-[0.24em] block mb-3">Gender</span>
                  <span className="text-3xl lg:text-4xl font-black text-[#8a7c65] leading-tight">
                    {avatarData.gender === "female" ? "♀ Female" : "♂ Male"}
                  </span>
                </div>
              </div>

              {measurements && passedSize && (
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {[
                    ["Chest", measurements.chest, "cm"],
                    ["Waist", measurements.waist, "cm"],
                    ["Hips", measurements.hips, "cm"],
                  ].map(([label, val, unit]) => (
                    <div key={label} className="bg-white/15 p-5 rounded-3xl border border-white/15 text-center shadow-sm">
                      <span className="text-sm text-gray-400 uppercase font-black tracking-[0.22em] block mb-3">{label}</span>
                      <span className="text-2xl font-black text-[#1f1f1f]">{val}{unit}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <span className="text-sm text-gray-400 uppercase font-bold tracking-[0.22em] block mb-3">AI Confidence</span>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-white/15 overflow-hidden">
                      <Motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(avatarData.confidence_score || 0.6) * 100}%` }}
                        className="h-full bg-gradient-to-r from-[#8a7c65] to-[#c9b99a]"
                      />
                    </div>
                    <span className="text-lg font-black text-[#8a7c65]">
                      {((avatarData.confidence_score || 0.6) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400 italic">
                  Hybrid-AI Sizing Engine v4.0
                </div>
              </div>
            </Motion.div>
          )}

          {/* View mode toggles */}
          <div className="flex gap-4 pt-6">
            {["Mesh", "Textured"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-8 py-3 rounded-full border text-lg font-black transition-all duration-300 ${viewMode === mode
                  ? "bg-[#1a1a19] text-white border-[#8a7c65] shadow-xl scale-105"
                  : "border-gray-200 text-gray-400 hover:bg-gray-100"
                  }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col w-full max-w-lg gap-4 pt-10">
            <Motion.button
              onClick={handleProceed}
              className="w-full px-10 py-6 text-xl font-serif font-black text-black transition rounded-full shadow-2xl bg-gradient-to-r from-[#8a7c65] to-[#c0b69a] hover:shadow-[0_20px_50px_rgba(138,124,101,0.4)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Proceed to Try-On
            </Motion.button>

            <Motion.button
              onClick={() => navigate("/body-details", {
                state: {
                  ...location.state,
                  avatarData,
                  avatarConfig,
                  measurements,
                  size: passedSize
                }
              })}
              className="w-full px-10 py-5 text-lg text-gray-700 font-bold transition border border-gray-400 rounded-full hover:bg-gray-100 shadow-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Adjust Body Proportions
            </Motion.button>

            <Motion.button
              onClick={() => navigate("/upload-photo", { state: { photos: UploadedPhotos } })}
              className="w-full px-10 py-5 text-lg text-gray-700 font-bold transition border border-gray-400 rounded-full hover:bg-gray-100 shadow-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Upload New Photo
            </Motion.button>
          </div>
        </Motion.div>

        {/* ── Right column — 3D avatar ── */}
        <Motion.div
          className="relative flex items-center justify-center flex-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="bg-gray-100/30 border border-gray-200/50 shadow-2xl w-[800px] h-[900px] rounded-[48px] overflow-hidden backdrop-blur-md">
            <AvatarCanvas
              avatarData={avatarData}
              avatarConfig={avatarConfig}
              viewMode={viewMode}
            />
          </div>
        </Motion.div>
      </section>

      <Footer isLightPage={true} />
    </div>
  );
}