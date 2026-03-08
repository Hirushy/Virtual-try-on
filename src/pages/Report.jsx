"use client";

import React, { useRef, useEffect, useMemo, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// ✅ 3D
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";

/* ========================= 3D helpers (SAFE) ========================= */

function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/* ---------------- Slider Avatar (avatar1.glb) ---------------- */
function SliderAvatarModel({ cfg }) {
  const { scene } = useGLTF("/avatar1.glb");

  const DEFAULTS = {
    height: 170,
    chest: 95,
    waist: 75,
    hips: 100,
    shoulders: 44,
    arm: 60,
    leg: 80,
  };

  useEffect(() => {
    if (!scene || !cfg) return;

    scene.traverse((obj) => {
      if (obj.name === "FemaleRoot") obj.visible = cfg.gender === "female";
      if (obj.name === "MaleRoot") obj.visible = cfg.gender === "male";

      const heightScale = cfg.height / DEFAULTS.height;
      if (
        (obj.name === "FemaleRoot" && cfg.gender === "female") ||
        (obj.name === "MaleRoot" && cfg.gender === "male")
      ) {
        obj.scale.y = heightScale;
        obj.position.y = -(heightScale - 1) * 0.9;
      }

      if (obj.name.startsWith("hair_")) obj.visible = cfg.gender === "female" && obj.name === cfg.hair;
      if (obj.name === "male_short_hair") obj.visible = cfg.gender === "male";

      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const c = (x) => Math.max(0, Math.min(1, x));

        const chestBigger =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Bigger"]
            : obj.morphTargetDictionary["Male_Chest_Bigger"];
        const chestSmaller =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Smaller"]
            : obj.morphTargetDictionary["Male_Chest_Smaller"];
        const chestDelta = (cfg.chest - DEFAULTS.chest) / 30;
        if (chestBigger !== undefined) obj.morphTargetInfluences[chestBigger] = c(Math.max(chestDelta, 0));
        if (chestSmaller !== undefined) obj.morphTargetInfluences[chestSmaller] = c(Math.max(-chestDelta, 0));

        const waistBigger =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Bigger"]
            : obj.morphTargetDictionary["Male_Waist_Bigger"];
        const waistSmaller =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Smaller"]
            : obj.morphTargetDictionary["Male_Waist_Smaller"];
        if (waistBigger !== undefined)
          obj.morphTargetInfluences[waistBigger] = c(Math.max((cfg.waist - DEFAULTS.waist) / 30, 0));
        if (waistSmaller !== undefined)
          obj.morphTargetInfluences[waistSmaller] = c(Math.max((DEFAULTS.waist - cfg.waist) / 30, 0));

        const hipsBigger =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Bigger"]
            : obj.morphTargetDictionary["Male_Hips_Bigger"];
        const hipsSmaller =
          cfg.gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Smaller"]
            : obj.morphTargetDictionary["Male_Hips_Smaller"];
        if (hipsBigger !== undefined)
          obj.morphTargetInfluences[hipsBigger] = c(Math.max((cfg.hips - DEFAULTS.hips) / 30, 0));
        if (hipsSmaller !== undefined)
          obj.morphTargetInfluences[hipsSmaller] = c(Math.max((DEFAULTS.hips - cfg.hips) / 30, 0));
      }

      if (obj.name === "arm_L" || obj.name === "arm_R") obj.scale.y = cfg.armLength / DEFAULTS.arm;
      if (obj.name === "leg_L" || obj.name === "leg_R") obj.scale.y = cfg.legLength / DEFAULTS.leg;
    });
  }, [scene, cfg]);

  return <primitive object={scene} />;
}
useGLTF.preload("/avatar1.glb");

