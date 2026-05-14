// src/pages/UploadPhoto.jsx
// ✅ FIXED: Navigates to /generate-twin IMMEDIATELY after clicking submit
//           Backend upload runs in the background — no more stuck on this page
// ✅ Filename prefix detection (FXS, FM, MXL, MXXL) → size + measurements
// ✅ GenerateTwin polls /api/avatar-data until pipeline finishes

import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { auth } from "../firebase";
import CameraCapture from "./CameraCapture";

import heroBg from "../assets/pink.jpg";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8001";

const floatingOrbs = [
  { w: 480, h: 480, top: "-12%", left: "-10%", opacity: 0.18, delay: 0 },
  { w: 340, h: 340, top: "58%", right: "-7%", opacity: 0.13, delay: 1.2 },
  { w: 220, h: 220, top: "38%", left: "44%", opacity: 0.09, delay: 2.1 },
];

// ── Size system ──────────────────────────────────────────────
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZE_INTENSITY = [0.10, 0.25, 0.42, 0.60, 0.78, 1.00];
const SIZE_ADJUSTMENTS = [
  { waist: -0.9, hips: -0.7, chest: -0.6, shoulders: -0.4, arm: -0.25, leg: -0.25 },
  { waist: -0.65, hips: -0.45, chest: -0.35, shoulders: -0.2, arm: -0.15, leg: -0.15 },
  { waist: 0, hips: 0, chest: 0, shoulders: 0, arm: 0, leg: 0 },
  { waist: 0.35, hips: 0.35, chest: 0.25, shoulders: 0.25, arm: 0.15, leg: 0.15 },
  { waist: 0.65, hips: 0.6, chest: 0.5, shoulders: 0.5, arm: 0.3, leg: 0.3 },
  { waist: 0.9, hips: 0.85, chest: 0.75, shoulders: 0.7, arm: 0.45, leg: 0.45 },
];
const SIZE_COLORS = ["#64b4ff", "#5dcaa5", "#aaa", "#f9a825", "#ff7043", "#ffb0c8"];

const SIZE_LABELS = {
  XS: "Extra Small", S: "Small", M: "Medium",
  L: "Large", XL: "Extra Large", XXL: "Double XL",
};

// ── Filename prefix → (gender, size) map ────────────────────
const FILENAME_PREFIX_MAP = {
  fxxl: { gender: "female", sizeLabel: "XXL" },
  fxl: { gender: "female", sizeLabel: "XL" },
  fxs: { gender: "female", sizeLabel: "XS" },
  fl: { gender: "female", sizeLabel: "L" },
  fm: { gender: "female", sizeLabel: "M" },
  fs: { gender: "female", sizeLabel: "S" },
  mxxl: { gender: "male", sizeLabel: "XXL" },
  mxl: { gender: "male", sizeLabel: "XL" },
  mxs: { gender: "male", sizeLabel: "XS" },
  ml: { gender: "male", sizeLabel: "L" },
  mm: { gender: "male", sizeLabel: "M" },
  ms: { gender: "male", sizeLabel: "S" },
};

function parseSizeFromFilename(filename = "") {
  if (!filename) return null;
  const base = filename.replace(/\.[^.]+$/, "").toLowerCase();
  // Match longest prefix first (xxl before xl, xs before x)
  const m = base.match(/^(f|m)(xxl|xl|xs|l|m|s)/);
  if (!m) return null;
  const key = m[1] + m[2];
  const entry = FILENAME_PREFIX_MAP[key];
  if (!entry) return null;
  const idx = SIZE_ORDER.indexOf(entry.sizeLabel);
  if (idx === -1) return null;
  return { gender: entry.gender, sizeLabel: entry.sizeLabel, idx };
}

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

function getAvatarScale(idx) {
  const adj = SIZE_ADJUSTMENTS[idx];
  const intensity = SIZE_INTENSITY[idx];
  return { intensity, adj, color: SIZE_COLORS[idx] };
}

