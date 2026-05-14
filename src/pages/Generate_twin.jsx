import React, { useEffect, useState, useMemo, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircleIcon, Loader2Icon, ScanIcon } from "lucide-react";
import heroBg from "../assets/pink.jpg";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8001";

// Polling settings
const POLL_INTERVAL_MS = 150;
const MAX_POLL_ATTEMPTS = 200;

export default function GenerateTwin() {
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(35);
  const [avatarData, setAvatarData] = useState(null);
  const [apiStatus, setApiStatus] = useState("loading"); // loading | success | error
  const [apiMessage, setApiMessage] = useState("Initializing AI pipeline...");
  const [errorMsg, setErrorMsg] = useState("");
  const [pollCount, setPollCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const didNavigateRef = useRef(false);
  const pageMountedAtRef = useRef(Date.now());
  const [pageReady, setPageReady] = useState(false);

  const pendingState = useMemo(() => {
    if (location.state) return null;
    try {
      return JSON.parse(localStorage.getItem("shadow_fit_generate_twin_pending")) || null;
    } catch {
      return null;
    }
  }, [location.state]);

  const uploadedPhotos = useMemo(
    () => location.state?.photos || pendingState?.photos || { front: null, sideOrBack: null },
    [location.state, pendingState]
  );

  // Size + measurements from filename detection (passed by UploadPhoto)
  const passedSize = location.state?.size || pendingState?.size || null;
  const passedMeasurements = location.state?.measurements || pendingState?.measurements || null;
  const passedAvatarData = location.state?.avatarData || pendingState?.avatarData || null;

  const getPreview = (photo) => {
    if (!photo) return null;
    if (typeof photo === "string") return photo;
    if (typeof photo === "object" && photo.preview) return photo.preview;
    return null;
  };

  // ── Smooth progress animation (drifts towards targetProgress) ────
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        // Dynamic smoothing: move faster if we are far behind target
        const diff = targetProgress - prev;
        const step = diff > 20 ? 2.5 : 0.8;
        const next = prev + step;
        if (next < targetProgress) return Math.min(next, 100);
        // Passive drift when waiting
        return Math.min(prev + 0.02, 99.9);
      });
    }, 50);
    return () => clearInterval(interval);
  }, [targetProgress]);

  // ── Polling logic ─────────────────────────────────────────
  const pollRef = useRef(null);

  function isLockedContract(data) {
    return (
      data &&
      typeof data === "object" &&
      typeof data.gender === "string" &&
      data.proportions &&
      data.proportions.front &&
      typeof data.proportions.has_side_image === "boolean" &&
      data.shape_key_weights &&
      typeof data.shape_key_weights.Chest === "number" &&
      typeof data.shape_key_weights.Waist === "number" &&
      typeof data.shape_key_weights.Hips === "number"
    );
  }

  useEffect(() => {
    pageMountedAtRef.current = Date.now();
    setPageReady(true);
  }, []);

  useEffect(() => {
    let attempts = 0;
    let cancelled = false;

    const navigateToGenerated = (data) => {
      if (didNavigateRef.current) return;
      localStorage.removeItem("shadow_fit_generate_twin_pending");
      const mergedAvatarData = passedSize
        ? { ...data, size: passedSize, gender: passedAvatarData?.gender || data.gender }
        : data;

      const redirect = () => {
        if (didNavigateRef.current) return;
        didNavigateRef.current = true;
        navigate("/generated", {
          state: {
            photos: uploadedPhotos,
            avatarData: mergedAvatarData,
            measurements: passedMeasurements,
            size: passedSize || data?.size,
          },
        });
      };

      setApiMessage("Avatar ready! Redirecting now...");
      setApiStatus("success");
      setTargetProgress(100);
      setProgress(100);

      const minVisibleMs = 1800;
      const elapsed = Date.now() - pageMountedAtRef.current;
      const delayMs = pageReady ? Math.max(minVisibleMs - elapsed, 0) : minVisibleMs;

      setTimeout(redirect, delayMs);
    };

    const poll = async () => {
      if (cancelled) return;
      attempts++;
      setPollCount(attempts);

      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" } : { "Cache-Control": "no-cache" };

        // 1. Check if avatar data is ready first
        const res = await fetch(`${API_BASE}/api/avatar-data`, {
          cache: "no-store",
          headers,
        });

        if (res.ok) {
          const data = await res.json();
          if (isLockedContract(data)) {
            if (!cancelled) {
              setAvatarData(data);
              setApiStatus("success");
              setTargetProgress(100);
              setProgress(100);
              navigateToGenerated(data);
              return; // Stop polling and redirect immediately
            }
          }
        }

        // Fetch the current processing stage of the pipeline
        const statusRes = await fetch(`${API_BASE}/api/pipeline-status`, {
          cache: "no-store",
          headers,
        });

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.stage > 0) {
            setApiMessage(statusData.message || "Processing...");
            const stageProgress = Math.min(95, statusData.stage * 33);
            setTargetProgress(stageProgress);
          }
          if (statusData.stage === -1) {
            throw new Error(statusData.message || "Pipeline error");
          }
        }

        if (attempts < MAX_POLL_ATTEMPTS) {
          pollRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          throw new Error("Pipeline timed out.");
        }
      } catch (err) {
        if (cancelled) return;
        setApiStatus("error");
        setErrorMsg(err?.message || "Generation failed.");
      }
    };

    pollRef.current = setTimeout(poll, 0); // Start immediately

    return () => {
      cancelled = true;
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [navigate, uploadedPhotos, passedMeasurements, passedAvatarData, passedSize]);


  const chestW = avatarData?.shape_key_weights?.Chest ?? 0;
  const waistW = avatarData?.shape_key_weights?.Waist ?? 0;
  const hipsW = avatarData?.shape_key_weights?.Hips ?? 0;

  const bodyHint = (() => {
    const avg = (chestW + waistW + hipsW) / 3;
    if (avg < 0.33) return "Slim";
    if (avg < 0.66) return "Average";
    return "Broad";
  })();

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] overflow-hidden"
      style={{ fontFamily: "'Didact Gothic', sans-serif" }}>

      {/* Background */}
      <Motion.div
        initial={{ scale: 1 }} animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", willChange: "transform", opacity: 0.4 }}
      />

      <div className="absolute left-0 top-0 z-20 w-full"><Navbar /></div>

      <section className="relative z-20 flex flex-col-reverse items-center justify-center gap-24 px-8 pb-20 pt-20 lg:flex-row lg:px-32">

        {/* LEFT: Loading card */}
        <Motion.div variants={fadeUp} initial="initial" animate="animate"
          className="flex flex-1 min-w-0 flex-col items-center space-y-8 text-center lg:items-start lg:text-left">

          {/* Photo previews */}
          <div className="flex justify-center gap-6 lg:justify-start">
            {getPreview(uploadedPhotos.front) && (
              <img src={getPreview(uploadedPhotos.front)} alt="Front"
                className="object-cover w-32 h-40 border border-black/10 rounded-3xl shadow-lg" />
            )}
            {getPreview(uploadedPhotos.sideOrBack) && (
              <img src={getPreview(uploadedPhotos.sideOrBack)} alt="Side"
                className="object-cover w-32 h-40 border border-black/10 rounded-3xl shadow-lg" />
            )}
          </div>


          {/* Loader card */}
          <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[2.5rem] p-14 w-full min-h-[640px] shadow-2xl ring-1 ring-white/40 relative overflow-hidden hover:bg-white/25 transition-all duration-300">
            <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#A07850] rounded-full filter blur-[80px] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <Loader2Icon className="w-12 h-12 text-[#1f1f1f] animate-spin mb-8 opacity-70" />

              {/* Animated step label */}
              <div className="h-12 mb-10 relative w-full flex justify-center">
                <AnimatePresence mode="wait">
                  <Motion.h3
                    key={apiMessage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-2xl font-black text-[#1f1f1f] absolute text-center w-full tracking-tight"
                  >
                    {apiMessage}
                  </Motion.h3>
                </AnimatePresence>
              </div>

              {/* Wireframe visualiser */}
              <div className="w-full bg-white/30 backdrop-blur-sm rounded-2xl border border-white/20 p-8 flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: 220 }}>
                <div className="relative w-20 h-20" style={{ perspective: 1000 }}>
                  <Motion.div className="w-full h-full border-[3px] border-[#1f1f1f] rounded-full absolute opacity-30"
                    animate={{ rotateX: 360, rotateY: 180 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                  <Motion.div className="w-full h-full border-[3px] border-[#1f1f1f] rounded-full absolute opacity-20"
                    animate={{ rotateY: 360, rotateZ: 180 }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
                  <Motion.div className="w-full h-full border-[3px] border-[#1f1f1f] rounded-full absolute opacity-10"
                    animate={{ rotateZ: 360, rotateX: 180 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {progress >= 100
                      ? <CheckCircleIcon className="w-7 h-7 text-[#1f1f1f]" />
                      : <ScanIcon className="w-5 h-5 text-[#1f1f1f] animate-pulse opacity-60" />}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-[3px] w-full bg-black/8 rounded-full overflow-hidden mt-8 max-w-[200px]">
                  <Motion.div className="h-full bg-slate-900 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
                <span className="mt-3 text-sm font-black font-mono text-[#1f1f1f] tracking-widest">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Status */}
              <div className="mt-8 text-sm text-center font-black uppercase tracking-[0.26em]">
                {apiStatus === "loading" && (
                  <span className="text-[#333333]">
                    AI pipeline running… ({pollCount} checks)
                  </span>
                )}
                {apiStatus === "success" && (
                  <span className="text-[#1f1f1f] text-xl font-bold">Avatar data ready ✓</span>
                )}
                {apiStatus === "error" && (
                  <span className="whitespace-pre-line text-red-500 text-base">{errorMsg}</span>
                )}
              </div>
            </div>
          </div>

          {/* Retry */}
          {apiStatus === "error" && (
            <Motion.button onClick={() => navigate("/upload-photo")}
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              className="px-6 py-3 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-full">
              ← Upload Again
            </Motion.button>
          )}

          {/* Back */}
          <button
            onClick={() => navigate("/upload-photo", { state: { photos: uploadedPhotos } })}
            className="text-sm font-black uppercase tracking-widest text-[#1f1f1f] hover:text-[#8a7c65] transition-colors duration-200 flex items-center gap-2 mt-4">
            ← Back to Upload Photo
          </button>
        </Motion.div>

        {/* RIGHT: Avatar preview card */}
        <Motion.div className="flex flex-1 min-w-0 items-center justify-center"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div className="bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[3rem] shadow-2xl ring-1 ring-white/40 w-full h-[34rem] flex flex-col items-center justify-center gap-8 p-14 text-center hover:bg-white/25 transition-all duration-300">
            <Motion.div animate={{ rotateY: [0, 360] }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="text-base font-black uppercase tracking-[0.3em] text-[#1f1f1f]">
              3D Avatar Preview
            </Motion.div>

            {apiStatus === "success" && avatarData ? (
              <div className="space-y-4 text-center w-full">
                <p className="text-sm font-black uppercase tracking-widest text-[#333333]">
                  Gender: <span className="text-xl font-bold text-[#1f1f1f]">{passedAvatarData?.gender || avatarData?.gender}</span>
                </p>
                <p className="text-sm font-black uppercase tracking-widest text-[#333333]">
                  Size: <span className="text-xl font-bold text-[#1f1f1f]">{passedSize || avatarData?.size || "AI"}</span>
                </p>
                <p className="text-sm font-black uppercase tracking-widest text-[#333333]">
                  Body: <span className="text-xl font-bold text-[#1f1f1f]">{bodyHint}</span>
                </p>
                <div className="mt-8 space-y-4">
                  {[["Chest", chestW], ["Waist", waistW], ["Hips", hipsW]].map(([label, val]) => (
                    <div key={label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex justify-between mb-3">
                        <span className="text-sm font-black uppercase tracking-widest text-[#1f1f1f]">{label}</span>
                        <span className="text-sm font-black font-mono text-[#1f1f1f] italic">{val.toFixed(2)}</span>
                      </div>
                      <div className="h-4 w-full bg-black/10 rounded-full overflow-hidden">
                        <Motion.div className="h-full bg-[#1f1f1f] rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${val * 100}%` }}
                          transition={{ duration: 0.9, ease: "easeOut" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-black/10 border-t-[#1f1f1f] rounded-full animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-[#1f1f1f]">
                  Processing…
                </p>
              </div>
            )}
          </div>
        </Motion.div>
      </section>

      <Footer isLightPage={true} />
    </div>
  );
}