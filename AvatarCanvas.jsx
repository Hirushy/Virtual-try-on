// src/pages/measurements/AvatarCanvas.jsx
"use client";

import React, { useEffect, useMemo, useRef, Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls, Environment, useGLTF,
  Html, useProgress
} from "@react-three/drei";
import * as THREE from "three";
import { CanvasErrorBoundary, DEFAULT_GL_SETTINGS } from "../../components/WebGLHandler";

import {
  toThreeColor,
  cloneMaterialStructure,
  disposeOwnedMaterials,
  applyClothingSolidColor,
  MORPH_RANGES,
  BODY_MESH_NAMES,
  isBodyOrHairMesh,
  RENDER_ORDER,
  EXCLUSIVE_CATEGORIES,
  REQUIRES_OK,
  getItemCategory,
  normalizeSizeLabel,
  clampClothSizeToAvatarMin,
  getAllowedSizes,
  deepDispose,
} from "./AvatarConstants";

/* ─────────────────────────────────────────────
   Heat colour helper
 ───────────────────────────────────────────── */
function heatColor(intensity) {
  const color = new THREE.Color();
  color.setHSL(0.7 - intensity * 0.7, 1, 0.5);
  return color;
}

/* ─────────────────────────────────────────────
   Heatmap points (additive blended point cloud)
 ───────────────────────────────────────────── */
function HeatmapPoints({ points = [] }) {
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(points.length * 3);
    const col = new Float32Array(points.length * 3);
    points.forEach((p, i) => {
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      const c = heatColor(p.intensity);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    });
    return { positions: pos, colors: col };
  }, [points]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={points.length}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────
   Dot colour helper
 ───────────────────────────────────────────── */
function dotColor(score, type) {
  if (type === "perfect") return "#22c55e";
  if (type === "loose") return "#3b82f6";
  if (type === "snug") return "#eab308";
  if (type === "tight") return score < 25 ? "#ef4444" : "#f97316";
  return "#22c55e";
}

/* ─────────────────────────────────────────────
   Canvas texture cache — one texture per colour hex
 ───────────────────────────────────────────── */
const _textureCache = new Map();

