// ✅ UPDATED: src/pages/Generated.jsx
// ✅ INTEGRATED: STEP 5 (Heatmap Data) & STEP 6 (Safety Fallbacks)
// ✅ VIVA TIP: "Uses relative shape-similar estimation for digital twin fit zones."

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";

// 🛠️ Import the conversion utility
import { convertShapeWeightsToCM } from "../utils/bodyMeasurementConverter";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

/* ========================= HELPERS ========================= */
function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function applyShapeKeysToMesh(mesh, weights) {
  if (!mesh?.morphTargetDictionary || !mesh?.morphTargetInfluences) return;
  Object.entries(weights || {}).forEach(([keyName, value]) => {
    const idx = mesh.morphTargetDictionary[keyName];
    if (idx === undefined) return;
    mesh.morphTargetInfluences[idx] = clamp01(value);
  });
}

function setWireframe(obj, enabled) {
  const mat = obj?.material;
  if (!mat) return;
  const mats = Array.isArray(mat) ? mat : [mat];
  mats.forEach((m) => {
    if (m) {
      m.wireframe = !!enabled;
      m.needsUpdate = true;
    }
  });
}

function hideAllTops(scene) {
  if (!scene) return;
  scene.traverse((obj) => {
    if (obj?.name?.startsWith("top_")) obj.visible = false;
  });
}

/* ========================= 3D COMPONENTS ========================= */
function TwinScene({ avatarData, viewMode }) {
  const { scene } = useGLTF("/new1.glb");

  useEffect(() => {
    if (!scene || !avatarData) return;

    hideAllTops(scene);
    const gender = (avatarData.gender || "female").toLowerCase();
    const weights = avatarData.shape_key_weights || {};

    scene.traverse((obj) => {
      if (!obj?.name) return;
      const n = obj.name.toLowerCase();
      const isFemale = n.includes("female");
      const isMale = n.includes("male") && !isFemale;

      if (isFemale) obj.visible = gender === "female";
      if (isMale) obj.visible = gender === "male";

      if (obj.isMesh && obj.visible) {
        if (obj.morphTargetDictionary && obj.morphTargetInfluences) {
          applyShapeKeysToMesh(obj, weights);
        }
        setWireframe(obj, viewMode === "Mesh");
      }
    });
    hideAllTops(scene);
  }, [scene, avatarData, viewMode]);

  return <primitive object={scene} />;
}

function AvatarModel({ gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength }) {
  const { scene } = useGLTF("/avatar1.glb");
  const DEFAULTS = { height: 170, chest: 95, waist: 75, hips: 100, shoulders: 44, arm: 60, leg: 80 };

  useEffect(() => {
    if (!scene) return;
    hideAllTops(scene);

    scene.traverse((obj) => {
      if (obj.name === "FemaleRoot") obj.visible = gender === "female";
      if (obj.name === "MaleRoot") obj.visible = gender === "male";

      const heightScale = height / DEFAULTS.height;
      if ((obj.name === "FemaleRoot" && gender === "female") || (obj.name === "MaleRoot" && gender === "male")) {
        obj.scale.y = heightScale;
        obj.position.y = -(heightScale - 1) * 0.9;
      }

      if (obj.name.startsWith("hair_")) obj.visible = gender === "female" && obj.name === hairType;
      if (obj.name === "male_short_hair") obj.visible = gender === "male";

      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const c = (x) => Math.max(0, Math.min(1, x));
        const prefix = gender === "female" ? "Female_" : "Male_";
        
        const applyMorph = (key, current, base) => {
          const bigger = obj.morphTargetDictionary[`${prefix}${key}_Bigger`];
          const smaller = obj.morphTargetDictionary[`${prefix}${key}_Smaller`];
          const delta = (current - base) / 30;
          if (bigger !== undefined) obj.morphTargetInfluences[bigger] = c(delta);
          if (smaller !== undefined) obj.morphTargetInfluences[smaller] = c(-delta);
        };

        applyMorph("Chest", chest, DEFAULTS.chest);
        applyMorph("Waist", waist, DEFAULTS.waist);
        applyMorph("Hips", hips, DEFAULTS.hips);
      }

      if (obj.name.startsWith("arm_")) obj.scale.y = armLength / DEFAULTS.arm;
      if (obj.name.startsWith("leg_")) obj.scale.y = legLength / DEFAULTS.leg;
    });

    hideAllTops(scene);
    scene.updateMatrixWorld(true);
  }, [scene, gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength]);

  return <primitive object={scene} />;
}