/* ── Main Component ─────────────────────────────────────────── */
export default function UploadPhoto() {
  const navigate = useNavigate();
  const location = useLocation();

  const [photos, setPhotos] = useState(() => ({
    front: location.state?.photos?.front || null,
    sideOrBack: location.state?.photos?.sideOrBack || null,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [detectedSize, setDetectedSize] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [cameraFor, setCameraFor] = useState(null); // "front" or "sideOrBack"

  const isValidImage = (file) =>
    ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type);

  const createPreview = (file) => ({ file, preview: URL.createObjectURL(file) });

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImage(file)) {
      alert("Only JPG, PNG, or WebP images are allowed.");
      return;
    }
    setUploadError(null);
    setPhotos((prev) => {
      if (prev[type]?.preview) URL.revokeObjectURL(prev[type].preview);
      return { ...prev, [type]: createPreview(file) };
    });
  };

  const removePhoto = (type) => {
    if (photos[type]?.preview) URL.revokeObjectURL(photos[type].preview);
    setPhotos((prev) => ({ ...prev, [type]: null }));
  };

  // ── Handle camera capture ───────────────────────────────────
  const handleCameraCapture = (capturedData) => {
    // capturedData = { file: blob, preview: url }
    if (!capturedData?.file) return;
    
    // Create a minimal file-like object from blob for consistency
    const fileObj = {
      file: new File([capturedData.file], `capture-${cameraFor}-${Date.now()}.jpg`, { type: "image/jpeg" }),
      preview: capturedData.preview,
    };
    
    setPhotos((prev) => {
      if (prev[cameraFor]?.preview) URL.revokeObjectURL(prev[cameraFor].preview);
      return { ...prev, [cameraFor]: fileObj };
    });
    setCameraFor(null); // Close camera modal
  };

  // ── Auto-detect size from filename ──────────────────────────
  useEffect(() => {
    let parsed = null;

    if (photos.front?.file?.name) {
      parsed = parseSizeFromFilename(photos.front.file.name);
      if (parsed) {
        console.log(`✅ Size detected: "${photos.front.file.name}" → ${parsed.gender} ${parsed.sizeLabel}`);
      }
    }
    if (!parsed) parsed = parseSizeFromFilename(location.state?.avatarData?.name || "");
    if (!parsed && location.state?.avatarData?.size) {
      const sizeLabel = location.state.avatarData.size;
      const idx = SIZE_ORDER.indexOf(sizeLabel);
      if (idx !== -1) parsed = { gender: location.state.avatarData.gender || "female", sizeLabel, idx };
    }

    setDetectedSize(parsed);
  }, [photos.front, location.state]);

  // ── Submit ──────────────────────────────────────────────────
  // ✅ KEY FIX: Navigate to GenerateTwin IMMEDIATELY.
  // Upload runs in the background. GenerateTwin polls /api/avatar-data.
  const handleSubmit = async () => {
    if (!photos.front) {
      alert("Front photo is required.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in to continue.");
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    // Build measurements from detected size (or null for AI detection)
    const measurements = detectedSize
      ? getMeasurementsFromSize(detectedSize.sizeLabel)
      : null;

    // Merge detected size into avatarData placeholder
    const mergedAvatarData = detectedSize
      ? { size: detectedSize.sizeLabel, gender: detectedSize.gender }
      : null;

    // Save a small fallback state so /generate-twin can recover if opened in a new tab
    localStorage.setItem(
      "shadow_fit_generate_twin_pending",
      JSON.stringify({
        size: detectedSize?.sizeLabel || null,
        measurements,
        avatarData: mergedAvatarData,
        photos: {
          front: photos.front?.preview || null,
          sideOrBack: photos.sideOrBack?.preview || null,
        },
      })
    );

    // ✅ NAVIGATE IMMEDIATELY — don't wait for backend
    navigate("/generate-twin", {
      state: {
        avatarData: mergedAvatarData,
        measurements,
        size: detectedSize?.sizeLabel || null,
        photos: {
          front: photos.front.preview,
          sideOrBack: photos.sideOrBack?.preview || null,
        },
        // Pass upload params so GenerateTwin can trigger the upload
        uploadParams: {
          uid: user.uid,
          hasfront: true,
          hasSide: !!photos.sideOrBack,
        },
      },
    });

    // ✅ Fire upload in background (non-blocking)
    // GenerateTwin will poll /api/avatar-data and wait for it to finish
    try {
      const formData = new FormData();
      formData.append("front", photos.front.file);
      if (photos.sideOrBack) formData.append("side_or_back", photos.sideOrBack.file);
      formData.append("uid", user.uid);

      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Fire and forget — response is ignored here,
      // GenerateTwin handles the result via polling
      fetch(`${API_BASE}/api/upload-photos`, {
        method: "POST",
        headers,
        body: formData,
      }).catch((err) => {
        console.warn("Background upload error (handled by GenerateTwin):", err?.message);
      });
    } catch (err) {
      console.warn("Upload start error:", err);
    }
  };

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      Object.values(photos).forEach((p) => {
        if (p?.preview) URL.revokeObjectURL(p.preview);
      });
    };
  }, []);

  const canSubmit = !!photos.front && !isLoading;

  return (
    <div className="min-h-screen text-[#1f1f1f] font-['Didact_Gothic',sans-serif] relative overflow-hidden bg-[#f3f0ee]">
      {/* BACKGROUND */}
      <Motion.div
        initial={{ scale: 1 }} animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.75,
        }}
      />
      {/* Ambient orbs */}
      {floatingOrbs.map((orb, i) => (
        <Motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: orb.opacity, scale: 1 }}
          transition={{ duration: 2.8, delay: orb.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: orb.w, height: orb.h,
            top: orb.top, left: orb.left, right: orb.right,
            borderRadius: "50%",
            background: "radial-gradient(circle, #c9b99a 0%, #a89070 50%, transparent 80%)",
            filter: "blur(72px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, rgba(138,124,101,0.12) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <section style={{
          maxWidth: "78rem", margin: "0 auto",
          paddingLeft: "1.5rem", paddingRight: "1.5rem",
          paddingTop: "8.5rem", paddingBottom: "7rem",
        }}>
          {/* ── Hero ── */}
          <Motion.div
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{ textAlign: "center", marginBottom: "5rem" }}
          >
            <Motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                marginBottom: "1.8rem", padding: "7px 22px",
                borderRadius: "100px",
                background: "rgba(138,124,101,0.09)",
                border: "1px solid rgba(138,124,101,0.28)",
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#8a7c65", display: "inline-block",
                boxShadow: "0 0 10px rgba(138,124,101,0.7)",
              }} />
              <span style={{ fontSize: "1.1rem", color: "#8a7c65", letterSpacing: "0.1em", fontWeight: 500 }}>
                AI-POWERED AVATAR CREATION
              </span>
            </Motion.div>

            <h1 style={{
              fontSize: "clamp(4rem, 7vw, 6.2rem)",
              fontWeight: 300, lineHeight: 1.08,
              letterSpacing: "-0.025em", marginBottom: "1.5rem", color: "#1a1a1a",
            }}>
              Create Your{" "}
              <span style={{ color: "#8a7c65", fontWeight: 500, position: "relative", display: "inline-block" }}>
                Digital Twin
                <Motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
                  style={{
                    position: "absolute", bottom: -8, left: 0, right: 0,
                    height: 3,
                    background: "linear-gradient(90deg, #8a7c65, #c9b99a, transparent)",
                    borderRadius: 3, transformOrigin: "left",
                  }}
                />
              </span>
            </h1>

            <p style={{ maxWidth: 580, margin: "0 auto", fontSize: "1.4rem", lineHeight: 1.8, color: "#333333" }}>
              Upload 1–2 full-body photos (front required, side/back optional).
              Use a plain background and tight clothing for best results.
            </p>
          </Motion.div>

          {/* ── Grid ── */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

            {/* Preview panel */}
            <Motion.div
              initial={{ opacity: 0, x: -36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="lg:col-span-2"
              style={{
                background: "rgba(255,255,255,0.74)",
                backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(222,218,211,0.85)",
                borderRadius: "2.2rem", padding: "2.8rem",
                boxShadow: "0 4px 6px rgba(0,0,0,0.03), 0 24px 72px rgba(138,124,101,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
                display: "flex", flexDirection: "column",
              }}
            >
              {/* Step bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "2rem" }}>
                {["Upload Photos", "Review", "Generate"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: i === 0 ? "#1f1f1f" : "rgba(138,124,101,0.14)",
                        color: i === 0 ? "#fff" : "#8a7c65",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.82rem", fontWeight: 600, flexShrink: 0,
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: "1.3rem", color: i === 0 ? "#1f1f1f" : "#1f1f1f", fontWeight: i === 0 ? 600 : 500 }}>
                        {step}
                      </span>
                    </div>
                    {i < 2 && <div style={{ flex: 1, height: 1, background: "rgba(138,124,101,0.18)" }} />}
                  </React.Fragment>
                ))}
              </div>

              {/* Drop zone */}
              <div style={{
                flex: 1,
                minHeight: 380,
                border: "2px dashed rgba(207,200,190,0.85)",
                borderRadius: "1.5rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(248,247,244,0.55)",
                position: "relative", overflow: "hidden",
                padding: "2rem",
              }}>
                {/* Corner decorations */}
                {[
                  { top: 14, left: 14, borderTop: "2px solid #c9b99a", borderLeft: "2px solid #c9b99a" },
                  { top: 14, right: 14, borderTop: "2px solid #c9b99a", borderRight: "2px solid #c9b99a" },
                  { bottom: 14, left: 14, borderBottom: "2px solid #c9b99a", borderLeft: "2px solid #c9b99a" },
                  { bottom: 14, right: 14, borderBottom: "2px solid #c9b99a", borderRight: "2px solid #c9b99a" },
                ].map((s, i) => (
                  <div key={i} style={{ position: "absolute", width: 22, height: 22, borderRadius: 2, ...s }} />
                ))}

                {photos.front || photos.sideOrBack ? (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}
                  >
                    {photos.front && (
                      <PreviewCard
                        label="Front (Required)"
                        img={photos.front.preview}
                        onRemove={() => removePhoto("front")}
                        required
                      />
                    )}
                    {photos.sideOrBack && (
                      <PreviewCard
                        label="Side / Back (Optional)"
                        img={photos.sideOrBack.preview}
                        onRemove={() => removePhoto("sideOrBack")}
                      />
                    )}
                  </Motion.div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: "50%",
                      background: "rgba(138,124,101,0.08)",
                      border: "1.5px dashed rgba(138,124,101,0.38)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 1.2rem", fontSize: "2.2rem", color: "#8a7c65",
                    }}>↑</div>
                    <p style={{ fontSize: "1.6rem", color: "#1f1f1f", fontWeight: 500 }}>
                      Upload your photos
                    </p>
                    <p style={{ fontSize: "1.3rem", color: "#333333", marginTop: 8, fontWeight: 500 }}>
                      JPG or PNG · Max 10MB each
                    </p>
                  </div>
                )}
              </div>


            </Motion.div>

            {/* Right column */}
            <Motion.div
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.32 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <UploadBox
                title="Front Photo"
                subtitle="Required"
                onChange={(e) => handleFileChange(e, "front")}
                required
                icon="◎"
                hint="Stand straight, arms at sides"
                onOpenCamera={() => setCameraFor("front")}
              />
              <UploadBox
                title="Side / Back Photo"
                subtitle="Optional"
                onChange={(e) => handleFileChange(e, "sideOrBack")}
                icon="◑"
                hint="Adds depth to your avatar"
                onOpenCamera={() => setCameraFor("sideOrBack")}
              />


              <Motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.65 }}
                style={{
                  background: "rgba(138,124,101,0.06)",
                  border: "1px solid rgba(138,124,101,0.2)",
                  borderRadius: "1.4rem",
                  padding: "1.6rem 1.8rem",
                }}
              >
                <p style={{ fontSize: "1.3rem", fontWeight: 700, color: "#333333", marginBottom: 12, letterSpacing: "0.06em" }}>
                  TIPS FOR BEST RESULTS
                </p>
                {["Plain, solid background", "Fitted or tight clothing", "Good, even lighting", "Full body in frame"].map((tip) => (
                  <div key={tip} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <span style={{ color: "#333333", fontSize: "1rem" }}>✦</span>
                    <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "#333333" }}>{tip}</span>
                  </div>
                ))}
              </Motion.div>
            </Motion.div>
          </div>

          {/* ── CTA ── */}
          <Motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "1.1rem", marginTop: "5.5rem",
            }}
          >
            <Motion.button
              onClick={handleSubmit}
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.04, boxShadow: "0 24px 64px rgba(31,31,31,0.28)" } : {}}
              whileTap={canSubmit ? { scale: 0.97 } : {}}
              style={{
                padding: "1.15rem 4.5rem", borderRadius: "100px",
                background: !canSubmit
                  ? "linear-gradient(135deg, #a89a88 0%, #8a7c65 100%)"
                  : "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
                color: "#fff", fontSize: "1.6rem", fontWeight: 600,
                letterSpacing: "0.03em", border: "none",
                cursor: !canSubmit ? "not-allowed" : "pointer",
                boxShadow: !canSubmit ? "none" : "0 8px 36px rgba(31,31,31,0.22), inset 0 1px 0 rgba(255,255,255,0.09)",
                fontFamily: "inherit", position: "relative", overflow: "hidden",
                opacity: !canSubmit ? 0.7 : 1,
              }}
            >
              {canSubmit && (
                <Motion.span
                  animate={{ x: ["-120%", "220%"] }}
                  transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.13) 50%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              )}
              {isLoading ? "Starting…" : photos.front ? "Create My Avatar →" : "Upload a Photo First"}
            </Motion.button>

            {/* Error message */}
            {uploadError && (
              <p style={{ fontSize: "0.9rem", color: "#e05252", textAlign: "center" }}>
                ⚠️ {uploadError}
              </p>
            )}

            <p style={{ fontSize: "1.3rem", color: "#1f1f1f", fontWeight: 500 }}>
              Your photos are processed securely and never shared
            </p>
          </Motion.div>
        </section>

        <Footer isLightPage={true} />
      </div>

      {/* Camera Capture Modal */}
      {cameraFor && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setCameraFor(null)}
          photoType={cameraFor === "front" ? "front" : "side/back"}
        />
      )}

      <style>{`
        .custom-scrollbarCinematic::-webkit-scrollbar{width:5px}
        .custom-scrollbarCinematic::-webkit-scrollbar-track{background:transparent}
        .custom-scrollbarCinematic::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.05);border-radius:30px}
        .custom-scrollbarCinematic::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.1)}
      `}</style>
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function UploadBox({ title, subtitle, onChange, required, icon, hint, onOpenCamera }) {
  const [hovered, setHovered] = useState(false);
  return (
    <>
      <label
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          cursor: "pointer", display: "block",
          background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
          border: hovered ? "1px solid rgba(138,124,101,0.48)" : "1px solid rgba(222,218,211,0.85)",
          borderRadius: "1.5rem", padding: "2.1rem",
          boxShadow: hovered
            ? "0 16px 48px rgba(138,124,101,0.18), inset 0 1px 0 rgba(255,255,255,0.95)"
            : "0 4px 18px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
          transition: "all 0.28s ease",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: "2.8rem", color: "#8a7c65", marginBottom: "0.8rem", lineHeight: 1,
            transition: "transform 0.22s ease",
            transform: hovered ? "scale(1.15)" : "scale(1)",
          }}>
            {icon || "+"}
          </div>
          <h3 style={{ fontWeight: 600, fontSize: "1.5rem", marginBottom: 5, color: "#1f1f1f" }}>{title}</h3>
          <p style={{ fontSize: "1.25rem", color: required ? "#e05252" : "#1f1f1f", marginBottom: hint ? 9 : 0, fontWeight: required ? 600 : 500 }}>
            {subtitle}
          </p>
          {hint && <p style={{ fontSize: "1.15rem", color: "#333333", fontWeight: 500 }}>{hint}</p>}
        </div>
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={onChange} />
      </label>

      {/* Camera toggle button */}
      {onOpenCamera && (
        <button
          type="button"
          onClick={onOpenCamera}
          style={{
            width: "100%", padding: "1.1rem",
            borderRadius: "1.2rem", 
            border: "1px solid rgba(255,255,255,0.1)",
            background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)", 
            color: "#fff",
            fontSize: "1.15rem", fontWeight: 700, cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            marginTop: "1.2rem",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            letterSpacing: "0.03em",
            textTransform: "uppercase",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.background = "linear-gradient(135deg, #3d3d3d 0%, #242424 100%)";
            e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(138,124,101,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.background = "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
        >
          <span>Use Live Camera</span>
        </button>
      )}
    </>
  );
}

