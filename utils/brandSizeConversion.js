// src/utils/brandSizeConversion.js

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

// Exact per-brand offsets
const BRAND_PROFILES = {
  // ── Tight Fit (+1) ──────────────────────────
  Zara:               { type: "TIGHT",       offset: +1 },
  Odel:               { type: "TIGHT",       offset: +1 },
  Mimosa:             { type: "TIGHT",       offset: +1 },
  // ── True Size (0) ───────────────────────────
  ASOS:               { type: "TRUE",        offset:  0 },
  "Fashion Bug":      { type: "TRUE",        offset:  0 },
  // ── Relaxed Fit (dual — handled below) ──────
  "H&M":              { type: "RELAXED",     offset: -1 },
  Boohoo:             { type: "RELAXED",     offset: -1 },
  PrettyLittleThing:  { type: "RELAXED",     offset: -1 },
  // ── Small / Inconsistent (+1 or +2) ─────────
  SHEIN:              { type: "INCONSISTENT", offset: +2 },
  AliExpress:         { type: "INCONSISTENT", offset: +2 },
  Temu:               { type: "INCONSISTENT", offset: +2 },
  Daraz:              { type: "INCONSISTENT", offset: +1 },
};

export const TYPE_META = {
  TIGHT:        { label: "Tight Fit",           icon: "🧵", color: "#ef4444", bg: "#fef2f2", tip: "Runs small — size up" },
  TRUE:         { label: "True to Size",         icon: "⚖️", color: "#22c55e", bg: "#f0fdf4", tip: "Matches your body size" },
  RELAXED:      { label: "Relaxed Fit",          icon: "✨", color: "#3b82f6", bg: "#eff6ff", tip: "Runs large — dual option" },
  INCONSISTENT: { label: "Small / Inconsistent", icon: "🌏", color: "#f97316", bg: "#fff7ed", tip: "Asian sizing — size up" },
};

function shiftSize(base, steps) {
  const idx = SIZES.indexOf(base.toUpperCase());
  if (idx === -1) return base;
  return SIZES[Math.max(0, Math.min(SIZES.length - 1, idx + steps))];
}

/**
 * Returns { primary, secondary, type, meta }
 * secondary is only set for RELAXED brands (the "better fit" option)
 */
export function getBrandRecommendation(avatarSize, brandName) {
  const base = String(avatarSize || "M").trim().toUpperCase();
  const profile = BRAND_PROFILES[brandName];
  if (!profile) return { primary: base, secondary: null, type: "TRUE", meta: TYPE_META.TRUE };

  const meta = TYPE_META[profile.type];

  if (profile.type === "RELAXED") {
    // e.g. avatarSize M → "M (loose) OR S (better fit)"
    const loose      = shiftSize(base,  0);   // same as body size
    const betterFit  = shiftSize(base, -1);   // one down
    return { primary: loose, secondary: betterFit, type: profile.type, meta };
  }

  if (profile.type === "INCONSISTENT") {
    const up1 = shiftSize(base, +1);
    const up2 = shiftSize(base, +2);

    // XS or XXS: Just pick the next size up (S)
    if (base === "XS" || base === "XXS") {
      return { primary: up1, secondary: null, type: profile.type, meta };
    }

    // Daraz: Always +1
    if (brandName === "Daraz") {
      return { primary: up1, secondary: null, type: profile.type, meta };
    }

    // For M, L, XL, etc: Show range (e.g., L or XL)
    return { primary: up1, secondary: up2, type: profile.type, meta };
  }

  return {
    primary: shiftSize(base, profile.offset),
    secondary: null,
    type: profile.type,
    meta,
  };
}

export function getAllRecommendations(avatarSize) {
  return Object.keys(BRAND_PROFILES).map((brand) => ({
    brand,
    ...getBrandRecommendation(avatarSize, brand),
  }));
}

export const BRANDS_LIST = Object.keys(BRAND_PROFILES);
export const TYPE_ORDER  = ["TIGHT", "TRUE", "RELAXED", "INCONSISTENT"];
export const BRANDS_BY_TYPE = TYPE_ORDER.reduce((acc, type) => {
  acc[type] = Object.entries(BRAND_PROFILES)
    .filter(([, p]) => p.type === type)
    .map(([name]) => name);
  return acc;
}, {});
