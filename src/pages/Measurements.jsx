// ✅ Measurements.jsx (FULL CORRECT FLOW)
// ✅ FIXED: If avatarConfig exists -> show SAME avatar1.glb (sliders)
// ✅ Else use your current new1.glb (avatarData) backend twin
// ✅ Keeps your API_BASE fetch logic intact (not harming project)

"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";

/* ========================= API BASE ========================= */
const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

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

function buildSummaryFromWeights(weights) {
  const c = clamp01(weights?.Chest);
  const w = clamp01(weights?.Waist);
  const h = clamp01(weights?.Hips);

  const avg = (c + w + h) / 3;

  const bodyType = avg < 0.33 ? "Slim" : avg < 0.66 ? "Average" : "Broad";
  const waistDesc = w < 0.33 ? "Slim waist" : w < 0.66 ? "Average waist" : "Broad waist";
  const hipsDesc = h < 0.33 ? "Slim hips" : h < 0.66 ? "Average hips" : "Broad hips";
  const chestDesc = c < 0.33 ? "Smaller chest" : c < 0.66 ? "Average chest" : "Broader chest";

  return { bodyType, waistDesc, hipsDesc, chestDesc, c, w, h };
}

/* ========================= Slider Avatar1 Model (same as BodyDetails) ========================= */
function SliderAvatarModel({
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

      if (obj.name.startsWith("hair_")) obj.visible = gender === "female" && obj.name === hairType;
      if (obj.name === "male_short_hair") obj.visible = gender === "male";

      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const c = (x) => Math.max(0, Math.min(1, x));

        const chestBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Bigger"]
            : obj.morphTargetDictionary["Male_Chest_Bigger"];
        const chestSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Chest_Smaller"]
            : obj.morphTargetDictionary["Male_Chest_Smaller"];
        const chestDelta = (chest - DEFAULTS.chest) / 30;
        if (chestBigger !== undefined) obj.morphTargetInfluences[chestBigger] = c(Math.max(chestDelta, 0));
        if (chestSmaller !== undefined) obj.morphTargetInfluences[chestSmaller] = c(Math.max(-chestDelta, 0));

        const waistBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Bigger"]
            : obj.morphTargetDictionary["Male_Waist_Bigger"];
        const waistSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Waist_Smaller"]
            : obj.morphTargetDictionary["Male_Waist_Smaller"];
        if (waistBigger !== undefined) obj.morphTargetInfluences[waistBigger] = c(Math.max((waist - DEFAULTS.waist) / 30, 0));
        if (waistSmaller !== undefined) obj.morphTargetInfluences[waistSmaller] = c(Math.max((DEFAULTS.waist - waist) / 30, 0));

        const hipsBigger =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Bigger"]
            : obj.morphTargetDictionary["Male_Hips_Bigger"];
        const hipsSmaller =
          gender === "female"
            ? obj.morphTargetDictionary["Female_Hips_Smaller"]
            : obj.morphTargetDictionary["Male_Hips_Smaller"];
        if (hipsBigger !== undefined) obj.morphTargetInfluences[hipsBigger] = c(Math.max((hips - DEFAULTS.hips) / 30, 0));
        if (hipsSmaller !== undefined) obj.morphTargetInfluences[hipsSmaller] = c(Math.max((DEFAULTS.hips - hips) / 30, 0));
      }

      if (obj.name === "arm_L" || obj.name === "arm_R") obj.scale.y = armLength / DEFAULTS.arm;
      if (obj.name === "leg_L" || obj.name === "leg_R") obj.scale.y = legLength / DEFAULTS.leg;
    });
  }, [scene, gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength]);

  return <primitive object={scene} />;
}

useGLTF.preload("/avatar1.glb");

/* ========================= Backend new1 model ========================= */
function BackendTwinModel({ gender = "female", avatarData }) {
  const { scene } = useGLTF("/new1.glb");

  useEffect(() => {
    if (!scene) return;

    // show/hide by gender group names
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

    // apply morph weights (Chest/Waist/Hips)
    const weights = avatarData?.shape_key_weights;
    if (weights) {
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
    }
  }, [scene, gender, avatarData]);

  return <primitive object={scene} scale={0.35} position={[0, -10, 0]} />;
}

useGLTF.preload("/new1.glb");

