/**
 * AvatarConstants.js
 * Centralized business logic and constants for the 3D Avatar Rendering system.
 */

import * as THREE from "three";

/* ─────────────────────────────────────────────
   Singleton WebGL Renderer (for thumbnails)
   ───────────────────────────────────────────── */
let _thumbRenderer = null;
let _thumbRendererSize = 140;

export function getThumbnailRenderer(size = 140) {
  if (typeof window === "undefined") return null;

  // Context lost check
  if (_thumbRenderer) {
    try {
      const ctx = _thumbRenderer.getContext();
      if (!ctx || ctx.isContextLost()) {
        console.warn("⚠️ Thumbnail renderer context lost. Recreating...");
        try { _thumbRenderer.dispose(); } catch (_) { }
        _thumbRenderer = null;
      } else {
        // Only call setSize if dimensions changed to avoid unnecessary redraws
        if (_thumbRendererSize !== size) {
          _thumbRenderer.setSize(size, size);
          _thumbRendererSize = size;
        }
        return _thumbRenderer;
      }
    } catch (_) {
      try { _thumbRenderer.dispose(); } catch (__) { }
      _thumbRenderer = null;
    }
  }

  try {
    // Use low-power hint to reduce GPU pressure alongside main Canvas
    _thumbRenderer = new THREE.WebGLRenderer({
      antialias: false,           // disabled to reduce GPU load
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power", // avoids competing with main Canvas for GPU
      precision: "mediump",         // reduces shader precision warnings
    });
    _thumbRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    _thumbRenderer.setSize(size, size);
    _thumbRendererSize = size;

    // Listen for context loss so we can recreate next time
    _thumbRenderer.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      console.warn("⚠️ Thumbnail WebGL context lost event fired.");
      _thumbRenderer = null;
    }, { once: true });

    return _thumbRenderer;
  } catch (err) {
    console.error("❌ Failed to create singleton WebGL renderer:", err);
    return null;
  }
}

/**
 * Explicitly release the singleton thumbnail renderer.
 * Call this when the app unmounts or navigates away from the outfit builder.
 */
export function disposeThumbnailRenderer() {
  if (_thumbRenderer) {
    try { _thumbRenderer.dispose(); } catch (_) { }
    _thumbRenderer = null;
  }
}

/**
 * Utility to dispose of a hierarchy of objects to free WebGL memory.
 */
export function deepDispose(obj) {
  if (!obj) return;
  // Support both plain objects with .material and full scene graphs
  const target = obj.traverse ? obj : null;
  if (target) {
    target.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        if (child.geometry) child.geometry.dispose();
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => { if (m) m.dispose(); });
      }
    });
  } else {
    // Fallback: dispose direct material reference
    if (obj.material) {
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => { if (m) m.dispose(); });
    }
    if (obj.geometry) obj.geometry.dispose();
  }
}

/* ─────────────────────────────────────────────
   Colour helpers
 ───────────────────────────────────────────── */
export function toThreeColor(input) {
  const s = String(input || "").trim();
  const c = new THREE.Color();
  if (s.startsWith("#")) {
    try { c.setStyle(s); return c; } catch { return new THREE.Color("#ffffff"); }
  }
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (m) {
    return new THREE.Color(
      parseInt(m[1], 10) / 255,
      parseInt(m[2], 10) / 255,
      parseInt(m[3], 10) / 255,
    );
  }
  try {
    if (s) c.setStyle(s); else c.setStyle("#ffffff");
    return c;
  } catch { return new THREE.Color("#ffffff"); }
}

export function cloneMaterialStructure(source) {
  if (!source) return source;
  return Array.isArray(source) ? source.map((m) => m.clone()) : source.clone();
}

export function disposeOwnedMaterials(material) {
  if (!material) return;
  const arr = Array.isArray(material) ? material : [material];
  arr.forEach((mat) => { if (mat) mat.dispose?.(); });
}

export function applyClothingSolidColor(material, colorInput) {
  const mats = Array.isArray(material) ? material : [material];
  const c = colorInput instanceof THREE.Color ? colorInput : toThreeColor(colorInput);
  mats.forEach((mat) => {
    if (!mat) return;
    if (mat.color) mat.color.copy(c);
    if (mat.emissive) mat.emissive.setRGB(0, 0, 0);
    if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0;  // was 0.001 — caused X4122 shader warning
    if (mat.metalness !== undefined) mat.metalness = 0;
    if (mat.roughness !== undefined) mat.roughness = 1;
    mat.needsUpdate = true;
  });
}

/* ─────────────────────────────────────────────
   MORPH RANGES (Synced across Studio and Builder)
 ───────────────────────────────────────────── */
export const MORPH_RANGES = {
  female: { height: [140, 210], chest: [70, 140], waist: [55, 130], hips: [70, 140], shoulders: [30, 60], arm: [45, 80], leg: [60, 120] },
  male: { height: [150, 215], chest: [75, 150], waist: [60, 140], hips: [78, 155], shoulders: [38, 62], arm: [54, 76], leg: [88, 132] },
};

export const SIZE_ORDER_LIST = ["XS", "S", "M", "L", "XL", "XXL"];

/* ─────────────────────────────────────────────
   MESH NAMES & RECOGNITION
 ───────────────────────────────────────────── */
