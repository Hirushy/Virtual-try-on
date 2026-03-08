// ✅ Building_u.jsx (FULL) — SAFE: keeps your page and ADDS the SAME configured 3D preview
// ✅ Reads avatarConfig passed from BodyDetails and renders avatar1.glb with same settings

"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { useNavigate, useLocation } from "react-router-dom";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

/* ========================= SAME AvatarModel (copy from BodyDetails) ========================= */
function AvatarModel({
  gender,
  hairType,
  height,
  waist,
  chest,
  hips,
  shoulders,
  armLength,
  legLength,
}) {
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
    if (!scene) return;

    scene.traverse((obj) => {
      if (obj.name === "FemaleRoot") obj.visible = gender === "female";
      if (obj.name === "MaleRoot") obj.visible = gender === "male";

      const heightScale = height / DEFAULTS.height;
      if (
        (obj.name === "FemaleRoot" && gender === "female") ||
        (obj.name === "MaleRoot" && gender === "male")
      ) {
        obj.scale.y = heightScale;
        obj.position.y = -(heightScale - 1) * 0.9;
      }

      if (obj.name.startsWith("hair_")) {
        obj.visible = gender === "female" && obj.name === hairType;
      }
      if (obj.name === "male_short_hair") obj.visible = gender === "male";

      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const clamp01 = (x) => Math.max(0, Math.min(1, x));

        const armBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Arm_Bigger"]
            : obj.morphTargetDictionary["Male_Arm_Bigger"];
        const armSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Arm_Smaller"]
            : obj.morphTargetDictionary["Male_Arm_Smaller"];
        const armDelta = (armLength - DEFAULTS.arm) / 40;
        if (armBigger !== undefined) obj.morphTargetInfluences[armBigger] = clamp01(Math.max(armDelta, 0));
        if (armSmaller !== undefined) obj.morphTargetInfluences[armSmaller] = clamp01(Math.max(-armDelta, 0));

        const legBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Leg_Bigger"]
            : obj.morphTargetDictionary["Male_Leg_Bigger"];
        const legSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Leg_Smaller"]
            : obj.morphTargetDictionary["Male_Leg_Smaller"];
        const legDelta = (legLength - DEFAULTS.leg) / 40;
        if (legBigger !== undefined) obj.morphTargetInfluences[legBigger] = clamp01(Math.max(legDelta, 0));
        if (legSmaller !== undefined) obj.morphTargetInfluences[legSmaller] = clamp01(Math.max(-legDelta, 0));

        const chestBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Bigger"]
            : obj.morphTargetDictionary["Male_Chest_Bigger"];
        const chestSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Smaller"]
            : obj.morphTargetDictionary["Male_Chest_Smaller"];
        const chestDelta = (chest - DEFAULTS.chest) / 30;
        if (chestBigger !== undefined) obj.morphTargetInfluences[chestBigger] = clamp01(Math.max(chestDelta, 0));
        if (chestSmaller !== undefined) obj.morphTargetInfluences[chestSmaller] = clamp01(Math.max(-chestDelta, 0));

        const waistBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Bigger"]
            : obj.morphTargetDictionary["Male_Waist_Bigger"];
        const waistSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Smaller"]
            : obj.morphTargetDictionary["Male_Waist_Smaller"];
        if (waistBigger !== undefined)
          obj.morphTargetInfluences[waistBigger] = clamp01(Math.max((waist - DEFAULTS.waist) / 30, 0));
        if (waistSmaller !== undefined)
          obj.morphTargetInfluences[waistSmaller] = clamp01(Math.max((DEFAULTS.waist - waist) / 30, 0));

        const hipsBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Bigger"]
            : obj.morphTargetDictionary["Male_Hips_Bigger"];
        const hipsSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Smaller"]
            : obj.morphTargetDictionary["Male_Hips_Smaller"];
        if (hipsBigger !== undefined)
          obj.morphTargetInfluences[hipsBigger] = clamp01(Math.max((hips - DEFAULTS.hips) / 30, 0));
        if (hipsSmaller !== undefined)
          obj.morphTargetInfluences[hipsSmaller] = clamp01(Math.max((DEFAULTS.hips - hips) / 30, 0));

        const shouldersBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Shoulders_Bigger"]
            : obj.morphTargetDictionary["Male_Shoulders_Bigger"];
        const shouldersSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Shoulders_Smaller"]
            : obj.morphTargetDictionary["Male_Shoulders_Smaller"];
        if (shouldersBigger !== undefined)
          obj.morphTargetInfluences[shouldersBigger] = clamp01(Math.max((shoulders - DEFAULTS.shoulders) / 20, 0));
        if (shouldersSmaller !== undefined)
          obj.morphTargetInfluences[shouldersSmaller] = clamp01(Math.max((DEFAULTS.shoulders - shoulders) / 20, 0));
      }

      if (obj.name === "arm_L" || obj.name === "arm_R") obj.scale.y = armLength / DEFAULTS.arm;
      if (obj.name === "leg_L" || obj.name === "leg_R") obj.scale.y = legLength / DEFAULTS.leg;
    });
  }, [scene, gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength]);

  return <primitive object={scene} />;
}