/* ========================= MAIN PAGE ========================= */
export default function Generated() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ STEP 6: Safety Fallback for missing state
  const avatarData = useMemo(() => location.state?.avatarData || null, [location.state?.avatarData]);
  const avatarConfig = useMemo(() => location.state?.avatarConfig || null, [location.state?.avatarConfig]);
  const UploadedPhotos = useMemo(() => location.state?.photos || { front: null, back: null }, [location.state?.photos]);

  const [viewMode, setViewMode] = useState("Textured");
  
  // ✅ STEP 5: Measurement state for Heatmap
  const [measurements, setMeasurements] = useState(null);

  const showNew1 = !!avatarData;
  const showAvatar1 = !avatarData && !!avatarConfig;

  // ✅ STEP 5 & 6: Conversion Pipeline with Safety Check
  useEffect(() => {
    if (!avatarData || !avatarData.shape_key_weights) {
      console.warn("STEP 6: Measurement data missing or invalid");
      // If manual config exists, we use that as a fallback measurement source
      if (avatarConfig) {
        setMeasurements({
          shoulders: avatarConfig.shoulders,
          chest: avatarConfig.chest,
          waist: avatarConfig.waist,
          hips: avatarConfig.hips
        });
      }
      return;
    }

    const bodyMeasurements = convertShapeWeightsToCM(avatarData.shape_key_weights);
    setMeasurements(bodyMeasurements);
  }, [avatarData, avatarConfig]);

  const handleProceed = () => {
    navigate("/measurements", {
      state: { 
        photos: UploadedPhotos, 
        avatarData, 
        avatarConfig,
        bodyMeasurements: measurements // ✅ Ready for Heatmap.jsx
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="flex flex-col items-center justify-center min-h-screen gap-10 px-8 pt-32 pb-24 lg:flex-row lg:gap-20 lg:px-24">
        <Motion.div 
          className="z-10 flex flex-col items-center flex-1 space-y-6 text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-light leading-tight tracking-tight lg:text-6xl">
            Your <span className="font-medium text-[#8a7c65]">Generated Avatar</span>
          </h1>
          <p className="max-w-md text-gray-600">
            Analysis complete. We've calibrated your 3D twin with shape-similar estimation for the Fit Analyzer.
          </p>

          <div className="flex gap-3 pt-4">
            {["Mesh", "Textured"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2 rounded-full border font-medium transition-all duration-300 ${
                  viewMode === mode ? "bg-[#1a1a19] text-white border-[#8a7c65]" : "border-gray-200 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>

          <div className="flex flex-col w-full max-w-sm gap-4 pt-8">
            <Motion.button
              onClick={handleProceed}
              className="w-full px-6 py-4 font-serif font-semibold text-black transition rounded-full shadow-md bg-gradient-to-r from-[#8a7c65] to-[#c0b69a] hover:shadow-xl"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            >
              Proceed to Try-On
            </Motion.button>

            <Motion.button
              onClick={() => navigate("/upload-photo", { state: { photos: UploadedPhotos } })}
              className="w-full px-6 py-4 text-gray-700 transition border border-gray-400 rounded-full hover:bg-gray-100"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Upload New Photo
            </Motion.button>
          </div>
        </Motion.div>

        <Motion.div 
          className="relative flex items-center justify-center flex-1"
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.4 }}
        >
          <div className="bg-gray-100 border border-gray-200 shadow-md w-80 h-[420px] rounded-2xl overflow-hidden">
            <Canvas camera={{ position: showNew1 ? [0, 1.2, 5.5] : [0, 0.5, 6], fov: 40 }}>
              <ambientLight intensity={1} />
              <directionalLight position={[3, 3, 3]} intensity={2} />
              
              <Suspense fallback={null}>
                {showNew1 ? (
                  <TwinScene avatarData={avatarData} viewMode={viewMode} />
                ) : showAvatar1 ? (
                  <AvatarModel {...avatarConfig} hairType={avatarConfig.hair} />
                ) : (
                   <mesh><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#ccc" /></mesh>
                )}
              </Suspense>

              <OrbitControls 
                enablePan={false} 
                minDistance={1.5} 
                maxDistance={10} 
                target={[0, 1, 0]} 
              />
            </Canvas>
          </div>
        </Motion.div>
      </section>

      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600">
        © {new Date().getFullYear()} Virtual Try-On — Precision Fit Technology.
      </footer>
    </div>
  );
}

useGLTF.preload("/new1.glb");
useGLTF.preload("/avatar1.glb");