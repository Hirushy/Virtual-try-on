// src/pages/UploadPhoto.jsx
import React, { useState, useEffect } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8001";

const floatingOrbs = [
  { w: 480, h: 480, top: "-12%", left: "-10%", opacity: 0.18, delay: 0 },
  { w: 340, h: 340, top: "58%", right: "-7%", opacity: 0.13, delay: 1.2 },
  { w: 220, h: 220, top: "38%", left: "44%", opacity: 0.09, delay: 2.1 },
];

export default function UploadPhoto() {
  const navigate = useNavigate();
  const location = useLocation();

  const [photos, setPhotos] = useState(() => ({
    front: location.state?.photos?.front || null,
    sideOrBack: location.state?.photos?.sideOrBack || null,
  }));

  const isValidImage = (file) =>
    ["image/jpeg", "image/png", "image/jpg"].includes(file.type);

  const createPreview = (file) => ({
    file,
    preview: URL.createObjectURL(file),
  });

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImage(file)) {
      alert("Only JPG and PNG images are allowed.");
      return;
    }
    setPhotos((prev) => {
      if (prev[type]?.preview) URL.revokeObjectURL(prev[type].preview);
      return { ...prev, [type]: createPreview(file) };
    });
  };

  const removePhoto = (type) => {
    if (photos[type]?.preview) URL.revokeObjectURL(photos[type].preview);
    setPhotos((prev) => ({ ...prev, [type]: null }));
  };

  const handleSubmit = async () => {
    if (!photos.front) {
      alert("Front photo is required.");
      return;
    }
    const formData = new FormData();
    formData.append("front", photos.front.file);
    if (photos.sideOrBack) {
      formData.append("side_or_back", photos.sideOrBack.file);
    }
    try {
      const res = await fetch(`${API_BASE}/upload-photos`, {
        method: "POST",
        body: formData,
      });
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Upload failed (HTTP ${res.status})`);
      }
      if (!res.ok || data?.status === "error") {
        alert(data?.details || data?.message || "Upload failed.");
        return;
      }
      navigate("/generate-twin", {
        state: {
          photos: {
            front: photos.front.preview,
            sideOrBack: photos.sideOrBack?.preview || null,
          },
        },
      });
    } catch (err) {
      alert(
        "Upload failed. Backend not reachable or network error.\n\n" +
          (err?.message || "")
      );
    }
  };

  useEffect(() => {
    return () => {
      Object.values(photos).forEach((p) => {
        if (p?.preview) URL.revokeObjectURL(p.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen text-[#1f1f1f] font-['Didact_Gothic',sans-serif] relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 18% 22%, #f5f0e8 0%, #faf9f6 40%, #f0ede6 70%, #e8e2d8 100%)",
      }}
    >
      {/* Ambient orbs */}
      {floatingOrbs.map((orb, i) => (
        <Motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: orb.opacity, scale: 1 }}
          transition={{ duration: 2.8, delay: orb.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            right: orb.right,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #c9b99a 0%, #a89070 50%, transparent 80%)",
            filter: "blur(72px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      ))}

      {/* Subtle dot grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(138,124,101,0.12) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        <section
          style={{
            maxWidth: "78rem",
            margin: "0 auto",
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
            paddingTop: "8.5rem",
            paddingBottom: "7rem",
          }}
        >
          {/* ── Hero ── */}
          <Motion.div
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            style={{ textAlign: "center", marginBottom: "5rem" }}
          >
            {/* Eyebrow pill */}
            <Motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: "1.8rem",
                padding: "7px 22px",
                borderRadius: "100px",
                background: "rgba(138,124,101,0.09)",
                border: "1px solid rgba(138,124,101,0.28)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#8a7c65",
                  display: "inline-block",
                  boxShadow: "0 0 10px rgba(138,124,101,0.7)",
                }}
              />
              <span
                style={{
                  fontSize: "0.92rem",
                  color: "#8a7c65",
                  letterSpacing: "0.1em",
                  fontWeight: 500,
                }}
              >
                AI-POWERED AVATAR CREATION
              </span>
            </Motion.div>

            <h1
              style={{
                fontSize: "clamp(3.4rem, 6.5vw, 5.6rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                marginBottom: "1.5rem",
                color: "#1a1a1a",
              }}
            >
              Create Your{" "}
              <span
                style={{
                  color: "#8a7c65",
                  fontWeight: 500,
                  position: "relative",
                  display: "inline-block",
                }}
              >
                Digital Twin
                <Motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      "linear-gradient(90deg, #8a7c65, #c9b99a, transparent)",
                    borderRadius: 3,
                    transformOrigin: "left",
                  }}
                />
              </span>
            </h1>

            <p
              style={{
                maxWidth: 580,
                margin: "0 auto",
                fontSize: "1.22rem",
                lineHeight: 1.8,
                color: "#6b6458",
              }}
            >
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
                backdropFilter: "blur(28px)",
                WebkitBackdropFilter: "blur(28px)",
                border: "1px solid rgba(222,218,211,0.85)",
                borderRadius: "2.2rem",
                padding: "2.8rem",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.03), 0 24px 72px rgba(138,124,101,0.12), inset 0 1px 0 rgba(255,255,255,0.95)",
              }}
            >
              {/* Step bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: "2rem",
                }}
              >
                {["Upload Photos", "Review", "Generate"].map((step, i) => (
                  <React.Fragment key={step}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: "50%",
                          background:
                            i === 0 ? "#1f1f1f" : "rgba(138,124,101,0.14)",
                          color: i === 0 ? "#fff" : "#8a7c65",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <span
                        style={{
                          fontSize: "0.95rem",
                          color: i === 0 ? "#1f1f1f" : "#a89a88",
                          fontWeight: i === 0 ? 500 : 400,
                        }}
                      >
                        {step}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: 1,
                          background: "rgba(138,124,101,0.18)",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Drop zone */}
              <div
                style={{
                  height: 440,
                  border: "2px dashed rgba(207,200,190,0.85)",
                  borderRadius: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(248,247,244,0.55)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Corner decorations */}
                {[
                  {
                    top: 14,
                    left: 14,
                    borderTop: "2px solid #c9b99a",
                    borderLeft: "2px solid #c9b99a",
                  },
                  {
                    top: 14,
                    right: 14,
                    borderTop: "2px solid #c9b99a",
                    borderRight: "2px solid #c9b99a",
                  },
                  {
                    bottom: 14,
                    left: 14,
                    borderBottom: "2px solid #c9b99a",
                    borderLeft: "2px solid #c9b99a",
                  },
                  {
                    bottom: 14,
                    right: 14,
                    borderBottom: "2px solid #c9b99a",
                    borderRight: "2px solid #c9b99a",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      width: 22,
                      height: 22,
                      borderRadius: 2,
                      ...s,
                    }}
                  />
                ))}

                {photos.front || photos.sideOrBack ? (
                  <Motion.div
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: "flex", gap: "2rem" }}
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
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background: "rgba(138,124,101,0.08)",
                        border: "1.5px dashed rgba(138,124,101,0.38)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.2rem",
                        fontSize: "2.2rem",
                        color: "#8a7c65",
                      }}
                    >
                      ↑
                    </div>
                    <p
                      style={{
                        fontSize: "1.22rem",
                        color: "#9a9088",
                        fontWeight: 400,
                      }}
                    >
                      Upload your photos
                    </p>
                    <p
                      style={{
                        fontSize: "0.92rem",
                        color: "#b5aea6",
                        marginTop: 8,
                      }}
                    >
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
              />
              <UploadBox
                title="Side / Back Photo"
                subtitle="Optional"
                onChange={(e) => handleFileChange(e, "sideOrBack")}
                icon="◑"
                hint="Adds depth to your avatar"
              />

              {/* Tips card */}
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
                <p
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#8a7c65",
                    marginBottom: 12,
                    letterSpacing: "0.06em",
                  }}
                >
                  TIPS FOR BEST RESULTS
                </p>
                {[
                  "Plain, solid background",
                  "Fitted or tight clothing",
                  "Good, even lighting",
                  "Full body in frame",
                ].map((tip) => (
                  <div
                    key={tip}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 9,
                    }}
                  >
                    <span style={{ color: "#8a7c65", fontSize: "0.72rem" }}>
                      ✦
                    </span>
                    <span style={{ fontSize: "0.95rem", color: "#6b6458" }}>
                      {tip}
                    </span>
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.1rem",
              marginTop: "5.5rem",
            }}
          >
            <Motion.button
              onClick={handleSubmit}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 24px 64px rgba(31,31,31,0.28)",
              }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: "1.15rem 4.5rem",
                borderRadius: "100px",
                background: "linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%)",
                color: "#fff",
                fontSize: "1.22rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 36px rgba(31,31,31,0.22), inset 0 1px 0 rgba(255,255,255,0.09)",
                fontFamily: "inherit",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer sweep */}
              <Motion.span
                animate={{ x: ["-120%", "220%"] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: "easeInOut",
                }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.13) 50%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              Create My Avatar
            </Motion.button>

            <p style={{ fontSize: "0.9rem", color: "#a89a88" }}>
              Your photos are processed securely and never shared
            </p>
          </Motion.div>
        </section>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function UploadBox({ title, subtitle, onChange, required, icon, hint }) {
  const [hovered, setHovered] = useState(false);

  return (
    <label
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        display: "block",
        background: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: hovered
          ? "1px solid rgba(138,124,101,0.48)"
          : "1px solid rgba(222,218,211,0.85)",
        borderRadius: "1.5rem",
        padding: "2.1rem",
        boxShadow: hovered
          ? "0 16px 48px rgba(138,124,101,0.18), inset 0 1px 0 rgba(255,255,255,0.95)"
          : "0 4px 18px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
        transition: "all 0.28s ease",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "2.8rem",
            color: "#8a7c65",
            marginBottom: "0.8rem",
            lineHeight: 1,
            transition: "transform 0.22s ease",
            transform: hovered ? "scale(1.15)" : "scale(1)",
          }}
        >
          {icon || "+"}
        </div>
        <h3
          style={{
            fontWeight: 500,
            fontSize: "1.18rem",
            marginBottom: 5,
            color: "#1f1f1f",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.95rem",
            color: required ? "#e05252" : "#9a9088",
            marginBottom: hint ? 9 : 0,
            fontWeight: required ? 500 : 400,
          }}
        >
          {subtitle}
        </p>
        {hint && (
          <p style={{ fontSize: "0.84rem", color: "#b5aea6" }}>{hint}</p>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
    </label>
  );
}

function PreviewCard({ img, label, onRemove, required }) {
  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          top: -13,
          left: 13,
          padding: "5px 15px",
          fontSize: "0.84rem",
          fontWeight: 500,
          borderRadius: "100px",
          background: required ? "#e05252" : "rgba(31,31,31,0.78)",
          color: "#fff",
          backdropFilter: "blur(10px)",
          letterSpacing: "0.02em",
          zIndex: 2,
          boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
        }}
      >
        {label}
      </span>
      <img
        src={img}
        alt={label}
        style={{
          height: 296,
          borderRadius: "1.1rem",
          border: "1px solid rgba(222,218,211,0.65)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.14)",
          display: "block",
        }}
      />
      <button
        type="button"
        onClick={onRemove}
        style={{
          position: "absolute",
          top: 13,
          right: 13,
          padding: "5px 11px",
          fontSize: "0.88rem",
          color: "#fff",
          background: "rgba(0,0,0,0.68)",
          border: "none",
          borderRadius: "100px",
          cursor: "pointer",
          backdropFilter: "blur(10px)",
          zIndex: 2,
        }}
      >
        ✕
      </button>
    </div>
  );
}