useGLTF.preload("/avatar1.glb");

function AvatarPreview({ cfg }) {
  return (
    <div className="w-72 h-72 bg-[#f8f8f8] border border-[#8a7c65]/50 shadow-lg rounded-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <AvatarModel
            gender={cfg.gender}
            hairType={cfg.hair}
            height={cfg.height}
            waist={cfg.waist}
            chest={cfg.chest}
            hips={cfg.hips}
            shoulders={cfg.shoulders}
            armLength={cfg.armLength}
            legLength={cfg.legLength}
          />
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}

export default function Building_u() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const uploadedPhotos = useMemo(
    () => location.state?.photos || { front: null, back: null },
    [location.state]
  );

  // ✅ get the customized avatar settings from BodyDetails
  const avatarConfig = useMemo(() => {
    return (
      location.state?.avatarConfig || {
        gender: "female",
        hair: "hair_long",
        height: 170,
        waist: 75,
        chest: 95,
        hips: 100,
        shoulders: 44,
        armLength: 60,
        legLength: 80,
      }
    );
  }, [location.state]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 100));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // ✅ after 100% go to Generated with SAME measurements config
  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        navigate("/generated", { state: { photos: uploadedPhotos, avatarConfig } });
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [progress, navigate, uploadedPhotos, avatarConfig]);

  const currentStepIndex = Math.floor((progress / 100) * steps.length);

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
            {uploadedPhotos.front && (
              <img
                src={uploadedPhotos.front}
                alt="Front"
                className="object-cover w-24 h-32 border border-[#8a7c65]/50 rounded-lg shadow-md"
              />
            )}
            {uploadedPhotos.back && (
              <img
                src={uploadedPhotos.back}
                alt="Back"
                className="object-cover w-24 h-32 border border-[#8a7c65]/50 rounded-lg shadow-md"
              />
            )}
          </div>

          <h1 className="text-5xl font-light leading-tight tracking-tight text-[#1f1f1f]">
            Building Your <br />
            <span className="font-medium text-[#8a7c65]">Virtual Avatar</span>
          </h1>

          <p className="max-w-md text-base leading-relaxed text-gray-600">
            Please wait while your body details are processed to generate your 3D avatar. This won’t take long.
          </p>

          <div className="relative my-8 h-40 w-40">
            <svg className="h-40 w-40" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#e5e5e5" strokeWidth="10" fill="none" />
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
                  idx <= currentStepIndex ? "text-[#8a7c65] font-medium" : "text-gray-400"
                }`}
              >
                {step}
              </p>
            ))}
          </div>

          <Motion.button
            onClick={() => navigate("/body-details", { state: { photos: uploadedPhotos, avatarConfig } })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-[#8a7c65] underline underline-offset-4 hover:text-[#6e604e] transition-all duration-300 font-medium"
          >
            ← Back To Body Details
          </Motion.button>
        </Motion.div>

        {/* ✅ Right side: REAL configured 3D avatar preview */}
        <Motion.div
          className="flex flex-1 items-center justify-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <AvatarPreview cfg={avatarConfig} />
        </Motion.div>
      </section>

      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity & style.
      </footer>
    </div>
  );
}
