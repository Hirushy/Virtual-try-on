"use client";

import React, { useEffect, useMemo, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

/* ========================= Helpers ========================= */

function clamp01(x) {
  const n = Number(x);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function toThreeColor(input) {
  const s = String(input || "").trim();

  if (s.startsWith("#")) {
    try {
      return new THREE.Color(s);
    } catch {
      return new THREE.Color("#ffffff");
    }
  }

  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) {
    const r = parseInt(m[1]) / 255;
    const g = parseInt(m[2]) / 255;
    const b = parseInt(m[3]) / 255;
    return new THREE.Color(r, g, b);
  }

  return new THREE.Color("#ffffff");
}

/* ========================= Avatar Model ========================= */

function SliderAvatarModel({
  cfg,
  avatarData,
  selectedTopName,
  selectedTopSize,
  selectedColor,
  clothInstanceId
}) {
  const { scene } = useGLTF("/avatar1.glb");
  const originalMaterialsRef = useRef(new Map());

  const DEFAULTS = {
    height: 170,
    arm: 60,
    leg: 80
  };

  const isPhotoFlow = useMemo(() => {
    return Boolean(avatarData && (!cfg || cfg.__from !== "measurements"));
  }, [avatarData, cfg]);

  useEffect(() => {
    if (!scene) return;

    const gender = (cfg?.gender || avatarData?.gender || "female").toLowerCase();
    const hairType = cfg?.hair || "hair_long";

    const height = cfg?.height ?? DEFAULTS.height;
    const armLength = cfg?.armLength ?? DEFAULTS.arm;
    const legLength = cfg?.legLength ?? DEFAULTS.leg;

    const pickedColor = toThreeColor(selectedColor);

    scene.traverse((obj) => {

      if (obj.name === "FemaleRoot") obj.visible = gender === "female";
      if (obj.name === "MaleRoot") obj.visible = gender === "male";

      if (obj.name?.startsWith("hair_")) {
        obj.visible = gender === "female" && obj.name === hairType;
      }

      if (obj.name === "male_short_hair") {
        obj.visible = gender === "male";
      }

      if (obj.name?.startsWith("top_")) obj.visible = false;
      if (selectedTopName && obj.name === selectedTopName) obj.visible = true;

      const heightScale = height / DEFAULTS.height;

      if (obj.name === "FemaleRoot" || obj.name === "MaleRoot") {
        obj.scale.y = heightScale;
        obj.position.y = -(heightScale - 1) * 0.9;
      }

      if (obj.name === "arm_L" || obj.name === "arm_R") {
        obj.scale.y = armLength / DEFAULTS.arm;
      }

      if (obj.name === "leg_L" || obj.name === "leg_R") {
        obj.scale.y = legLength / DEFAULTS.leg;
      }

    });

    /* Apply clothing color */

    if (selectedTopName && selectedTopSize) {
      const topObj = scene.getObjectByName(selectedTopName);

      if (topObj) {

        const meshes = [];
        topObj.traverse(m => { if (m.isMesh) meshes.push(m) });

        meshes.forEach(m => {

          if (!originalMaterialsRef.current.has(m.uuid)) {
            originalMaterialsRef.current.set(m.uuid, m.material);
          }

          const baseMat = originalMaterialsRef.current.get(m.uuid);
          const cloned = baseMat.clone();

          if (cloned.color) cloned.color.copy(pickedColor);

          m.material = cloned;
        });

      }
    }

    scene.updateMatrixWorld(true);

  }, [scene, cfg, avatarData, selectedTopName, selectedTopSize, selectedColor, clothInstanceId]);

  return <primitive object={scene} />;
}

useGLTF.preload("/avatar1.glb");

/* ================= Canvas ================= */

export default function AvatarCanvas(props) {

  const { avatarConfig, avatarData } = props;

  const cfg = useMemo(() => {

    if (avatarConfig) return { ...avatarConfig, __from: "measurements" };

    return {
      gender: (avatarData?.gender || "female").toLowerCase(),
      hair: "hair_long"
    };

  }, [avatarConfig, avatarData]);

  return (

    <div style={{ width: "520px", height: "520px", maxWidth: "100%" }}>

      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>

        <ambientLight intensity={0.6} />
        <directionalLight position={[5,5,5]} intensity={0.8} />

        <Suspense fallback={<Html center>Loading...</Html>}>

          <Environment preset="city" />

          <SliderAvatarModel {...props} cfg={cfg} />

        </Suspense>

        <OrbitControls enableZoom enablePan={false} />

      </Canvas>

    </div>

  );
}