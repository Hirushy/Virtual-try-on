// src/components/BrandSizeGuide.jsx
import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  getBrandRecommendation,
  BRANDS_LIST,
  BRANDS_BY_TYPE,
  TYPE_META,
  TYPE_ORDER,
} from "../utils/brandSizeConversion";

export default function BrandSizeGuide({ avatarSize = "M", selectedBrand: externalBrand, setSelectedBrand: externalSetBrand }) {
  const [internalBrand, setInternalBrand] = useState("Zara");
  
  const selectedBrand = externalBrand || internalBrand;
  const setSelectedBrand = externalSetBrand || setInternalBrand;

  const [isScanning, setIsScanning] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const rec = getBrandRecommendation(avatarSize, selectedBrand);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 1000);
  };

  // Format the recommendation text based on type
  const getRecommendationText = () => {
    if (rec.type === "RELAXED") {
      return `${rec.primary} (loose) OR ${rec.secondary} (better fit)`;
    }
    if (rec.type === "INCONSISTENT" && rec.secondary) {
      return `${rec.primary} or ${rec.secondary}`;
    }
    return rec.primary;
  };

  return (
    <div className="w-full rounded-[1.5rem] border border-black/8 bg-white/70 backdrop-blur-md shadow-sm p-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">
          Smart Size Guide
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-gray-400 uppercase">My Size:</span>
          <div className="px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-black">
            {avatarSize}
          </div>
        </div>
      </div>

      {/* ── Brand Pills ── */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {BRANDS_LIST.map((brand) => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all duration-200 border ${
              selectedBrand === brand
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-md scale-105"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* ── Scan Button ── */}
      <button
        onClick={handleScan}
        disabled={isScanning}
        className="w-full py-3 mb-4 bg-[#1a1a1a] border border-black/10 rounded-xl text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all shadow-md disabled:opacity-50"
      >
        <span>{isScanning ? "⏳" : "🔍"}</span>
        {isScanning ? "Analyzing Fit..." : "Scan & Find Matches"}
      </button>

      {/* ── Recommendation Card ── */}
      <AnimatePresence mode="wait">
        {!isScanning && (
          <Motion.div
            key={selectedBrand + avatarSize}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden border bg-white"
            style={{
              borderColor: rec.meta.color + "30",
            }}
          >
            {/* Recommended Size Badge (Big) */}
            <div
              className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-white shadow-lg flex-shrink-0"
              style={{ backgroundColor: rec.meta.color }}
            >
               <span className="text-2xl font-black">{rec.primary}</span>
               <span className="text-[8px] font-black uppercase opacity-60">Pick</span>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{rec.meta.icon}</span>
                <span
                  className="text-[9px] font-black uppercase tracking-widest"
                  style={{ color: rec.meta.color }}
                >
                  {rec.meta.label} · {selectedBrand}
                </span>
              </div>
              
              {/* Conversion bar style */}
              <div className="flex items-center gap-2 mt-0.5">
                 <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-100 border border-gray-200">
                    <span className="text-[10px] font-black text-gray-400">{avatarSize}</span>
                    <span className="text-gray-300">⮕</span>
                    <span className="text-[10px] font-black text-gray-800">{selectedBrand} {rec.primary}</span>
                 </div>
              </div>

              <p className="text-[10px] text-gray-500 font-medium mt-1 leading-tight">
                {rec.secondary
                  ? `Recommended: ${rec.primary} (loose) or ${rec.secondary} (better fit)`
                  : `Recommended: Pick size ${rec.primary} for the best fit in ${selectedBrand}.`}
              </p>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ── Full Guide Toggle ── */}
      <button
        onClick={() => setShowAll((v) => !v)}
        className="w-full mt-3 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-[#8a7c65] transition-colors flex items-center justify-center gap-1.5"
      >
        <span style={{ transform: showAll ? "rotate(180deg)" : "none", display: "inline-block", transition: "transform 0.2s" }}>▼</span>
        {showAll ? "Hide Full Guide" : "Show All Brand Conversions"}
      </button>

      <AnimatePresence>
        {showAll && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-3">
              {TYPE_ORDER.map((type) => {
                const meta = TYPE_META[type];
                const brands = BRANDS_BY_TYPE[type];
                return (
                  <div
                    key={type}
                    className="rounded-xl p-3 border"
                    style={{ borderColor: meta.color + "25", backgroundColor: meta.color + "06" }}
                  >
                    {/* Group header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">{meta.icon}</span>
                      <span
                        className="text-[10px] font-black uppercase tracking-widest"
                        style={{ color: meta.color }}
                      >
                        {meta.label}s
                      </span>
                    </div>

                    {/* Brand rows */}
                    <div className="space-y-1.5">
                      {brands.map((brand) => {
                        const r = getBrandRecommendation(avatarSize, brand);
                        const isActive = brand === selectedBrand;
                        return (
                          <button
                            key={brand}
                            onClick={() => setSelectedBrand(brand)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all border ${
                              isActive
                                ? "border-gray-300 bg-white shadow-sm"
                                : "border-transparent bg-black/3 hover:bg-white hover:border-gray-200"
                            }`}
                          >
                            <span className="text-xs font-black text-gray-700">{brand}</span>
                            <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-gray-300">{avatarSize} ⮕</span>
                               <span
                                className="text-xs font-black px-2.5 py-0.5 rounded-lg"
                                style={{ color: meta.color, backgroundColor: meta.color + "18" }}
                              >
                                {r.secondary ? `${r.primary} / ${r.secondary}` : r.primary}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
