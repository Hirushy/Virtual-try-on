// src/pages/measurements/BrandSizeData.js
// All brand-specific size charts for the Visual Search feature.
// Top → use bust; Bottom → use waist; Dress → use max(bust, waist, hips)

export const BRAND_SIZE_DATA = {
    ZARA: {
        TOP: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 92 }, { size: "L", min: 92, max: 96 }, { size: "XL", min: 96, max: 100 }, { size: "XXL", min: 100, max: 106 }],
        BOTTOM: [{ size: "XS", min: 60, max: 64 }, { size: "S", min: 64, max: 68 }, { size: "M", min: 68, max: 72 }, { size: "L", min: 72, max: 76 }, { size: "XL", min: 76, max: 80 }, { size: "XXL", min: 80, max: 86 }],
        DRESS: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 92 }, { size: "L", min: 92, max: 96 }, { size: "XL", min: 96, max: 100 }, { size: "XXL", min: 100, max: 106 }],
    },
    HM: {
        TOP: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
        BOTTOM: [{ size: "XS", min: 60, max: 66 }, { size: "S", min: 66, max: 72 }, { size: "M", min: 72, max: 78 }, { size: "L", min: 78, max: 84 }, { size: "XL", min: 84, max: 90 }, { size: "XXL", min: 90, max: 98 }],
        DRESS: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
    },
    ASOS: {
        TOP: [{ size: "XS", min: 78, max: 83 }, { size: "S", min: 83, max: 88 }, { size: "M", min: 88, max: 93 }, { size: "L", min: 93, max: 100 }, { size: "XL", min: 100, max: 107 }, { size: "XXL", min: 107, max: 116 }],
        BOTTOM: [{ size: "XS", min: 60, max: 65 }, { size: "S", min: 65, max: 70 }, { size: "M", min: 70, max: 75 }, { size: "L", min: 75, max: 82 }, { size: "XL", min: 82, max: 90 }, { size: "XXL", min: 90, max: 98 }],
        DRESS: [{ size: "XS", min: 78, max: 83 }, { size: "S", min: 83, max: 88 }, { size: "M", min: 88, max: 93 }, { size: "L", min: 93, max: 100 }, { size: "XL", min: 100, max: 107 }, { size: "XXL", min: 107, max: 116 }],
    },
    SHEIN: {
        TOP: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 90 }, { size: "L", min: 90, max: 96 }, { size: "XL", min: 96, max: 102 }, { size: "XXL", min: 102, max: 110 }],
        BOTTOM: [{ size: "XS", min: 58, max: 62 }, { size: "S", min: 62, max: 66 }, { size: "M", min: 66, max: 70 }, { size: "L", min: 70, max: 76 }, { size: "XL", min: 76, max: 82 }, { size: "XXL", min: 82, max: 90 }],
        DRESS: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 90 }, { size: "L", min: 90, max: 96 }, { size: "XL", min: 96, max: 102 }, { size: "XXL", min: 102, max: 110 }],
    },
    BOOHOO: {
        TOP: [{ size: "XS", min: 80, max: 82 }, { size: "S", min: 82, max: 84 }, { size: "M", min: 84, max: 87 }, { size: "L", min: 87, max: 92 }, { size: "XL", min: 92, max: 98 }, { size: "XXL", min: 98, max: 106 }],
        BOTTOM: [{ size: "XS", min: 60, max: 62 }, { size: "S", min: 62, max: 66 }, { size: "M", min: 66, max: 70 }, { size: "L", min: 70, max: 76 }, { size: "XL", min: 76, max: 82 }, { size: "XXL", min: 82, max: 90 }],
        DRESS: [{ size: "XS", min: 80, max: 82 }, { size: "S", min: 82, max: 84 }, { size: "M", min: 84, max: 87 }, { size: "L", min: 87, max: 92 }, { size: "XL", min: 92, max: 98 }, { size: "XXL", min: 98, max: 106 }],
    },
    PLT: {
        TOP: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
        BOTTOM: [{ size: "XS", min: 60, max: 66 }, { size: "S", min: 66, max: 72 }, { size: "M", min: 72, max: 78 }, { size: "L", min: 78, max: 84 }, { size: "XL", min: 84, max: 90 }, { size: "XXL", min: 90, max: 98 }],
        DRESS: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
    },
    DARAZ: {
        TOP: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
        BOTTOM: [{ size: "XS", min: 60, max: 66 }, { size: "S", min: 66, max: 72 }, { size: "M", min: 72, max: 78 }, { size: "L", min: 78, max: 84 }, { size: "XL", min: 84, max: 90 }, { size: "XXL", min: 90, max: 98 }],
        DRESS: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 88 }, { size: "M", min: 88, max: 94 }, { size: "L", min: 94, max: 100 }, { size: "XL", min: 100, max: 106 }, { size: "XXL", min: 106, max: 114 }],
    },
    ODEL: {
        TOP: [{ size: "XS", min: 82, max: 86 }, { size: "S", min: 86, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
        BOTTOM: [{ size: "XS", min: 62, max: 66 }, { size: "S", min: 66, max: 70 }, { size: "M", min: 70, max: 76 }, { size: "L", min: 76, max: 82 }, { size: "XL", min: 82, max: 88 }, { size: "XXL", min: 88, max: 96 }],
        DRESS: [{ size: "XS", min: 82, max: 86 }, { size: "S", min: 86, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
    },
    FASHION_BUG: {
        TOP: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
        BOTTOM: [{ size: "XS", min: 60, max: 66 }, { size: "S", min: 66, max: 72 }, { size: "M", min: 72, max: 78 }, { size: "L", min: 78, max: 84 }, { size: "XL", min: 84, max: 90 }, { size: "XXL", min: 90, max: 98 }],
        DRESS: [{ size: "XS", min: 80, max: 84 }, { size: "S", min: 84, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
    },
    MIMOSA: {
        TOP: [{ size: "XS", min: 82, max: 86 }, { size: "S", min: 86, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
        BOTTOM: [{ size: "XS", min: 62, max: 66 }, { size: "S", min: 66, max: 70 }, { size: "M", min: 70, max: 76 }, { size: "L", min: 76, max: 82 }, { size: "XL", min: 82, max: 88 }, { size: "XXL", min: 88, max: 96 }],
        DRESS: [{ size: "XS", min: 82, max: 86 }, { size: "S", min: 86, max: 90 }, { size: "M", min: 90, max: 96 }, { size: "L", min: 96, max: 102 }, { size: "XL", min: 102, max: 108 }, { size: "XXL", min: 108, max: 116 }],
    },
    ALIEXPRESS: {
        TOP: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 92 }, { size: "L", min: 92, max: 98 }, { size: "XL", min: 98, max: 104 }, { size: "XXL", min: 104, max: 112 }],
        BOTTOM: [{ size: "XS", min: 58, max: 62 }, { size: "S", min: 62, max: 66 }, { size: "M", min: 66, max: 72 }, { size: "L", min: 72, max: 78 }, { size: "XL", min: 78, max: 84 }, { size: "XXL", min: 84, max: 92 }],
        DRESS: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 92 }, { size: "L", min: 92, max: 98 }, { size: "XL", min: 98, max: 104 }, { size: "XXL", min: 104, max: 112 }],
    },
    TEMU: {
        TOP: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 92 }, { size: "L", min: 92, max: 98 }, { size: "XL", min: 98, max: 104 }, { size: "XXL", min: 104, max: 112 }],
        BOTTOM: [{ size: "XS", min: 58, max: 62 }, { size: "S", min: 62, max: 66 }, { size: "M", min: 66, max: 72 }, { size: "L", min: 72, max: 78 }, { size: "XL", min: 78, max: 84 }, { size: "XXL", min: 84, max: 92 }],
        DRESS: [{ size: "XS", min: 78, max: 82 }, { size: "S", min: 82, max: 86 }, { size: "M", min: 86, max: 92 }, { size: "L", min: 92, max: 98 }, { size: "XL", min: 98, max: 104 }, { size: "XXL", min: 104, max: 112 }],
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS: lists & display names
// ─────────────────────────────────────────────────────────────────────────────
export const BRAND_LIST = Object.keys(BRAND_SIZE_DATA);

export const BRAND_DISPLAY_NAMES = {
    ZARA: "Zara",
    HM: "H&M",
    ASOS: "ASOS",
    SHEIN: "SHEIN",
    BOOHOO: "Boohoo",
    PLT: "PrettyLittleThing",
    DARAZ: "Daraz",
    ODEL: "Odel",
    FASHION_BUG: "Fashion Bug",
    MIMOSA: "Mimosa",
    ALIEXPRESS: "AliExpress",
    TEMU: "Temu",
};

// ─────────────────────────────────────────────────────────────────────────────
// BRAND FIT CLASSIFICATION
//
//  RUNS_SMALL  → cuts small; we recommend one size up.
//  (all others) → true-to-size or relaxed; keep the avatar's declared size.
// ─────────────────────────────────────────────────────────────────────────────
const RUNS_SMALL_BRANDS = new Set([
    "ZARA", "ODEL", "MIMOSA", "SHEIN", "ALIEXPRESS", "TEMU", "DARAZ",
]);

// ─────────────────────────────────────────────────────────────────────────────
// SIZE LADDER — complete order used to step up by one size
//
// Full mapping for all sizes:
//   XS  → S   (runs-small brands)
//   S   → M
//   M   → L
//   L   → XL
//   XL  → XXL
//   XXL → 3XL
// ─────────────────────────────────────────────────────────────────────────────
const SIZE_LADDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];

function stepUpSize(size) {
    const idx = SIZE_LADDER.indexOf(size?.toUpperCase());
    if (idx === -1 || idx >= SIZE_LADDER.length - 1) return size; // unknown or already at max
    return SIZE_LADDER[idx + 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// AVATAR SIZE RESOLVER
//
// Priority order:
//  1. avatarConfig.size   — the size the user explicitly chose (XS / S / M …)
//  2. Measurement fallback — used when avatar was built with body sliders only
// ─────────────────────────────────────────────────────────────────────────────
const STANDARD_SIZES = new Set(["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"]);

function resolveAvatarSize(avatarConfig, garmentType, { bust = 0, waist = 0, hips = 0 }) {
    // ── 1. Prefer the declared size label ────────────────────────────────────
    const declared = avatarConfig?.size?.toUpperCase?.();
    if (declared && STANDARD_SIZES.has(declared)) return declared;

    // ── 2. Fallback: derive from measurements using generic bands ────────────
    // (only reached when no size label was set on the avatar)
    let measure;
    if (garmentType === "BOTTOM") measure = waist;
    else if (garmentType === "DRESS") measure = Math.max(bust, waist, hips);
    else measure = bust; // TOP

    if (measure < 80) return "XS";
    if (measure < 88) return "S";
    if (measure < 96) return "M";
    if (measure < 104) return "L";
    if (measure < 112) return "XL";
    return "XXL";
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT: getRecommendedBrandSize
//
// The single source of truth for all size recommendations.
//
// Logic (simple and clear):
//  1. Get the avatar's size label (e.g. "XS", "M", "XL").
//  2. If brand runs small → step up one size (XS→S, M→L, XL→XXL, etc.).
//  3. If brand is true-to-size → keep the avatar's size as-is.
//  4. Return the result with a badge colour key and a user-facing note.
//
// Size mapping by brand group (for every avatar size):
//
//  Avatar │ True-to-size brands          │ Runs-small brands
//  ───────│──────────────────────────────│───────────────────
//  XS     │ XS  (ASOS, H&M, Boohoo …)   │ S   (Zara, SHEIN …)
//  S      │ S                            │ M
//  M      │ M                            │ L
//  L      │ L                            │ XL
//  XL     │ XL                           │ XXL
//  XXL    │ XXL                          │ 3XL
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param {string}  brandKey      - e.g. "ZARA", "ASOS", "SHEIN"
 * @param {string}  garmentType   - "TOP" | "BOTTOM" | "DRESS"
 * @param {{ bust?: number, waist?: number, hips?: number }} measurements
 * @param {object}  avatarConfig  - must include `.size` (e.g. "XS") when set
 * @returns {{ size: string, fit: string, note: string, baseSize: string } | null}
 */
export function getRecommendedBrandSize(
    brandKey,
    garmentType,
    { bust = 0, waist = 0, hips = 0 } = {},
    avatarConfig = {}
) {
    const brandUpper = brandKey?.toUpperCase();
    const displayName = BRAND_DISPLAY_NAMES[brandUpper] ?? brandUpper;

    if (!BRAND_SIZE_DATA[brandUpper]) return null;

    const typeKey = (garmentType?.toUpperCase()) || "TOP";

    // ── Step 1: resolve avatar's base size ───────────────────────────────────
    const baseSize = resolveAvatarSize(avatarConfig, typeKey, { bust, waist, hips });

    // ── Step 2: apply brand-fit rule ─────────────────────────────────────────
    const isRunsSmall = RUNS_SMALL_BRANDS.has(brandUpper);
    const finalSize = isRunsSmall ? stepUpSize(baseSize) : baseSize;

    // ── Step 3: choose fit badge & note ──────────────────────────────────────
    let fit, note;

    if (isRunsSmall) {
        fit = "slightly_snug"; // → amber "Slightly Snug" badge
        note = finalSize !== baseSize
            ? `${displayName} runs small — sizing up from ${baseSize} to ${finalSize} is recommended.`
            : `${displayName} runs small — ${finalSize} is the largest size available.`;
    } else {
        fit = "perfect"; // → green "Perfect Fit" badge
        note = `${displayName} fits true to size — ${finalSize} is your ideal fit.`;
    }

    return {
        size: finalSize,   // ← the size shown in the UI badge
        fit,                   // ← key into FIT_CONFIG in VisualSearchPanel.jsx
        note,                  // ← explanation shown below the badge
        baseSize,              // ← avatar's original size before brand adjustment
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: map AI-detected garment label → canonical type key
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Converts a detected garment category string → "TOP" | "BOTTOM" | "DRESS"
 */
export function categoryToGarmentType(category = "") {
    const c = category.toLowerCase();

    // Check DRESS first — "maxi/midi/mini" could partially match "bottom" otherwise
    if (c.includes("dress") || c.includes("maxi") || c.includes("midi") || c.includes("mini"))
        return "DRESS";

    if (c.includes("skirt") || c.includes("bottom") || c.includes("jean") ||
        c.includes("pant") || c.includes("trouser") || c.includes("short"))
        return "BOTTOM";

    if (c.includes("top") || c.includes("shirt") || c.includes("blouse") ||
        c.includes("crop") || c.includes("t-shirt") || c.includes("sleeve"))
        return "TOP";

    // Activewear, loungewear → TOP
    if (c.includes("lounge") || c.includes("active") || c.includes("special"))
        return "TOP";

    return "TOP"; // safe fallback
}