function getDotTexture(hex) {
  if (_textureCache.has(hex)) return _textureCache.get(hex);
  const S = 128, cx = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const ctx = cv.getContext("2d");

  const g = ctx.createRadialGradient(cx, cx, 8, cx, cx, cx);
  g.addColorStop(0, hex + "ff");
  g.addColorStop(0.42, hex + "ff");
  g.addColorStop(0.62, hex + "55");
  g.addColorStop(1, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  ctx.beginPath();
  ctx.arc(cx, cx, 36, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx - 10, cx - 10, 10, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fill();

  const tex = new THREE.CanvasTexture(cv);
  _textureCache.set(hex, tex);
  return tex;
}

/* ─────────────────────────────────────────────
   Anatomical zone positions (world units)
 ───────────────────────────────────────────── */
const ZONE_POSITIONS = {
  Shoulders: { dots: [{ x: -0.20, y: 1.38, z: 0.07 }, { x: 0.20, y: 1.38, z: 0.07 }] },
  "Upper Chest": { dots: [{ x: 0, y: 1.29, z: 0.16 }, { x: -0.10, y: 1.27, z: 0.14 }, { x: 0.10, y: 1.27, z: 0.14 }] },
  Chest: { dots: [{ x: 0, y: 1.22, z: 0.17 }, { x: -0.11, y: 1.20, z: 0.14 }, { x: 0.11, y: 1.20, z: 0.14 }] },
  Waist: { dots: [{ x: 0, y: 1.05, z: 0.13 }, { x: -0.14, y: 1.05, z: 0.09 }, { x: 0.14, y: 1.05, z: 0.09 }] },
  Hips: { dots: [{ x: 0, y: 0.92, z: 0.16 }, { x: -0.19, y: 0.90, z: 0.11 }, { x: 0.19, y: 0.90, z: 0.11 }] },
  Torso: { dots: [{ x: 0, y: 1.14, z: 0.14 }, { x: -0.12, y: 1.13, z: 0.10 }, { x: 0.12, y: 1.13, z: 0.10 }] },
  Collar: { dots: [{ x: 0, y: 1.50, z: 0.09 }] },
  "Neck Base": { dots: [{ x: 0, y: 1.44, z: 0.10 }, { x: -0.06, y: 1.43, z: 0.09 }, { x: 0.06, y: 1.43, z: 0.09 }] },
};

/* ─────────────────────────────────────────────
   SpriteDot
 ───────────────────────────────────────────── */
function SpriteDot({ x, y, z, color, worldSize = 0.065 }) {
  const tex = useMemo(() => getDotTexture(color), [color]);
  return (
    <sprite position={[x, y, z]} scale={[worldSize, worldSize, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        depthTest
        depthWrite={false}
        sizeAttenuation
        toneMapped={false}
      />
    </sprite>
  );
}

/* ─────────────────────────────────────────────
   HeatmapDots
 ───────────────────────────────────────────── */
export function HeatmapDots({ analysisData = [] }) {
  const dots = useMemo(() => {
    const out = [];
    analysisData.forEach((zone) => {
      const def = ZONE_POSITIONS[zone.name];
      if (!def) return;
      const color = dotColor(zone.score, zone.type);
      def.dots.forEach((p) =>
        out.push({ ...p, color, key: `${zone.name}-${p.x}-${p.y}` })
      );
    });
    return out;
  }, [analysisData]);

  return (
    <>
      {dots.map((d) => (
        <SpriteDot key={d.key} x={d.x} y={d.y} z={d.z} color={d.color} />
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Loader
 ───────────────────────────────────────────── */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          color: "#A07850",
          fontWeight: "bold",
          fontFamily: "Didact Gothic",
          textAlign: "center",
          minWidth: "200px",
        }}
      >
        <div style={{ fontSize: "1.2rem", marginBottom: "8px" }}>
          Generating Digital Twin...
        </div>
        <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
          {Math.round(progress)}% Loaded
        </div>
      </div>
    </Html>
  );
}

/* ─────────────────────────────────────────────
   Avatar Model
 ───────────────────────────────────────────── */
export function SliderAvatarModel({
  cfg,
  avatarData,
  selections = {},
  pendingItem = null,
  previewItem = null,
  showHeatmap = false,
  viewMode = "Textured",
}) {
  const { scene } = useGLTF("/avatar.glb", true);
  const originalMaterialsRef = useRef(new Map());

  const DEFAULTS = {
    height: 170, waist: 104, hips: 128,
    chest: 122, shoulders: 60, arm: 80, leg: 120,
  };

  /* ── Morph helpers ── */
  const applyMorph = (obj, gender, part, value) => {
    if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;

    const tokenize = (val) =>
      String(val || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .split("_")
        .filter(Boolean)
        .map((t) =>
          t.replace(/hips/g, "hip").replace(/shoulders/g, "shoulder")
        );

    const find = (meshObj, suffix) => {
      const dict = meshObj.morphTargetDictionary;
      const gT = gender.toLowerCase();
      const pT = part
        .toLowerCase()
        .replace(/hips/g, "hip")
        .replace(/shoulders/g, "shoulder");
      const tT = [gT, pT, suffix.toLowerCase()];
      return Object.keys(dict).find((k) => {
        const kT = tokenize(k);
        return tT.every((t) => kT.includes(t));
      });
    };

    const smallKey = find(obj, "Smaller");
    if (smallKey !== undefined) {
      // Clamp strictly to [0,1] to avoid floating-point shader imprecision (X4122)
      const clamped = Math.max(0, Math.min(1, value));
      obj.morphTargetInfluences[obj.morphTargetDictionary[smallKey]] = clamped;
    }
  };

  const applyClothSizeMorph = (obj, sizeLabel) => {
    if (!obj.morphTargetDictionary || !obj.morphTargetInfluences) return;
    const dict = obj.morphTargetDictionary;
    const influences = obj.morphTargetInfluences;
    for (let i = 0; i < influences.length; i++) influences[i] = 0;

    const label = String(sizeLabel || "M").trim().toUpperCase();
    const matchKey = Object.keys(dict).find((k) => {
      const ku = k.trim().toUpperCase();
      return (
        ku === label ||
        ku === `SIZE_${label}` ||
        ku === `FIT_${label}` ||
        ku === `CLOTH_${label}` ||
        ku === `SHAPE_${label}` ||
        ku.startsWith(`${label}_`) ||
        ku.endsWith(`_${label}`) ||
        ku.includes(`_${label}_`) ||
        ku === label.toLowerCase() ||
        ku === `size_${label.toLowerCase()}`
      );
    });

    if (matchKey !== undefined) {
      influences[dict[matchKey]] = 1.0;
    }
  };

  /* ── Robust Mesh Matching Helper ── */
  const getCleanName = (name) => {
    return String(name || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ""); // strip dots, underscores, spaces, etc.
  };

  /* ── Confirmed outfit map ── */
  const confirmedOutfit = useMemo(() => {
    const outfit = new Map();

    const add = (item, category, isPreview = false) => {
      if (!item) return;
      const rawMeshName = (
        item.resolvedName ||
        item.item?.meshName ||
        item.meshName ||
        item.item?.mesh ||
        item.mesh ||
        item.item?.name ||
        item.name ||
        ""
      ).trim();

      if (!rawMeshName) return;

      const cleanKey = getCleanName(rawMeshName);
      outfit.set(cleanKey, {
        item,
        category,
        meshName: rawMeshName,
        renderOrder: RENDER_ORDER[category] ?? 1,
        isPreview,
      });
    };

    const pending = pendingItem || previewItem;
    const pCat = pending ? getItemCategory(pending) : null;

    const activeHat = pCat === "hat" ? pending : selections.hat;
    const activeSpecial = pCat === "special" ? pending : selections.special;
    const activeDress = pCat === "dress" ? pending : selections.dress;
    const activeTop = pCat === "top" ? pending : selections.top;
    const activeBottom = pCat === "bottom" ? pending : selections.bottom;
    const activeFootwear = pCat === "footwear" ? pending : selections.footwear;

    if (activeSpecial) {
      add(activeSpecial, "special", activeSpecial === pending);
      add(activeFootwear, "footwear", activeFootwear === pending);
    } else if (activeDress) {
      add(activeDress, "dress", activeDress === pending);
      add(activeFootwear, "footwear", activeFootwear === pending);
    } else {
      add(activeTop, "top", activeTop === pending);
      add(activeBottom, "bottom", activeBottom === pending);
      add(activeFootwear, "footwear", activeFootwear === pending);
    }

    // Hat is always additive — independent of all other slots
    add(activeHat, "hat", activeHat === pending);

    return outfit;
  }, [selections, pendingItem, previewItem]);

  /* ── Main scene effect ── */
  useEffect(() => {
    if (!scene) return;

    const gender = (cfg?.gender || avatarData?.gender || "female").toLowerCase();
    const height = cfg?.height ?? DEFAULTS.height;
    const waist = cfg?.waist ?? DEFAULTS.waist;
    const hips = cfg?.hips ?? DEFAULTS.hips;
    const chest = cfg?.chest ?? DEFAULTS.chest;
    const shoulderW = cfg?.shoulders ?? DEFAULTS.shoulders;
    const armLength = cfg?.armLength ?? DEFAULTS.arm;
    const legLength = cfg?.legLength ?? DEFAULTS.leg;
    const hairType = cfg?.hair || "hair_long";
    const avatarMinLabel = normalizeSizeLabel(avatarData?.size) || "M";

    const ranges = MORPH_RANGES[gender] || MORPH_RANGES.female;

    const getMorphVal = (val, key) => {
      const [min, max] = ranges[key];
      // Use epsilon to prevent division by zero in shader (X4008)
      const diff = Math.max(0.0001, Math.abs(max - min));
      return Math.max(0, Math.min(1, (max - val) / diff));
    };

    const [heightMin, heightMax] = ranges.height;
    const hRange = Math.max(0.001, heightMax - heightMin);
    const heightScale = 0.88 + ((height - heightMin) / hRange) * 0.20;

    const waistMorph = getMorphVal(waist, "waist");
    const hipsMorph = getMorphVal(hips, "hips");
    const chestMorph = getMorphVal(chest, "chest");
    const shouldersMorph = getMorphVal(shoulderW, "shoulders");
    const armMorph = getMorphVal(armLength, "arm");
    const legMorph = getMorphVal(legLength, "leg");

    // ── Step 1: hide everything ──
    scene.traverse((obj) => {
      const n = obj.name || "";
      const isBody = BODY_MESH_NAMES.has(n);
      const isHair =
        n.startsWith("F_hair") || n.startsWith("M_hair") ||
        n.startsWith("hair_") || n === "male_short_hair" || n === "male_1";
      if (obj.isMesh || isHair) obj.visible = false;
    });

    // ── Step 2: show correct gender body ──
    scene.traverse((obj) => {
      const n = obj.name || "";
      if (
        gender === "female" &&
        (n === "Female_Body" || n === "Female_Root" || n === "LOD7_aiStandardSurface1_0")
      ) obj.visible = true;
      if (
        gender === "male" &&
        (n === "Male_body" || n === "Male_Root" || n === "Male1_aiStandardSurface1_0")
      ) obj.visible = true;
    });

    // ── Step 3: show selected hair ──
    if (hairType) {
      scene.traverse((obj) => {
        if (obj.name === hairType) {
          obj.visible = true;
          let p = obj.parent;
          while (p && p !== scene) { p.visible = true; p = p.parent; }
          if (obj.isMesh) {
            obj.renderOrder = RENDER_ORDER.hair;
            const mats = Array.isArray(obj.material)
              ? obj.material
              : [obj.material];
            mats.forEach((m) => {
              if (m) { m.depthTest = true; m.depthWrite = true; }
            });
          }
        }
      });
    }

    // ── Step 4: show confirmed outfit meshes ──
    scene.traverse((obj) => {
      if (obj.isMesh && !isBodyOrHairMesh(obj.name)) {
        const cleanName = getCleanName(obj.name);
        const slot = confirmedOutfit.get(cleanName);
        if (slot) {
          obj.visible = true;
          obj.renderOrder = slot.renderOrder;
        }
      }
    });

    // ── Step 5: apply morphs, scales, materials ──
    scene.traverse((obj) => {
      const objName = obj.name || "";
      const objNameLow = objName.toLowerCase();
      const isBodyHair = isBodyOrHairMesh(objName);

      // Height scale on skeleton root
      if (
        (gender === "male" && objName === "Male_Root") ||
        (gender === "female" && objName === "Female_Root")
      ) {
        const finalScale = isFinite(heightScale) ? heightScale : 1.0;
        obj.scale.set(1, finalScale, 1);
        obj.position.y = -0.152; // Shifted 6 inches down (2x 3 inches)
      }

      // Morph targets
      if (obj.isMesh && obj.visible && obj.morphTargetDictionary) {
        const cleanName = getCleanName(objName);
        const slot = confirmedOutfit.get(cleanName);
        const isCloth = !!slot && !isBodyHair;

        if (isCloth && slot.item) {
          const picked = normalizeSizeLabel(slot.item?.size) || avatarMinLabel;
          const clothSize = clampClothSizeToAvatarMin(picked, avatarMinLabel);
          applyClothSizeMorph(obj, clothSize);
        }

        applyMorph(obj, gender, "Waist", waistMorph);
        applyMorph(obj, gender, "Hips", hipsMorph);
        applyMorph(obj, gender, "Chest", chestMorph);
        applyMorph(obj, gender, "Shoulders", shouldersMorph);
        applyMorph(obj, gender, "Arm", armMorph);
        applyMorph(obj, gender, "Leg", legMorph);

        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => { if (m) m.needsUpdate = true; });
        }
      }

      // Bone length scaling
      if (objName === "arm_L" || objName === "arm_R") {
        const v = isFinite(armLength) ? armLength : DEFAULTS.arm;
        obj.scale.y = Math.max(0.001, v / 60);
      }
      if (objName === "leg_L" || objName === "leg_R") {
        const v = isFinite(legLength) ? legLength : DEFAULTS.leg;
        obj.scale.y = Math.max(0.001, v / 80);
      }

      // Colour tinting
      if (obj.isMesh && obj.visible && !isBodyHair) {
        const cleanName = getCleanName(objName);
        const slot = confirmedOutfit.get(cleanName);
        if (slot?.item) {
          if (!originalMaterialsRef.current.has(obj.uuid)) {
            originalMaterialsRef.current.set(
              obj.uuid,
              cloneMaterialStructure(obj.material)
            );
          }
          const baseline = originalMaterialsRef.current.get(obj.uuid);

          if (obj.userData.__clothTintedMaterials) {
            disposeOwnedMaterials(obj.userData.__clothTintedMaterials);
          }

          const tinted = cloneMaterialStructure(baseline);
          applyClothingSolidColor(tinted, slot.item.color || "#ffffff");

          const mats = Array.isArray(tinted) ? tinted : [tinted];
          mats.forEach((m) => {
            if (!m) return;
            m.polygonOffset = true;
            m.polygonOffsetFactor = -1;
            m.polygonOffsetUnits = -4;
            m.transparent = false;
            m.opacity = 1.0;

            // If it's a hat, we often want the solid color to win over any dark baked texture
            if (slot.category === "hat") {
              m.map = null;
              m.depthTest = true;
              m.depthWrite = true;
            }
          });

          obj.material = tinted;
          obj.userData.__clothTintedMaterials = tinted;
        }
      }

      // Wireframe toggle
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m) { m.wireframe = viewMode === "Mesh"; m.needsUpdate = true; }
        });
      }
    });

    scene.updateMatrixWorld(true);

    // ── Auto-center logic (FIXED) ──
    // Reset scene position before measuring to avoid alternating/jumping offsets
    scene.position.x = 0;
    scene.position.z = 0;
    scene.updateMatrixWorld(true);

    let bodyObj = null;
    scene.traverse((obj) => {
      if (obj.isMesh && obj.visible && BODY_MESH_NAMES.has(obj.name)) {
        bodyObj = obj;
      }
    });

    if (bodyObj) {
      const box = new THREE.Box3().setFromObject(bodyObj);
      const center = new THREE.Vector3();
      box.getCenter(center);
      // Align the body's horizontal center to the origin
      scene.position.x = -center.x;
      scene.position.z = -center.z;
    }
    
    scene.updateMatrixWorld(true);
  }, [scene, cfg, avatarData, confirmedOutfit, pendingItem, previewItem, viewMode]);

  // Cleanup owned materials on unmount
  useEffect(() => {
    return () => {
      originalMaterialsRef.current.forEach((m) => {
        try { deepDispose({ material: m }); } catch (_) { }
      });
      originalMaterialsRef.current.clear();
    };
  }, []);

  return <primitive object={scene} />;
}