function PreviewCard({ img, label, onRemove, required }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", top: -13, left: 13,
        padding: "5px 15px", fontSize: "0.84rem", fontWeight: 500,
        borderRadius: "100px",
        background: required ? "#e05252" : "rgba(31,31,31,0.78)",
        color: "#fff", backdropFilter: "blur(10px)",
        letterSpacing: "0.02em", zIndex: 2,
        boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
      }}>
        {label}
      </span>
      <img src={img} alt={label} style={{
        height: 420, borderRadius: "1.1rem",
        border: "1px solid rgba(222,218,211,0.65)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.14)", display: "block",
      }} />
      <button type="button" onClick={onRemove} style={{
        position: "absolute", top: 13, right: 13,
        padding: "5px 11px", fontSize: "0.88rem",
        color: "#fff", background: "rgba(0,0,0,0.68)",
        border: "none", borderRadius: "100px", cursor: "pointer",
        backdropFilter: "blur(10px)", zIndex: 2,
      }}>✕</button>
    </div>
  );
}

function AvatarSilhouette({ sizeIdx, gender }) {
  const { adj, intensity, color } = getAvatarScale(sizeIdx);
  const cx = 60;
  const chestW = 52 + adj.chest * 12;
  const waistW = 40 + adj.waist * 10;
  const hipsW = 50 + adj.hips * 11;
  const shoulderW = 56 + adj.shoulders * 10;
  const armW = 10 + adj.arm * 2.5;
  const legW = 14 + adj.leg * 3;
  const legH = 80 + adj.leg * 8;

  const headR = 13, headY = 15 + headR;
  const torsoTop = headY + headR - 2;
  const torsoH = 65 + adj.leg * 3;
  const torsoMid = torsoTop + torsoH * 0.42;
  const torsoBot = torsoTop + torsoH;
  const armTop = torsoTop + 4;
  const armH = 70 + adj.arm * 10;
  const legTop = torsoBot;

  const tx1 = cx - shoulderW / 2, tx2 = cx + shoulderW / 2;
  const wx1 = cx - waistW / 2, wx2 = cx + waistW / 2;
  const hx1 = cx - hipsW / 2, hx2 = cx + hipsW / 2;

  const svgH = 180 + intensity * 60;
  const svgW = 80 + intensity * 30;

  return (
    <svg viewBox="0 0 120 260" width={svgW} height={svgH}
      style={{ transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)", display: "block", margin: "0 auto 1rem" }}>
      <circle cx={cx} cy={headY} r={headR} fill="#d4b896" />
      <rect x={cx - 4} y={headY + headR - 2} width={8} height={11} rx={3} fill="#d4b896" />
      <path
        d={`M${tx1},${torsoTop} Q${cx - chestW / 2},${torsoMid - 8} ${wx1},${torsoMid}
            Q${hx1 - 2},${torsoMid + 12} ${hx1},${torsoBot}
            L${hx2},${torsoBot} Q${hx2 + 2},${torsoMid + 12} ${wx2},${torsoMid}
            Q${cx + chestW / 2},${torsoMid - 8} ${tx2},${torsoTop} Z`}
        fill={color} opacity={0.85}
      />
      <rect x={tx1 - armW - 1} y={armTop} width={armW} height={armH} rx={armW / 2} fill={color} opacity={0.7} />
      <rect x={tx2 + 1} y={armTop} width={armW} height={armH} rx={armW / 2} fill={color} opacity={0.7} />
      <rect x={cx - legW / 2 - 3} y={legTop} width={legW} height={legH} rx={legW / 2} fill="#b0a090" />
      <rect x={cx + 3} y={legTop} width={legW} height={legH} rx={legW / 2} fill="#b0a090" />
    </svg>
  );
}