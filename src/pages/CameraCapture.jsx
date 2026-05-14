// src/pages/CameraCapture.jsx
// ✅ UPGRADED: AI-Guided Camera Capture
// Uses MediaPipe Pose for real-time body alignment, face detection, and lighting checks
// Ensures high-quality photos for better gender and body estimation.

import React, { useRef, useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Camera, X, Check, Loader2, Info, AlertTriangle } from "lucide-react";
import { Pose } from "@mediapipe/pose";
import * as cam from "@mediapipe/camera_utils";

export default function CameraCapture({ onCapture, onClose, photoType = "front" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const poseRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(false);
  const [isAIReady, setIsAIReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  
  // Alignment States
  const [guidance, setGuidance] = useState("Initializing AI Assistant...");
  const [isAligned, setIsAligned] = useState(false);
  const [lightingQuality, setLightingQuality] = useState("checking");
  const [alignmentDetails, setAlignmentDetails] = useState({
    faceDetected: false,
    shouldersLevel: false,
    hipsLevel: false,
    fullBodyVisible: false,
    centered: false
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  // 1. Initialize MediaPipe Pose
  useEffect(() => {
    let isMounted = true;

    const initPose = async () => {
      // Add a timeout for AI loading
      const timeoutId = setTimeout(() => {
        if (!isAIReady && isMounted) {
          setCameraError("AI Assistant is taking too long to load. Please check your connection or refresh.");
        }
      }, 10000);

      try {
        console.log("🤖 [CameraCapture] Initializing MediaPipe Pose...");
        const pose = new Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          },
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results) => {
          if (isMounted) onResults(results);
        });

        poseRef.current = pose;
        clearTimeout(timeoutId);
        setIsAIReady(true);
        console.log("✅ [CameraCapture] AI Assistant Ready");
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("❌ [CameraCapture] AI Init Error:", err);
        setCameraError("Failed to load AI models. Please check your connection.");
      }
    };

    initPose();

    return () => {
      isMounted = false;
      if (poseRef.current) poseRef.current.close();
    };
  }, []);

  const cameraRef = useRef(null);

  // 2. Initialize Camera & Link to Pose
  useEffect(() => {
    if (!isAIReady) return;

    let isMounted = true;

    const startCamera = async () => {
      try {
        if (!videoRef.current) return;

        // Stop any existing camera before starting
        if (cameraRef.current) {
          try {
            cameraRef.current.stop();
          } catch (e) {
            console.warn("Error stopping previous camera:", e);
          }
        }

        console.log("🎥 [CameraCapture] Starting camera with standard constraints...");
        const camera = new cam.Camera(videoRef.current, {
          onFrame: async () => {
            if (poseRef.current && videoRef.current) {
              try {
                await poseRef.current.send({ image: videoRef.current });
              } catch (e) {
                console.warn("AI Frame processing error:", e);
              }
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        
        if (videoRef.current) {
          if (videoRef.current.videoWidth > 0) {
            if (isMounted) setHasCamera(true);
          } else {
            videoRef.current.onloadedmetadata = () => {
              if (isMounted) setHasCamera(true);
            };
          }
        }
        
        console.log("✅ [CameraCapture] Camera Started Successfully");
      } catch (err) {
        console.error("❌ [CameraCapture] Camera Error:", err);
        if (isMounted) {
          if (err.name === 'NotReadableError' || err.message?.includes('in use')) {
            setCameraError("Camera is being used by another application or tab. Please close other tabs and try again.");
          } else {
            setCameraError("Camera failed to start. Please check permissions and connection.");
          }
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (cameraRef.current) {
        console.log("🎥 [CameraCapture] Stopping camera...");
        try {
          cameraRef.current.stop();
          cameraRef.current = null;
        } catch (e) {
          console.warn("Error during camera cleanup:", e);
        }
      }
    };
  }, [isAIReady]);

  // 3. Process Pose Results for Guidance
  const onResults = (results) => {
    if (!results.poseLandmarks) {
      setGuidance("Looking for a person...");
      setIsAligned(false);
      setAlignmentDetails(prev => ({ ...prev, faceDetected: false }));
      return;
    }

    const landmarks = results.poseLandmarks;
    
    // Key Landmarks indices:
    // 0: Nose, 11: L Shoulder, 12: R Shoulder, 23: L Hip, 24: R Hip, 25: L Knee, 26: R Knee
    const nose = landmarks[0];
    const lShoulder = landmarks[11];
    const rShoulder = landmarks[12];
    const lHip = landmarks[23];
    const rHip = landmarks[24];
    const lKnee = landmarks[25];
    const rKnee = landmarks[26];

    // --- Checks ---
    const faceDetected = nose && nose.visibility > 0.5; // Loosened from 0.8
    
    // Shoulders level (allow 15% difference in Y) - Loosened from 0.05
    const shoulderDiff = Math.abs(lShoulder.y - rShoulder.y);
    const shouldersLevel = shoulderDiff < 0.15;

    // Hips level (allow 15% difference in Y) - Loosened from 0.05
    const hipDiff = Math.abs(lHip.y - rHip.y);
    const hipsLevel = hipDiff < 0.15;

    // Full body visibility (knees or hips should be visible)
    const fullBodyVisible = (lKnee && lKnee.visibility > 0.4) || (lHip && lHip.visibility > 0.4);

    // Centered in frame (Mid-shoulder X between 0.2 and 0.8) - Loosened from 0.35/0.65
    const midShoulderX = (lShoulder.x + rShoulder.x) / 2;
    const centered = midShoulderX > 0.2 && midShoulderX < 0.8;

    // --- Lighting Check (Simplified) ---
    const avgVisibility = landmarks.reduce((acc, lm) => acc + lm.visibility, 0) / landmarks.length;
    const currentLighting = avgVisibility > 0.4 ? "good" : "poor"; // Loosened from 0.6
    setLightingQuality(currentLighting);

    const newDetails = { faceDetected, shouldersLevel, hipsLevel, fullBodyVisible, centered };
    setAlignmentDetails(newDetails);

    // --- Determine Guidance Message ---
    let msg = "Perfect! Ready to capture";
    let aligned = true;

    if (!faceDetected) {
      msg = "Face the camera clearly";
      aligned = false;
    } else if (!centered) {
      msg = midShoulderX < 0.2 ? "Move to your right" : "Move to your left";
      aligned = false;
    } else if (!shouldersLevel) {
      msg = "Stand straight, shoulders level";
      aligned = false;
    } else if (!fullBodyVisible) {
      msg = "Move back to show your body";
      aligned = false;
    } else if (currentLighting === "poor") {
      msg = "Need more light in the room";
      aligned = false;
    }

    setGuidance(msg);
    setIsAligned(aligned);
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (videoRef.current.videoWidth === 0) return; // Video not ready

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the current frame
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Flip horizontally for selfie look
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedPhoto({ blob, preview: url });
      }
      setIsCapturing(false);
    }, "image/jpeg", 0.95);
  };

  const handleConfirm = () => {
    if (capturedPhoto?.blob) {
      onCapture({ file: capturedPhoto.blob, preview: capturedPhoto.preview });
    }
  };

  const handleRetake = () => {
    if (capturedPhoto?.preview) URL.revokeObjectURL(capturedPhoto.preview);
    setCapturedPhoto(null);
  };

  if (cameraError) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
        <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={24} className="text-red-600" />
          </div>
          <h3 className="text-2xl font-black mb-2 text-gray-800">Setup Failed</h3>
          <p className="text-gray-600 mb-6">{cameraError}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => window.location.reload()}
              className="w-full px-6 py-4 bg-[#8a7c65] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-[#a89a88] transition">
              Refresh Page
            </button>
            <button onClick={onClose}
              className="w-full px-6 py-4 bg-gray-100 text-gray-800 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition">
              Close
            </button>
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden text-[#1a1a1a]" style={{ fontFamily: "inherit" }}>
      
      {/* ── Main Viewport ── */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        <video 
          ref={videoRef} 
          playsInline 
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-700 ${hasCamera ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Loading / AI Startup */}
        <AnimatePresence>
          {(!hasCamera || !isAIReady) && !capturedPhoto && (
            <Motion.div 
              key="loader"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center text-white"
            >
              <Motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-4"
              >
                <Loader2 size={48} className="text-[#8a7c65]" />
              </Motion.div>
              <p className="text-lg font-black uppercase tracking-widest animate-pulse">
                {!isAIReady ? "Loading AI Assistant..." : "Starting Camera..."}
              </p>
            </Motion.div>
          )}
        </AnimatePresence>

        {/* ── AI Guidance Overlay ── */}
        {hasCamera && isAIReady && !capturedPhoto && (
          <div className="absolute inset-0 z-20 flex flex-col items-center pointer-events-none p-6">
            
            {/* Top Status */}
            <Motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
              <div className="flex items-center gap-2 mb-2 px-4 py-1 bg-black/30 backdrop-blur-md rounded-full border border-white/10 mx-auto w-fit">
                <Info size={14} className="text-[#8a7c65]" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">AI Pose Assistant Active</span>
              </div>
              
              <Motion.div 
                animate={{ scale: isAligned ? [1, 1.05, 1] : 1 }}
                className={`px-8 py-3 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
                  isAligned 
                    ? "bg-green-500/20 border-green-500/50 text-green-400" 
                    : "bg-white/10 border-white/20 text-white"
                }`}
              >
                <p className="text-xl font-black uppercase tracking-wide">{guidance}</p>
              </Motion.div>
            </Motion.div>

            {/* Center Alignment Guides */}
            <div className="flex-1 flex items-center justify-center w-full">
              <div className="relative w-64 h-[80%]">
                {/* Silhouette Guide */}
                <div className={`absolute inset-0 border-2 rounded-[3.5rem] transition-all duration-500 ${
                  isAligned ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : "border-white/30"
                }`}>
                  {/* Face Circle */}
                  <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 border-2 rounded-full transition-colors ${
                    alignmentDetails.faceDetected ? "border-green-500" : "border-white/20"
                  }`} />
                  {/* Shoulder Line */}
                  <div className={`absolute top-40 left-0 right-0 h-[1px] transition-colors ${
                    alignmentDetails.shouldersLevel ? "bg-green-500" : "bg-white/10"
                  }`} />
                </div>
              </div>
            </div>

            {/* Real-time Metrics (Side) */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <MetricItem label="Face" active={alignmentDetails.faceDetected} />
              <MetricItem label="Body" active={alignmentDetails.shouldersLevel && alignmentDetails.hipsLevel} />
              <MetricItem label="Frame" active={alignmentDetails.fullBodyVisible} />
              <MetricItem label="Light" active={lightingQuality === "good"} />
            </div>
          </div>
        )}

        {/* ── Review Layer ── */}
        <AnimatePresence>
          {capturedPhoto && (
            <Motion.div 
              initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black flex flex-col items-center justify-center p-6"
            >
              <div className="relative max-w-md w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border-4 border-white/10">
                <img src={capturedPhoto.preview} alt="Captured" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <p className="text-white font-black uppercase tracking-widest text-sm">Review Your Photo</p>
                </div>
              </div>
              
              <div className="mt-10 flex gap-6 w-full max-w-md">
                <button onClick={handleRetake}
                  className="flex-1 py-5 bg-white/10 border border-white/20 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-white/20 transition">
                  Retake
                </button>
                <button onClick={handleConfirm}
                  className="flex-1 py-5 bg-[#8a7c65] text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#a89a88] transition shadow-xl">
                  <Check size={22} /> Confirm Photo
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Capture Control ── */}
      {!capturedPhoto && (
        <div className="bg-black/95 border-t border-white/10 p-10 flex items-center justify-center gap-16">
          <button onClick={onClose}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/40 transition group">
            <X size={24} className="text-white group-hover:scale-110 transition" />
          </button>

          <div className="relative">
            {/* Pulsing ring when aligned */}
            {hasCamera && !isCapturing && (
              <Motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`absolute inset-0 rounded-full ${isAligned ? 'bg-green-500' : 'bg-white/30'}`}
              />
            )}
            <button 
              onClick={handleCapture} 
              disabled={!hasCamera || isCapturing}
              className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition transform active:scale-90 ${
                hasCamera 
                  ? "bg-white shadow-[0_0_40px_rgba(255,255,255,0.4)]" 
                  : "bg-white/20 cursor-not-allowed"
              }`}
            >
              <Camera size={38} className={hasCamera ? "text-black" : "text-white/30"} />
            </button>
          </div>

          <div className="w-14 h-14 flex items-center justify-center">
             {!isAligned && hasCamera && (
               <AlertTriangle size={24} className="text-yellow-500/50 animate-pulse" />
             )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function MetricItem({ label, active }) {
  return (
    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 w-24">
      <div className={`w-2 h-2 rounded-full ${active ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-white/20"}`} />
      <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? "text-white" : "text-white/40"}`}>
        {label}
      </span>
    </div>
  );
}