useGLTF.preload("/avatar.glb");

/* ─────────────────────────────────────────────
   useOutfitState — Hook to manage outfit selections
 ───────────────────────────────────────────── */
export function useOutfitState() {
  const [selections, setSelections] = useState({
    hat: null,
    top: null,
    bottom: null,
    dress: null,
    footwear: null,
    special: null,
  });
  const [pendingItem, setPendingItem] = useState(null);

  const selectItem = (item) => {
    if (!item) return;
    const category = getItemCategory(item);
    setSelections((prev) => {
      const next = { ...prev };
      if (category === "dress") {
        next.top = null; next.bottom = null; next.special = null;
      } else if (category === "special") {
        next.top = null; next.bottom = null; next.dress = null;
      } else if (category === "top" || category === "bottom") {
        next.dress = null; next.special = null;
      }
      next[category] = item;
      return next;
    });
  };

  const removeSlot = (category) => {
    setSelections((prev) => ({ ...prev, [category]: null }));
  };

  return { selections, setSelections, selectItem, removeSlot, pendingItem, setPendingItem };
}

/* ─────────────────────────────────────────────
   AvatarCanvas — wraps R3F Canvas
   
   KEY FIX: pass `gl` props to the Canvas to use the same
   powerPreference as the thumbnail renderer, reducing
   context loss. Also use `frameloop="demand"` to avoid
   continuous re-renders when nothing is changing.
 ───────────────────────────────────────────── */
