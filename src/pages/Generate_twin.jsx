// src/pages/GenerateTwin.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

// ✅ IMPORTANT: your backend runs on 8001
const API_BASE = "http://127.0.0.1:8001";

export default function GenerateTwin() {
  const [progress, setProgress] = useState(0);
  const [avatarData, setAvatarData] = useState(null);
  const [apiStatus, setApiStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const uploadedPhotos = useMemo(() => {
    const p = location.state?.photos || { front: null, back: null };
    return p;
  }, [location.state]);

  const getPreview = (photo) => {
    if (!photo) return null;
    if (typeof photo === "string") return photo;
    if (typeof photo === "object" && photo.preview) return photo.preview;
    return null;
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const steps = [
    "Analyzing body measurements...",
    "Reconstructing your digital structure...",
    "Mapping realistic skin and textures...",
    "Estimating posture and proportions...",
    "Generating facial details...",
    "Applying 3D mesh refinements...",
    "Rendering your virtual twin...",
    "Finalizing high-quality output...",
    "Your avatar is ready to view!",
  ];

  // Progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  const calledRef = useRef(false);

  // ✅ Fetch locked JSON contract from backend
  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const fetchAvatarData = async () => {
      setApiStatus("loading");
      setErrorMsg("");

      try {
        // ✅ FIX: use port 8001 (backend runs here)
        const res = await fetch(`${API_BASE}/avatar-data`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // ✅ Locked contract validation
        const hasLockedKeys =
          data &&
          typeof data === "object" &&
          typeof data.gender === "string" &&
          data.proportions &&
          data.proportions.front &&
          typeof data.proportions.has_side_image === "boolean" &&
          data.shape_key_weights &&
          typeof data.shape_key_weights.Chest === "number" &&
          typeof data.shape_key_weights.Waist === "number" &&
          typeof data.shape_key_weights.Hips === "number";

        if (!hasLockedKeys) {
          setApiStatus("error");
          setErrorMsg("Avatar data format is incorrect (not locked contract).");
          return;
        }

        setAvatarData(data);
        setApiStatus("success");
      } catch (err) {
        setApiStatus("error");
        setErrorMsg(
          "Server error. Please start backend and try again.\n\n" +
            (err?.message || "")
        );
      }
    };

    fetchAvatarData();
  }, []);

  // Navigate when done
  useEffect(() => {
    if (progress >= 100 && apiStatus === "success") {
      const timeout = setTimeout(() => {
        navigate("/generated", {
          state: {
            photos: uploadedPhotos,
            avatarData, // ✅ pass locked contract
          },
        });
      }, 600);

      return () => clearTimeout(timeout);
    }
  }, [progress, apiStatus, navigate, uploadedPhotos, avatarData]);

  const currentStepIndex = Math.floor((progress / 100) * steps.length);

  // ✅ Use these for display (since locked contract has no "shape")
  const chestW = avatarData?.shape_key_weights?.Chest ?? 0;
  const waistW = avatarData?.shape_key_weights?.Waist ?? 0;
  const hipsW = avatarData?.shape_key_weights?.Hips ?? 0;

  const bodyHint = (() => {
    // Simple hint text based on weights (optional, UI only)
    const avg = (chestW + waistW + hipsW) / 3;
    if (avg < 0.33) return "Slim";
    if (avg < 0.66) return "Average";
    return "Broad";
  })();

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] overflow-hidden font-['Didact_Gothic',sans-serif]">
      <div className="absolute left-0 top-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="flex flex-col-reverse items-center justify-center gap-16 px-8 pb-24 pt-32 lg:flex-row lg:px-24">
        <Motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          className="flex max-w-lg flex-1 flex-col items-center space-y-6 text-center lg:items-start lg:text-left"
        >
          <div className="flex justify-center gap-4 lg:justify-start">
            {getPreview(uploadedPhotos.front) && (
              <img
                src={getPreview(uploadedPhotos.front)}
                alt="Front"
                className="object-cover w-24 h-32 border border-[#8a7c65]/50 rounded-lg shadow-md"
              />
            )}
            {getPreview(uploadedPhotos.back) && (
              <img
                src={getPreview(uploadedPhotos.back)}
                alt="Back"
                className="object-cover w-24 h-32 border border-[#8a7c65]/50 rounded-lg shadow-md"
              />
            )}
          </div>

          <h1 className="text-5xl font-light leading-tight tracking-tight text-[#1f1f1f]">
            Building Your
            <br />
            <span className="font-medium text-[#8a7c65]">Virtual Avatar</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-gray-600">
            Please wait while your body details are processed to generate your 3D
            avatar. This won’t take long.
          </p>

          <div className="text-sm">
            {apiStatus === "loading" && (
              <span className="text-gray-500">Connecting to AI pipeline...</span>
            )}
            {apiStatus === "success" && (
              <span className="text-green-600">Avatar data ready ✅</span>
            )}
            {apiStatus === "error" && (
              <span className="whitespace-pre-line text-red-500">{errorMsg}</span>
            )}
          </div>

          <div className="relative my-8 h-40 w-40">
            <svg className="h-40 w-40" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e5e5"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#8a7c65"
                strokeWidth="10"
                fill="none"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 45}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-medium text-[#8a7c65]">
              {progress}%
            </div>
          </div>

          <div className="w-full max-w-sm">
            {steps.map((step, idx) => (
              <p
                key={idx}
                className={`text-sm mb-1 transition-all duration-300 ${
                  idx <= currentStepIndex
                    ? "text-[#8a7c65] font-medium"
                    : "text-gray-400"
                }`}
              >
                {step}
              </p>
            ))}
          </div>

          {apiStatus === "error" && (
            <Motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-2 rounded-full bg-[#1f1f1f] text-white text-sm font-medium"
            >
              Retry
            </Motion.button>
          )}

          <Motion.button
            onClick={() =>
              navigate("/upload-photo", { state: { photos: uploadedPhotos } })
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#8a7c65] underline underline-offset-4 hover:text-[#6e604e] transition-all duration-300 font-medium"
          >
            ← Back To Upload Photo
          </Motion.button>
        </Motion.div>

        <Motion.div
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Motion.div
            className="w-72 h-72 bg-[#f8f8f8] border border-[#8a7c65]/50 shadow-lg rounded-2xl flex flex-col items-center justify-center text-[#8a7c65] font-medium text-lg tracking-wide gap-3"
            animate={{ rotateY: [0, 360] }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          >
            <div>3D Avatar Preview</div>

            {/* ✅ Locked contract display */}
            {apiStatus === "success" && (
              <div className="space-y-1 px-6 text-center text-xs font-normal text-gray-500">
                <div>Gender: {avatarData?.gender}</div>
                <div>Body hint: {bodyHint}</div>
                <div>
                  Weights — Chest: {chestW.toFixed(2)} • Waist:{" "}
                  {waistW.toFixed(2)} • Hips: {hipsW.toFixed(2)}
                </div>
              </div>
            )}
          </Motion.div>
        </Motion.div>
      </section>

      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity
        & style.
      </footer>
    </div>
  );
}
