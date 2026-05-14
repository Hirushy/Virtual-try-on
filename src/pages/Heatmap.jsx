import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import heroBg from "../assets/pink.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AvatarCanvas from "./measurements/AvatarCanvas";
import { ArrowLeftIcon, AlertTriangleIcon, ChevronRight } from "lucide-react";
import { getBrandRecommendation } from "../utils/brandSizeConversion";

/* ─────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────── */

// Standard size chart (cm) — used for ALL fit calculations
const SIZE_CHART = {
  XS: { chest: 82, waist: 63, hips: 87, shoulders: 36 },
  S: { chest: 88, waist: 69, hips: 93, shoulders: 38 },
  M: { chest: 94, waist: 75, hips: 99, shoulders: 40 },
  L: { chest: 100, waist: 81, hips: 105, shoulders: 42 },
  XL: { chest: 106, waist: 87, hips: 111, shoulders: 44 },
  XXL: { chest: 112, waist: 93, hips: 117, shoulders: 46 },
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

const PERFECT_FIT_KG = {
  XS: 28,
  S: 38,
  M: 48,
  L: 54,
  XL: 65,
  XXL: 80,
};



/* ─────────────────────────────────────────────────────────
   CORE FIT LOGIC

   RULE: The SELECTED CLOTH SIZE is always 0% / Perfect.
   Every other size is measured by how far its measurements
   deviate from the selected cloth size.

   Example — cloth selected = XL (chest 106, waist 87 ...):
     XL  → 0%  Perfect  (same as cloth)
     L   → 11% Tight    (L is smaller than XL → wearer would feel tight in L)
     M   → 32% Tight
     S   → 70% Tight
     XS  → 89% Tight
     XXL → 30% Loose    (XXL is bigger than XL → loose on same body)
───────────────────────────────────────────────────────── */

/**
 * Detect best matching body size — only used for the "Your Size" badge.
 * Does NOT affect fit calculations.
 */
function detectBodySize(user) {
  if (!user) return "M";
  let bestSize = "M";
  let smallestDiff = Infinity;
  for (const size of SIZE_ORDER) {
    const chart = SIZE_CHART[size];
    const diff =
      Math.abs((user.chest || 94) - chart.chest) +
      Math.abs((user.waist || 75) - chart.waist) +
      Math.abs((user.hips || 99) - chart.hips) +
      Math.abs((user.shoulders || 40) - chart.shoulders);
    if (diff < smallestDiff) { smallestDiff = diff; bestSize = size; }
  }
  return bestSize;
}

/**
 * MAX possible deviation between adjacent sizes on each axis.
 * XS→XXL total span used as 100% reference.
 */
const SPAN = {
  chest: SIZE_CHART.XXL.chest - SIZE_CHART.XS.chest,     // 30
  waist: SIZE_CHART.XXL.waist - SIZE_CHART.XS.waist,     // 30
  hips: SIZE_CHART.XXL.hips - SIZE_CHART.XS.hips,      // 30
  shoulders: SIZE_CHART.XXL.shoulders - SIZE_CHART.XS.shoulders, // 10
};
const SPAN_AVG = (SPAN.chest + SPAN.waist + SPAN.hips + SPAN.shoulders) / 4; // 25

/**
 * calculateFit(compareSize, selectedClothSize)
 *
 * Compares compareSize measurements vs selectedClothSize measurements.
 * selectedClothSize is ALWAYS perfect (0%).
 *
 * compareSize < selectedCloth → compareSize is smaller → wearer feels TIGHT in compareSize
 * compareSize > selectedCloth → compareSize is larger  → wearer feels LOOSE in compareSize
 */
function calculateKgFit(compareSize, userWeight) {
  const perfectKg = PERFECT_FIT_KG[compareSize] || 48;
  const rawDiff = userWeight - perfectKg;
  const diffAbs = Math.abs(rawDiff);
  const fitPercentage = Math.max(0, 100 - diffAbs);

  let status, direction;
  if (diffAbs <= 2) {
    status = "Perfect";
    direction = "perfect";
  } else if (rawDiff > 0) {
    direction = "tight";
    if (diffAbs <= 8) status = "Slightly Tight";
    else if (diffAbs <= 15) status = "Tight";
    else status = "Very Tight";
  } else {
    direction = "loose";
    if (diffAbs <= 8) status = "Slightly Loose";
    else if (diffAbs <= 15) status = "Loose";
    else status = "Very Loose";
  }

  return {
    status, direction,
    percentage: fitPercentage,
    rawDiff: Math.round(rawDiff * 10) / 10,
    diffs: { chest: 0, waist: 0, hips: 0, shoulders: 0 },
  };
}

function getHeatmapZones(compareSize, userMeasurements) {
  const compare = SIZE_CHART[compareSize];
  if (!compare || !userMeasurements) return [];

  const zones = [
    { name: "Shoulders", selVal: userMeasurements.shoulders, cmpVal: compare.shoulders, span: SPAN.shoulders },
    { name: "Chest", selVal: userMeasurements.chest, cmpVal: compare.chest, span: SPAN.chest },
    { name: "Waist", selVal: userMeasurements.waist, cmpVal: compare.waist, span: SPAN.waist },
    { name: "Hips", selVal: userMeasurements.hips, cmpVal: compare.hips, span: SPAN.hips },
  ];

  return zones.map(({ name, selVal, cmpVal, span }) => {
    const diff = selVal - cmpVal; // + -> user is bigger -> tight
    const devPct = Math.round(Math.min(100, (Math.abs(diff) / span) * 100));
    const score = Math.max(0, 100 - devPct);

    let type;
    if (diff > 2) type = "tight";
    else if (diff < -2) type = "loose";
    else type = "perfect";

    return {
      name,
      selVal, cmpVal,
      diff: Math.round(diff * 10) / 10,
      type,
      score: score,
      icon: type === "perfect" ? "✓" : (diff > 0 ? "↓" : "↑"),
      isCritical: score < 60,
      confidence: 0.95,
    };
  });
}

function getActiveZones(selections) {
  if (!selections || Object.keys(selections).length === 0) {
    return ["Shoulders", "Chest", "Waist", "Hips"];
  }

  const activeSet = new Set();
  let hasApparel = false;

  for (const key of Object.keys(selections)) {
    if (!selections[key]) continue;
    const k = key.toLowerCase();
    
    if (k.includes("top")) {
      activeSet.add("Chest");
      activeSet.add("Shoulders");
      hasApparel = true;
    }
    if (k.includes("bottom") || k.includes("pant") || k.includes("skirt")) {
      activeSet.add("Waist");
      activeSet.add("Hips");
      hasApparel = true;
    }
    if (k.includes("dress")) {
      activeSet.add("Chest");
      activeSet.add("Waist");
      activeSet.add("Hips");
      hasApparel = true;
    }
  }

  if (!hasApparel) return ["Shoulders", "Chest", "Waist", "Hips"];
  
  return Array.from(activeSet);
}

/* ─────────────────────────────────────────────────────────
   STYLE HELPERS
───────────────────────────────────────────────────────── */

function statusColor(status) {
  switch (status) {
    case "Very Tight": return { hex: "#B91C1C", bg: "#fecaca", label: "Very Tight" };
    case "Tight": return { hex: "#EF4444", bg: "#fee2e2", label: "Tight" };
    case "Slightly Tight": return { hex: "#EAB308", bg: "#fef9c3", label: "Slightly Tight" };
    case "Perfect": return { hex: "#22C55E", bg: "#dcfce7", label: "Perfect" };
    case "Slightly Loose": return { hex: "#60A5FA", bg: "#dbeafe", label: "Slightly Loose" };
    case "Loose": return { hex: "#3B82F6", bg: "#dbeafe", label: "Loose" };
    case "Very Loose": return { hex: "#1D4ED8", bg: "#bfdbfe", label: "Very Loose" };
    default: return { hex: "#A07850", bg: "#f5f0eb", label: "Unknown" };
  }
}

function zoneColor(type) {
  switch (type) {
    case "tight": return "#EF4444";
    case "snug": return "#EAB308";
    case "perfect": return "#22C55E";
    case "loose": return "#3B82F6";
    default: return "#A07850";
  }
}

/* ─────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────── */

function SizeCard({ size, fit, isBody, isRecommended, isSelected, onClick }) {
  const isPerfect = fit.status === "Perfect";
  const col = statusColor(fit.status);

  const ringFill = fit.percentage;

  return (
    <Motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all w-full ${
        isRecommended
          ? "border-green-500 bg-green-100/60 shadow-lg"
          : isPerfect
          ? "border-green-400 bg-green-50/60 shadow-md"
          : isSelected
          ? "border-[#A07850] bg-[#A07850]/10 shadow-md"
          : "border-black/10 bg-white/30 hover:border-[#A07850]/40"
      }`}
    >
      {/* Badges — stacked if both apply */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5">
        {isBody && (
          <span className="text-[10px] font-black bg-[#1a1a1a] text-white px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
            Your Body
          </span>
        )}
        {isRecommended && (
          <span className="text-[10px] font-black bg-green-600 text-white px-3 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-sm">
            Recommended
          </span>
        )}
      </div>

      <span className="text-xl font-black text-[#1a1a1a] mt-3">{size}</span>

      {/* Ring */}
      <div className="relative w-12 h-12 my-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <path strokeWidth="3.5" stroke="#e5e7eb" fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <path strokeWidth="3.5" stroke={isRecommended ? "#16a34a" : col.hex} fill="none" strokeLinecap="round"
            strokeDasharray={`${ringFill}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-black"
          style={{ color: isRecommended ? "#16a34a" : col.hex }}>
          {fit.percentage === 100 ? "✓" : `${fit.percentage}%`}
        </span>
      </div>

      {/* Status pill */}
      <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-center"
        style={{ color: isRecommended ? "#15803d" : col.hex, backgroundColor: isRecommended ? "#dcfce7" : col.bg }}>
        {fit.percentage}% {fit.status}
      </span>

    </Motion.button>
  );
}


function ZoneBar({ zone }) {
  const color = zoneColor(zone.type);
  const isPerfect = zone.type === "perfect";

  // Label: "100% — Perfect", "32% Tight", "18% Loose"
  const scoreLabel = isPerfect
    ? "100% — Perfect"
    : `${zone.score}% ${zone.type === "tight" ? "Tight" : "Loose"}`;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-black/5 last:border-0">
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-sm font-bold text-gray-700 w-20 flex-shrink-0">{zone.name}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <Motion.div
          initial={{ width: 0 }}
          animate={{ width: isPerfect ? "100%" : `${zone.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] font-black w-24 text-right" style={{ color }}>
        {scoreLabel}
      </span>
      <span className="text-[10px] text-gray-400 w-14 text-right">
        {zone.diff > 0 ? `+${zone.diff}` : zone.diff} cm
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */

export default function Heatmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { avatarData, avatarConfig, selections = {} } = state;

  /* ── Extract user measurements from EITHER flow ── */
  const userMeasurements = useMemo(() => {
    // PHOTO FLOW — use AI-estimated metrics saved permanently
    if (avatarData?.metrics) {
      const m = avatarData.metrics;
      return {
        chest: m.chest || 94,
        waist: m.waist || 75,
        hips: m.hips || 99,
        shoulders: m.shoulders || 40,
        source: "estimated",
      };
    }
    // MEASUREMENT FLOW — use real entered values
    if (avatarConfig) {
      return {
        chest: avatarConfig.chest || 94,
        waist: avatarConfig.waist || 75,
        hips: avatarConfig.hips || 99,
        shoulders: avatarConfig.shoulders || 40,
        source: "measured",
      };
    }
    return null;
  }, [avatarData, avatarConfig]);

  /* ── Dynamic User Weight Metric ── */
  const userWeight = useMemo(() => {
    if (!userMeasurements) return 50;
    const baseGirth = (userMeasurements.waist || 75) * 0.4 + (userMeasurements.hips || 99) * 0.3 + (userMeasurements.chest || 94) * 0.3;
    const girthFactor = baseGirth / 90;
    const height = avatarConfig?.height || 170;
    return Math.round(55 * Math.pow(girthFactor, 2.5) * (height / 170));
  }, [userMeasurements, avatarConfig]);

  /* ── Body size + selected clothing size ── */
  const bodySize = useMemo(() => detectBodySize(userMeasurements), [userMeasurements]);

  // What clothing size is currently on the avatar
  const clothingSize = useMemo(() => {
    const topSize = selections?.top?.size || selections?.Tops?.size || state.selectedTopSize;
    if (topSize) {
      const s = String(topSize).toUpperCase();
      for (const sz of SIZE_ORDER) if (s.includes(sz)) return sz;
    }
    return bodySize; // fallback: same as body
  }, [selections, state.selectedTopSize, bodySize]);

  const allSizesFit = useMemo(() => {
    const result = {};
    for (const sz of SIZE_ORDER) {
      const fit = calculateKgFit(sz, userWeight);
      if (sz === bodySize) {
        fit.status = "Perfect";
      }
      result[sz] = fit;
    }
    return result;
  }, [userWeight, bodySize]);

  /* ── Selected size for detail view (default = clothing size on avatar) ── */
  const [selectedSize, setSelectedSize] = useState(null);
  const activeSize = selectedSize || clothingSize;

  /* ── Heatmap zones for the ACTIVE size ── */
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userMeasurements) return;
    setLoading(true);

    // Client-side mapping is fully robust and instantly maps measurements to the 3D heatmap
    const zones = getHeatmapZones(activeSize, userMeasurements);
    const activeZoneNames = getActiveZones(selections);
    setAnalysisData(zones.filter(z => activeZoneNames.includes(z.name)));

    // UI updates instantly without network latency
    setLoading(false);
  }, [userMeasurements, activeSize, clothingSize, selections]);


  /* ── Stats for active size ── */
  // avgZoneDeviation = average deviation % across zones (0 = perfect)
  const avgZoneDeviation = analysisData.length
    ? Math.round(analysisData.reduce((a, z) => a + z.score, 0) / analysisData.length)
    : (allSizesFit[activeSize]?.percentage || 0);

  const activeFit = allSizesFit[activeSize] || { status: "Perfect", percentage: 0, direction: "perfect" };
  const col = statusColor(activeFit.status);
  const isPerfectSize = activeSize === clothingSize;

  // ─── Brand Recommendation logic ───
  const brandRec = useMemo(() => {
    if (!state.selectedBrand || !bodySize) return null;
    const rec = getBrandRecommendation(bodySize, state.selectedBrand);
    const sizeText = rec.type === "RELAXED" 
      ? `${rec.primary} (loose) or ${rec.secondary} (fitted)` 
      : (rec.type === "INCONSISTENT" && rec.secondary ? `${rec.primary}/${rec.secondary}` : rec.primary);
    return { ...rec, sizeText };
  }, [state.selectedBrand, bodySize]);

  const recommendation = useMemo(() => {
    let text = "";
    if (activeFit.status === "Perfect")
      text = activeSize + " provides a 100% perfect fit for your estimated body weight (" + userWeight + "kg).";
    else if (activeFit.status === "Slightly Tight")
      text = activeSize + " has a " + activeFit.percentage + "% fit core. The wearer (" + userWeight + "kg) would feel snug in " + activeSize + ".";
    else if (activeFit.status === "Tight")
      text = activeSize + " has a " + activeFit.percentage + "% fit score. " + activeSize + " would be too tight for (" + userWeight + "kg).";
    else if (activeFit.status === "Very Tight")
      text = activeSize + " is significantly too small for your body's weight class (" + userWeight + "kg).";
    else if (activeFit.status === "Slightly Loose")
      text = activeSize + " has a " + activeFit.percentage + "% fit score. The wearer (" + userWeight + "kg) would have extra room in " + activeSize + ".";
    else if (activeFit.status === "Loose")
      text = activeSize + " has a " + activeFit.percentage + "% fit score. " + activeSize + " would feel baggy on your body.";
    else if (activeFit.status === "Very Loose")
      text = activeSize + " is far too big for your body weight (" + userWeight + "kg).";
    else
      text = "Tap any size card to see how it aligns with your body weight.";

    // Add brand context if available
    if (brandRec) {
      return `[${state.selectedBrand} Recommendation: ${brandRec.sizeText}] Based on your ${bodySize} body size, ${text}`;
    }
    return text;
  }, [activeFit, activeSize, userWeight, brandRec, bodySize, state.selectedBrand]);

  /* ─────────────────────────────────────
     NO DATA GUARD
  ───────────────────────────────────── */
  if (!avatarData && !avatarConfig) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fcfbf9] text-[#1f1f1f] p-8">
        <AlertTriangleIcon className="w-16 h-16 text-[#A07850] mb-6" />
        <h2 className="text-2xl font-bold mb-2">No Avatar Data Found</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">
          Please generate your digital twin or enter measurements before accessing the heatmap.
        </p>
        <button
          onClick={() => navigate("/choose")}
          className="px-8 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          Return to Studio
        </button>
      </div>
    );
  }

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  return (
    <div className="relative min-h-screen text-[#1f1f1f] font-['Inter',sans-serif] overflow-x-hidden flex flex-col">

      {/* BG */}
      <Motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          willChange: "transform",
          opacity: 0.35,
        }}
      />

      {/* Navbar */}
      <div className="z-30 w-full flex-shrink-0 relative">
        <Navbar />
      </div>

      {/* Main Layout */}
      <div className="relative z-20 flex-1 flex flex-col lg:flex-row gap-4 px-4 lg:px-6 pb-12 pt-2 max-w-[1600px] mx-auto w-full min-h-[calc(100vh-80px)]">

        {/* ══════════════════════════════════
            LEFT — 3D Avatar Heatmap
        ══════════════════════════════════ */}
        <div className="flex-1 bg-white/20 backdrop-blur-2xl border border-black/10 rounded-2xl overflow-hidden relative min-h-[500px] lg:min-h-0 shadow-sm">

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/40 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-full border-4 border-[#A07850] border-t-transparent animate-spin" />
            </div>
          )}

          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <AvatarCanvas
              {...state}
              analysisData={analysisData}
              showHeatmap={true}
            />
          </div>

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-5 left-5 bg-white/90 backdrop-blur border border-[#E6E1D9] p-2 rounded-xl text-gray-600 hover:text-[#A07850] transition-colors shadow-sm z-10"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>

          {/* Active size badge */}
          <div className="absolute top-5 right-5 z-10 flex items-center gap-2">
            <div
              className="px-5 py-3 rounded-2xl font-black text-base shadow-lg border backdrop-blur-sm"
              style={{ backgroundColor: `${col.bg}cc`, color: col.hex, borderColor: `${col.hex}44` }}
            >
              Viewing: {activeSize} — {activeFit.percentage}% {activeFit.status}
            </div>
          </div>

          {/* Legend */}
          <div className="absolute bottom-5 left-5 z-10 flex flex-col gap-1.5 bg-white/80 backdrop-blur p-3 rounded-xl border border-black/5 shadow-sm">
            {[
              { color: "#B91C1C", label: "Very Tight" },
              { color: "#EF4444", label: "Tight" },
              { color: "#EAB308", label: "Slightly Tight" },
              { color: "#22C55E", label: "Perfect" },
              { color: "#60A5FA", label: "Slightly Loose" },
              { color: "#3B82F6", label: "Loose" },
              { color: "#1D4ED8", label: "Very Loose" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-black text-gray-700">{label}</span>
              </div>
            ))}
          </div>

          {/* Source badge */}
          {userMeasurements?.source && (
            <div className="absolute bottom-5 right-5 z-10 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-black/5 shadow-sm">
              <span className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">
                {userMeasurements.source === "estimated" ? "📷 Photo Estimated" : "📏 Measured"}
              </span>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════
            RIGHT — Analysis Panel
        ══════════════════════════════════ */}
        <div className="w-full lg:w-[550px] flex flex-col gap-4 pb-4">



          {/* ── All Sizes Comparison Grid ── */}
          <div className="bg-white/30 backdrop-blur-3xl border border-black/10 rounded-3xl p-10 shadow-2xl space-y-6">
            <h3 className="text-base font-black uppercase tracking-[0.25em] text-[#794125] text-center border-b border-black/5 pb-6">
              All Sizes — Tap to Compare
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {SIZE_ORDER.map((sz) => {
                const isRecommended = brandRec && (sz === brandRec.primary || sz === brandRec.secondary);
                return (
                  <SizeCard
                    key={sz}
                    size={sz}
                    fit={allSizesFit[sz] || { status: "Unknown", percentage: 0 }}
                    isBody={sz === bodySize}
                    isRecommended={isRecommended}
                    isSelected={sz === activeSize}
                    onClick={() => setSelectedSize(sz)}
                  />
                );
              })}
            </div>
          </div>



          {/* ── Recommendation ── */}
          <div
            className="rounded-3xl p-10 flex gap-6 border backdrop-blur-2xl shadow-2xl items-center"
            style={{ backgroundColor: `${col.bg}cc`, borderColor: `${col.hex}33` }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner" style={{ background: `${col.hex}15` }}>
              <AlertTriangleIcon className="w-8 h-8" style={{ color: col.hex }} />
            </div>
            <p className="text-lg text-gray-900 leading-relaxed font-black">{recommendation}</p>
          </div>

          {/* ── Action ── */}
          <button
            onClick={() =>
              navigate("/report", {
                state: {
                  ...state,
                  analysisData,
                  allSizesFit,
                  bodySize,
                  selectedSize: activeSize,
                  fitScore: isPerfectSize ? 100 : (100 - (allSizesFit[activeSize]?.percentage || 0)),
                  fitVerdict: activeFit.status,
                  userMeasurements,
                },
              })
            }
            className="w-full py-6 bg-[#1a1a1a] hover:bg-black text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:scale-[1.01] text-lg uppercase tracking-[0.15em] border-t border-white/10"
          >
            View Full Report
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
      <Footer isLightPage={true} />
    </div>
  );
}