export default function AvatarCanvas(props) {
  const {
    avatarData,
    avatarConfig,
    gender,
    selections = {},
    pendingItem = null,
    previewItem = null,
    analysisData = [],
    showHeatmap = false,
    viewMode = "Textured",
  } = props;

  const controlsRef = useRef();
  const [isLocked, setIsLocked] = useState(false);
  const [zoom, setZoom] = useState(45.0); // Default distance (increased for smaller appearance)

  const AVATAR_CENTER = [0, 0.85, 0];
  const DIST = 45.0;

  const CAMERA_PRESETS = {
    front: { pos: [0, 0.85, DIST], target: AVATAR_CENTER },
    side: { pos: [DIST, 0.85, 0], target: AVATAR_CENTER },
    threeQuarter: { pos: [DIST * 0.7, 0.85, DIST * 0.7], target: AVATAR_CENTER },
    top: { pos: [0, DIST + 2, 0.001], target: AVATAR_CENTER },
  };

  const setView = (type) => {
    if (!controlsRef.current) return;
    const { pos, target } = CAMERA_PRESETS[type];
    const camera = controlsRef.current.object;

    // Animate or jump
    camera.position.set(...pos);
    controlsRef.current.target.set(...target);
    controlsRef.current.update();
    setZoom(camera.position.distanceTo(controlsRef.current.target));
  };

  const handleZoom = (e) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    if (!controlsRef.current) return;

    const controls = controlsRef.current;
    const camera = controls.object;
    const target = controls.target;

    // Direction vector from target to camera
    const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
    // New position based on distance
    const newPos = new THREE.Vector3().addVectors(target, dir.multiplyScalar(val));
    camera.position.copy(newPos);
    controls.update();
  };

  const cfg = useMemo(() => {
    const activeGender = (
      gender ||
      avatarConfig?.gender ||
      avatarData?.gender ||
      "female"
    ).toLowerCase();
    if (avatarConfig)
      return { ...avatarConfig, gender: activeGender, __from: "measurements" };
    return {
      gender: activeGender,
      body_type: (avatarData?.body_type || "average").toLowerCase(),
      hair: "hair_long",
    };
  }, [avatarConfig, avatarData, gender]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: "500px",
        position: "relative",
      }}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0.85, 45.0], fov: 45 }}
          // demand frameloop — only re-renders when state/props change,
          // dramatically reducing GPU pressure that causes context loss
          frameloop="demand"
          gl={{ ...DEFAULT_GL_SETTINGS, preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.error("❌ AvatarCanvas: WebGL Context Lost!");
            }, false);
          }}
        >
          <Suspense fallback={<Loader />}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[7, 7, 7]} intensity={1.2} />
            <SliderAvatarModel {...props} cfg={cfg} />
            <Environment preset="city" />
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              enableRotate={!isLocked}
              minDistance={2}
              maxDistance={300}
              target={[0, 0.85, 0]}
              makeDefault
            />
          </Suspense>
        </Canvas>
      </CanvasErrorBoundary>

      {/* ── 3D Controls Overlay ── */}
      <div className="absolute top-6 right-6 flex flex-col gap-4 z-30 pointer-events-none">
        {/* Preset Views */}
        <div className="flex flex-col gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl pointer-events-auto shadow-2xl">
          {[
            { id: 'front', label: 'Front', icon: '👤' },
            { id: 'side', label: 'Side', icon: '👤' },
            { id: 'threeQuarter', label: '3/4', icon: '👤' },
            { id: 'top', label: 'Top', icon: '👤' }
          ].map((view) => (
            <button
              key={view.id}
              onClick={() => setView(view.id)}
              className="w-14 h-14 flex flex-col items-center justify-center rounded-2xl bg-white/5 hover:bg-white/15 border border-white/5 transition-all duration-300 hover:scale-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] group"
              title={`${view.label} View`}
            >
              <span className="text-[10px] font-black uppercase text-white/40 group-hover:text-white transition">{view.label}</span>
            </button>
          ))}
        </div>

        {/* Lock Rotation */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center gap-1 border transition-all duration-300 hover:scale-125 pointer-events-auto shadow-2xl ${isLocked
            ? "bg-[#8a7c65] border-[#8a7c65] text-white shadow-[0_0_20px_rgba(138,124,101,0.4)]"
            : "bg-black/40 backdrop-blur-xl border-white/10 text-white/60 hover:bg-black/60 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            }`}
        >
          <span className="text-xl">{isLocked ? "🔒" : "🔓"}</span>
          <span className="text-[9px] font-black uppercase tracking-tighter">Rotation</span>
        </button>
      </div>

      {/* Zoom Slider (Bottom) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] z-30 pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-white/40 uppercase">Zoom</span>
          <input
            type="range"
            min="2"
            max="300"
            step="1"
            value={zoom}
            onChange={handleZoom}
            className="flex-1 accent-[#8a7c65] bg-white/10 h-1 rounded-full appearance-none cursor-pointer"
          />
          <span className="text-[10px] font-black text-[#8a7c65] w-8">{zoom.toFixed(1)}</span>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #8a7c65;
          border-radius: 50%;
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}