/* ---------------- Backend Twin (new1.glb) ---------------- */
function BackendTwinModel({ avatarData }) {
  const { scene } = useGLTF("/new1.glb");

  useEffect(() => {
    if (!scene || !avatarData) return;

    const gender = (avatarData.gender || "female").toLowerCase();
    const weights = avatarData.shape_key_weights || {};

    let foundGenderNodes = false;
    scene.traverse((obj) => {
      if (!obj.name) return;
      const n = obj.name.toLowerCase();
      const isFemale = n.includes("female");
      const isMale = n.includes("male") && !n.includes("female");
      if (isFemale || isMale) foundGenderNodes = true;
    });

    scene.traverse((obj) => {
      if (!obj.name) return;
      const n = obj.name.toLowerCase();
      const isFemale = n.includes("female");
      const isMale = n.includes("male") && !n.includes("female");

      if (foundGenderNodes) {
        if (isFemale) obj.visible = gender === "female";
        if (isMale) obj.visible = gender === "male";
      } else {
        obj.visible = true;
      }
    });

    scene.traverse((obj) => {
      if (!obj?.isMesh) return;
      if (!obj.visible) return;
      if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;

      for (const [k, v] of Object.entries(weights)) {
        const idx = obj.morphTargetDictionary[k];
        if (idx === undefined) continue;
        obj.morphTargetInfluences[idx] = clamp01(v);
      }

      if (obj.material) obj.material.needsUpdate = true;
    });
  }, [scene, avatarData]);

  return <primitive object={scene} scale={0.35} position={[0, -10, 0]} />;
}
useGLTF.preload("/new1.glb");