export const BODY_MESH_NAMES = new Set([
  "Female_Body", "Female_Root", "LOD7_aiStandardSurface1_0",
  "Male_body", "Male_Root", "Male1_aiStandardSurface1_0",
]);

export const isBodyOrHairMesh = (name = "") => {
  if (BODY_MESH_NAMES.has(name)) return true;
  if (name.startsWith("F_hair") || name.startsWith("M_hair")) return true;
  if (name.startsWith("hair_") || name === "male_short_hair" || name === "male_1") return true;
  return false;
};

/* ─────────────────────────────────────────────
   RENDER ORDER & SLOTS
 ───────────────────────────────────────────── */
export const RENDER_ORDER = {
  body: 0,
  bottom: 1,
  top: 2,
  dress: 2,
  special: 2,
  footwear: 1,
  hat: 3,
  hair: 4,
};

export const EXCLUSIVE_CATEGORIES = new Set(["dress", "special"]);
export const REQUIRES_OK = new Set(["tops", "bottoms", "dresses", "footwear", "special", "hat"]);

/**
 * Determine the selection category key for an item based on its internal catalog data.
 */
export function getItemCategory(item) {
  if (!item) return "top";
  const cat = String(item?.__category || item?.category || "").toLowerCase();
  
  // 1. Bottoms
  if (cat.includes("bottom") || ["shorts", "skirts", "trousers", "jeans", "pants", "skirt", "trouser"].some(s => cat.includes(s))) {
    return "bottom";
  }
  // 2. Dresses
  if (cat.includes("dress") || ["midi", "maxi", "mini"].some(s => cat.includes(s))) {
    return "dress";
  }
  // 3. Special Categories
  if (cat.includes("special") || ["activewear", "loungewear"].some(s => cat.includes(s))) {
    return "special";
  }
  // 4. Footwear
  if (cat.includes("footwear") || ["shoe", "sneaker", "slipper", "sneakers", "slippers", "shoe"].some(s => cat.includes(s))) {
    return "footwear";
  }
  // 5. Hats
  if (cat.includes("hat") || cat.includes("cap")) {
    return "hat";
  }
  // 6. Hair
  if (cat.includes("hair")) {
    return "hair";
  }
  
  return "top";
}

/* ─────────────────────────────────────────────
   SIZE HELPERS
 ───────────────────────────────────────────── */
export function normalizeSizeLabel(label) {
  if (!label) return "M";
  const s = String(label).trim().toUpperCase();
  if (SIZE_ORDER_LIST.includes(s)) return s;
  return "M";
}

/**
 * Ensures a clothing item's size is not smaller than the avatar's body size.
 */
export function clampClothSizeToAvatarMin(pickedSizeLabel, avatarMinSizeLabel) {
  const ranks = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  const pIdx = ranks[normalizeSizeLabel(pickedSizeLabel)] ?? 2;
  const aIdx = ranks[normalizeSizeLabel(avatarMinSizeLabel)] ?? 2;
  return pIdx < aIdx
    ? normalizeSizeLabel(avatarMinSizeLabel)
    : normalizeSizeLabel(pickedSizeLabel);
}

/**
 * Returns an array of sizes from SIZE_ORDER_LIST that are >= the avatar's size.
 */
export function getAllowedSizes(avatarSizeLabel) {
  const ranks = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  const minRank = ranks[normalizeSizeLabel(avatarSizeLabel)] ?? 0;
  return SIZE_ORDER_LIST.filter((s) => (ranks[s] ?? 0) >= minRank);
}

/* ─────────────────────────────────────────────
   CLOTHING SIZE RECOMMENDATION
 ───────────────────────────────────────────── */
export const BODY_TO_CLOTH = {
  XS: ["XS"],
  S: ["S", "XS"],
  M: ["M", "S"],
  L: ["L", "M"],
  XL: ["XL", "L"],
  XXL: ["XXL", "XL"],
};

export function getRecommendedClothSize(bodySize) {
  return (BODY_TO_CLOTH[bodySize] || ["M"])[0];
}

/**
 * Calculates a recommended size string based on avatar config measurements.
 */
export function getRecommendedSize(cfg) {
  if (!cfg) return "M";
  if (cfg.chest || cfg.waist || cfg.hips) {
    const c = cfg.chest || 122;
    const w = cfg.waist || 104;
    const hi = cfg.hips || 128;
    const avgGirth = (c + w + hi) / 3;
    if (avgGirth < 85) return "XS";
    if (avgGirth < 95) return "S";
    if (avgGirth < 105) return "M";
    if (avgGirth < 115) return "L";
    if (avgGirth < 125) return "XL";
    return "XXL";
  }
  if (!cfg.partSizes) return "M";

  const weights = {
    height: 0.1, chest: 0.3, waist: 0.3, hips: 0.2,
    shoulders: 0.05, arm: 0.02, leg: 0.03,
  };
  const ranks = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };

  const score = Object.keys(weights).reduce((acc, k) => {
    const s = cfg.partSizes[k] || "M";
    return acc + (ranks[s] ?? 2) * weights[k];
  }, 0);

  if (score < 0.5) return "XS";
  if (score < 1.2) return "S";
  if (score < 2.0) return "M";
  if (score < 2.8) return "L";
  if (score < 3.8) return "XL";
  return "XXL";
}