/* ========================= Page ========================= */
export default function Measurements() {
  const navigate = useNavigate();
  const location = useLocation();

  const [avatarData, setAvatarData] = useState(null);
  const [loading, setLoading] = useState(true);

  const passedAvatarData = useMemo(() => location.state?.avatarData || null, [location.state]);
  const avatarConfig = useMemo(() => location.state?.avatarConfig || null, [location.state]);
  const uploadedPhotos = useMemo(() => location.state?.photos || null, [location.state]);

  // ✅ If avatarConfig exists, we DO NOT need backend data (we show avatar1)
  // ✅ If no avatarConfig, use avatarData or fetch backend as you already do
  useEffect(() => {
    if (avatarConfig) {
      setLoading(false);
      return;
    }

    if (passedAvatarData) {
      setAvatarData(passedAvatarData);
      setLoading(false);
      return;
    }

    const fetchAvatarData = async () => {
      try {
        const res = await fetch(`${API_BASE}/avatar-data`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isLockedContract(data)) setAvatarData(data);
        else setAvatarData(null);
      } catch (e) {
        setAvatarData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarData();
  }, [passedAvatarData, avatarConfig]);

  // Summary:
  // - If avatarConfig: show text based on cm values
  // - Else if avatarData: show based on weights (your current)
  const gender = (avatarConfig?.gender || avatarData?.gender || "female").toLowerCase();
  const note = avatarData?.note || "Shape-similar avatar (relative proportions), not exact measurements.";

  const summary = useMemo(() => {
    if (avatarConfig) {
      const wChest = clamp01((avatarConfig.chest - 95) / 30);
      const wWaist = clamp01((avatarConfig.waist - 75) / 30);
      const wHips = clamp01((avatarConfig.hips - 100) / 30);
      return buildSummaryFromWeights({ Chest: wChest, Waist: wWaist, Hips: wHips });
    }
    if (avatarData?.shape_key_weights) return buildSummaryFromWeights(avatarData.shape_key_weights);
    return null;
  }, [avatarConfig, avatarData]);

  const canProceed = !!avatarConfig || (!!avatarData && !loading);

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      <div className="absolute left-0 top-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="flex min-h-screen flex-col items-center justify-center gap-10 px-8 pb-24 pt-32 lg:flex-row lg:gap-20 lg:px-24">
        {/* Left */}
        <Motion.div
          className="z-10 flex flex-1 flex-col items-center space-y-6 text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-light leading-tight tracking-tight lg:text-6xl">
            Choose How You’d Like to{" "}
            <span className="font-medium text-[#8a7c65]">Try On Outfits</span>
          </h1>

          <p className="max-w-md text-gray-600">
            You can browse our <strong>Clothing Catalog</strong> or <strong>Upload Your Own Outfit</strong>.
          </p>

          <div className="w-full max-w-md p-5 border border-[#dedad3] rounded-2xl bg-white/70 shadow-sm">
            {loading ? (
              <p className="text-sm text-gray-500">Loading avatar summary...</p>
            ) : summary ? (
              <>
                <h3 className="text-lg font-medium text-[#8a7c65] mb-2">Digital Twin Summary</h3>

                <ul className="space-y-1 text-sm text-gray-700">
                  <li>⚧ Gender: <b>{gender}</b></li>
                  <li>🧍 Body type (hint): <b>{summary.bodyType}</b></li>
                  <li>📐 Waist: <b>{summary.waistDesc}</b></li>
                  <li>👖 Hips: <b>{summary.hipsDesc}</b></li>
                  <li>🧥 Chest: <b>{summary.chestDesc}</b></li>
                </ul>

                <div className="mt-3 text-xs text-gray-500">
                  Weights — Chest: <b>{summary.c.toFixed(2)}</b> • Waist:{" "}
                  <b>{summary.w.toFixed(2)}</b> • Hips: <b>{summary.h.toFixed(2)}</b>
                </div>

                <p className="mt-3 text-xs text-gray-500">
                  {avatarConfig ? "Slider-based avatar (same as BodyDetails)." : note}
                </p>
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

          <div className="flex w-full max-w-sm flex-col gap-4 pt-6">
            <Motion.button
              onClick={() =>
                navigate("/measurements/clothing-cat", {
                  state: { avatarData, avatarConfig, photos: uploadedPhotos },
                })
              }
              className="w-full px-6 py-4 font-sans font-semibold text-white transition rounded-full shadow-md bg-gradient-to-r from-[#8a7c65] to-[#3b3a37] hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              disabled={!canProceed}
            >
              Clothing Catalog
            </Motion.button>

          

            <Motion.button
              onClick={() =>
                navigate("/generated", {
                  state: { avatarData, avatarConfig, photos: uploadedPhotos },
                })
              }
              className="text-[#8a7c65] underline underline-offset-4 hover:text-[#6e604e] transition-all duration-300 font-medium"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              ← Back to Generated
            </Motion.button>
          </div>
        </Motion.div>

        {/* Right — 3D Preview (THIS is the main fix) */}
        <Motion.div
          className="relative flex flex-1 items-center justify-center"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="relative w-[580px] h-[700px] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-md">
            <div className="absolute z-10 ml-4 mt-4 rounded-full border border-gray-200 bg-white/80 px-3 py-1 text-xs text-gray-600">
              {avatarConfig ? "Same Avatar: BodyDetails (avatar1.glb)" : loading ? "Loading..." : "Backend Avatar (new1.glb)"}
            </div>

            <div className="h-full w-full">
              <Canvas
                camera={{
                  position: avatarConfig ? [0, 0, 5] : [0, 2.0, 22],
                  fov: avatarConfig ? 50 : 30,
                  near: 0.1,
                  far: 5000,
                }}
              >
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

                  {/* ✅ FIX: Choose model based on avatarConfig */}
                  {avatarConfig ? (
                    <SliderAvatarModel
                      gender={avatarConfig.gender}
                      hairType={avatarConfig.hair}
                      height={avatarConfig.height}
                      waist={avatarConfig.waist}
                      chest={avatarConfig.chest}
                      hips={avatarConfig.hips}
                      shoulders={avatarConfig.shoulders}
                      armLength={avatarConfig.armLength}
                      legLength={avatarConfig.legLength}
                    />
                  ) : (
                    <BackendTwinModel gender={gender} avatarData={avatarData} />
                  )}
                </Suspense>

                <OrbitControls enablePan={false} minDistance={2} maxDistance={200} target={[0, 1.1, 0]} />
              </Canvas>
            </div>
          </div>
        </Motion.div>
      </section>

      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with elegance & innovation.
      </footer>
    </div>
  );
}