function AvatarCanvas({ avatarConfig, avatarData }) {
  const showSlider = !!avatarConfig && !avatarData;
  const showBackend = !!avatarData;

  return (
    <div className="w-full max-w-sm h-[500px] bg-gray-100 border-2 border-black rounded-2xl shadow-md overflow-hidden">
      <Canvas camera={{ position: showSlider ? [0, 0, 5] : [0, 2.0, 22], fov: showSlider ? 50 : 30, near: 0.1, far: 5000 }}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 2]} intensity={1.4} />
        <Suspense
          fallback={
            <Html center>
              <div className="rounded-full border border-gray-200 bg-white/80 px-3 py-2 text-xs text-gray-600 shadow">
                Loading 3D avatar...
              </div>
            </Html>
          }
        >
          <Environment preset="city" />
          {showBackend ? (
            <BackendTwinModel avatarData={avatarData} />
          ) : showSlider ? (
            <SliderAvatarModel cfg={avatarConfig} />
          ) : (
            <Html center>
              <div className="text-sm font-semibold text-gray-600">No avatar data</div>
            </Html>
          )}
        </Suspense>

        <OrbitControls enablePan={false} minDistance={2} maxDistance={200} target={[0, 1.1, 0]} />
      </Canvas>
    </div>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef(null);

  // ✅ Extract selections + avatar state
  const {
    selectedGender,
    selectedCategory,
    selectedSubcategory,
    selectedSubSubcategory,
    selectedCloth,
    selectedFabric,
    selectedSize,
    selectedColor,

    mode,
    outfitPhotos,

    avatarData,
    avatarConfig,
    photos,
  } = location.state || {};

  // Sample Fit Data (unchanged)
  const fitScore = 85;
  const fitFeedback = [
    { icon: "✅", text: "Perfect fit around waist." },
    { icon: "⚠️", text: "Slightly loose at sleeve." },
  ];

  // PDF download (unchanged)
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save("FitReport.pdf");
  };

  // ✅ Restart Try-On but KEEP same avatar
  const handleRestart = () => {
    navigate("/measurements", { state: { avatarData, avatarConfig, photos } });
  };

  const hasCatalogSelection = !!selectedGender;
  const hasUploadSelection = mode === "upload" && !!outfitPhotos?.front;

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      {/* Navbar */}
      <div className="absolute left-0 top-0 z-20 w-full">
        <Navbar />
      </div>

      {/* Main Section */}
      <section className="flex min-h-screen flex-col items-center justify-center gap-12 px-8 pb-24 pt-32 lg:flex-row lg:gap-20 lg:px-24">
        {/* Left — Report Details */}
        <Motion.div
          ref={reportRef}
          className="z-10 flex max-w-xl flex-1 flex-col space-y-6 rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-lg lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="uppercase tracking-[0.3em] text-sm text-[#8a7c65]">
            Virtual Try-On Report
          </p>

          <h1 className="text-4xl font-light leading-tight tracking-tight lg:text-5xl">
            Your Personalized{" "}
            <span className="font-medium text-[#8a7c65]">Fit Summary</span>
          </h1>

          <p className="text-base leading-relaxed text-gray-700">
            AI-generated analysis of your outfit fit — visualize, review, and save your results instantly.
          </p>

          {/* ✅ Uploaded outfit details (if upload mode) */}
          {hasUploadSelection && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-[#8a7c65]">
                Uploaded Outfit Details
              </h3>
              <div className="flex gap-3">
                {outfitPhotos?.front && (
                  <img src={outfitPhotos.front} alt="Outfit Front" className="h-32 w-24 rounded-xl border object-cover" />
                )}
                {outfitPhotos?.back && (
                  <img src={outfitPhotos.back} alt="Outfit Back" className="h-32 w-24 rounded-xl border object-cover" />
                )}
              </div>
            </div>
          )}

          {/* ✅ Catalog details (if catalog mode) */}
          {hasCatalogSelection && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-[#8a7c65]">
                Selected Outfit Details
              </h3>
              <div className="space-y-1 text-sm text-gray-800">
                <p><strong>Gender:</strong> {selectedGender}</p>
                <p><strong>Category:</strong> {selectedCategory}</p>
                <p><strong>Type:</strong> {selectedSubcategory}</p>
                <p><strong>Style:</strong> {selectedSubSubcategory}</p>
                <p><strong>Cloth:</strong> {selectedCloth?.name}</p>
                <p><strong>Fabric:</strong> {selectedFabric}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                <p>
                  <strong>Color:</strong>{" "}
                  <span
                    className="ml-2 inline-block h-5 w-5 rounded-full border border-gray-400 align-middle"
                    style={{ backgroundColor: selectedColor }}
                  ></span>{" "}
                  {selectedColor}
                </p>
              </div>
            </div>
          )}

          {/* Fit Score */}
          <div className="flex items-center justify-center gap-4 pt-2 lg:justify-start">
            <span className="text-lg font-semibold">Fit Score:</span>
            <span className="text-3xl font-bold text-green-600">{fitScore}/100</span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2 h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-gradient-to-r from-green-400 to-blue-500"
              style={{ width: `${fitScore}%` }}
            />
          </div>

          {/* Feedback Box */}
          <div className="mt-6 flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
            {fitFeedback.map((f, i) => (
              <p key={i} className="font-sans text-gray-800">
                {f.icon} {f.text}
              </p>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 pt-6 sm:flex-row">
            <Motion.button
              onClick={handleDownloadPDF}
              className="flex-1 px-8 py-3 font-medium text-white bg-[#1f1f1f] rounded-full hover:bg-[#8a7c65] transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              📄 Download Report
            </Motion.button>

            <Motion.button
              onClick={handleRestart}
              className="flex-1 px-8 py-3 font-medium border border-[#8a7c65] text-[#8a7c65] rounded-full hover:bg-[#8a7c65] hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              🔄 Restart Try-On
            </Motion.button>
          </div>

          <button
            onClick={() => navigate("/", { state: { avatarData, avatarConfig, photos } })}
            className="pt-4 text-sm text-gray-500 underline hover:text-[#8a7c65] transition"
          >
            Exit to Home
          </button>
        </Motion.div>

        {/* ✅ Right — REAL 3D Avatar Preview */}
        <Motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <AvatarCanvas avatarConfig={avatarConfig} avatarData={avatarData} />
        </Motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity & style.
      </footer>
    </div>
  );
}
