// Clothing catalog management

"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import {
  ChevronLeft, ChevronRight, Check,
  Trash2, Edit3, ShoppingBag,
  Activity, Save, Scissors, AlertTriangle,
  Search, Scan, X, Sparkles
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import BrandSizeGuide from "../../components/BrandSizeGuide";

// Data imports
import { maleClothes, femaleClothes } from "./clothes";
import { CATALOG, SUBCAT_ICONS, SUBCAT_COLORS, makeSubKey } from "./CatalogData";
import AvatarCanvas, { useOutfitState } from "./AvatarCanvas";
import {
  SIZE_ORDER_LIST,
  getRecommendedSize,
  getThumbnailRenderer,
  disposeThumbnailRenderer,
} from "./AvatarConstants";
import { useGLTF } from "@react-three/drei";

import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import VisualSearchPanel from "./VisualSearchPanel";
import heroBg from "../../assets/pink.jpg";

// Standard measurements for different sizes
const SIZE_MEASUREMENTS = {
  XS: { chest: 82, waist: 64, hips: 88, shoulders: 34, arm: 50, leg: 70, height: 170 },
  S: { chest: 90, waist: 72, hips: 96, shoulders: 40, arm: 56, leg: 80, height: 170 },
  M: { chest: 98, waist: 80, hips: 104, shoulders: 46, arm: 62, leg: 90, height: 170 },
  L: { chest: 106, waist: 88, hips: 112, shoulders: 52, arm: 68, leg: 100, height: 170 },
  XL: { chest: 114, waist: 96, hips: 120, shoulders: 58, arm: 74, leg: 110, height: 170 },
  XXL: { chest: 122, waist: 104, hips: 128, shoulders: 60, arm: 80, leg: 120, height: 170 },
};

// Fit assessment logic
function getFitInfo(avatarSize, clothSize) {
  if (!avatarSize || !clothSize) return null;
  const ranks = { XS: 0, S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  const diff = (ranks[avatarSize] ?? 2) - (ranks[clothSize] ?? 2);
  if (diff === 0) return { label: "PERFECT FIT", color: "#10b981", bg: "#ecfdf5", icon: "💎" };
  if (diff === 1) return { label: "SLIGHTLY LOOSE", color: "#3b82f6", bg: "#eff6ff", icon: "✨" };
  if (diff >= 2) return { label: "LOOSE FIT", color: "#6366f1", bg: "#eef2ff", icon: "🌊" };
  if (diff === -1) return { label: "SLIGHTLY TIGHT", color: "#f59e0b", bg: "#fffbeb", icon: "🔥" };
  return { label: "TIGHT FIT", color: "#ef4444", bg: "#fef2f2", icon: "🚨" };
}

// Create a mapping of mesh names to image paths from clothes.js
function buildImageMap() {
  const map = {};
  [...(maleClothes || []), ...(femaleClothes || [])].forEach((item) => {
    if (item.meshName && item.image) {
      map[item.meshName] = item.image;
    }
  });
  return map;
}
const CLOTHING_IMAGE_MAP = buildImageMap();

function getClothingImage(meshName) {
  return CLOTHING_IMAGE_MAP[meshName] || null;
}

const CATEGORY_DISPLAY_LABELS = {
  Footwear: "Shoes",
  "Special Categories": "Accessories",
};
function getCategoryLabel(category) {
  return CATEGORY_DISPLAY_LABELS[category] || category;
}

function getWardrobeItems(uiGender, activeCategory) {
  if (!activeCategory || activeCategory === "Search" || activeCategory === "Hair") return [];
  const subcategories = CATALOG.subcategories[uiGender]?.[activeCategory] || [];
  return subcategories.flatMap((sub) => CATALOG.clothingItems[makeSubKey(uiGender, activeCategory, sub)] || []);
}

/* ─────────────────────────────────────────────────────────
   GENDER HELPERS
 ───────────────────────────────────────────────────────── */
function detectGender(avatarData, avatarConfig, locationState) {
  const raw =
    avatarConfig?.gender ||
    avatarData?.gender ||
    locationState?.gender ||
    locationState?.avatarConfig?.gender ||
    locationState?.avatarData?.gender ||
    locationState?.measurements?.gender ||
    "female";
  const s = String(raw).toLowerCase().trim();
  return (s === "male" || s === "men" || s === "man" || s === "m") ? "male" : "female";
}
const genderToUI = (g) => (g === "male" ? "Men" : "Women");
const uiToGender = (ui) => (ui === "Men" ? "male" : "female");

import { CanvasErrorBoundary, NoWebGLBanner, isWebGLAvailable, DEFAULT_GL_SETTINGS } from "../../components/WebGLHandler";

/* ─────────────────────────────────────────────────────────
   HAIR CONSTANTS
 ───────────────────────────────────────────────────────── */
const HAIR_OPTIONS = {
  female: [
    "none",
    "F_hair1", "F_hair2", "F_hair3", "F_hair4", "F_hair5", "F_hair6",
    "F_hair7", "F_hair8", "F_hair9", "F_hair10", "F_hair11", "F_hair12",
    "F_hair13", "F_hair14", "F_hair15", "F_hair16", "F_hair17", "F_hair18",
  ],
  male: ["none", "M_hair1", "M_hair2", "M_hair3", "M_hair4", "M_hair5", "M_hair6", "M_hair7", "M_hair8", "M_hair9"],
};
const DEFAULT_HAIR = { female: "F_hair1", male: "M_hair1" };
const HAIR_LABELS = {
  none: "No Hair",
  F_hair1: "Long Straight", F_hair2: "Long Wavy", F_hair3: "Long Curly",
  F_hair4: "Bow Bun", F_hair5: "Hat Style", F_hair6: "Orange Waves",
  F_hair7: "Pink Soft", F_hair8: "Ponytail", F_hair9: "Purple Flow",
  F_hair10: "Deep Purple", F_hair11: "Red Bob", F_hair12: "White Long",
  F_hair13: "White Braid", F_hair14: "White Updo", F_hair15: "White Short",
  F_hair16: "White Curly", F_hair17: "White Lob", F_hair18: "White Chic",
  M_hair1: "Buzz Cut", M_hair2: "Side Part", M_hair3: "Undercut",
  M_hair4: "Messy Top", M_hair5: "Slick Back", M_hair6: "Wavy Comb",
  M_hair7: "Fade Clean", M_hair8: "Curly Crop", M_hair9: "Cap Style",
};

/* ─────────────────────────────────────────────────────────
   ✅ CLOTHING CARD — real PNG image, no WebGL needed
 ───────────────────────────────────────────────────────── */
function ClothingCard({ item, active, onClick }) {
  const imgSrc = getClothingImage(item.meshName);
  const label = (item.meshName || item.name || "").replace(/_/g, " ").replace(/-/g, " ");
  const short = label.length > 14 ? label.slice(0, 13) + "…" : label;
  const [imgErr, setImgErr] = useState(false);

  return (
    <Motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -3 }}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center focus:outline-none"
      style={{ width: "100%" }}
    >
      <div
        className={`relative w-full rounded-[14px] overflow-hidden border-2 transition-all duration-300 shadow-md
          ${active ? "border-[#8a7c65] shadow-[#8a7c65]/30 shadow-lg" : "border-transparent hover:border-[#8a7c65]/30"}`}
        style={{
          aspectRatio: "3/4",
          background: active ? "linear-gradient(145deg,#f5f0e8,#ede5d8)" : "rgba(255,255,255,0.8)",
        }}
      >
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={label}
            className="w-full h-full object-cover"
            style={{ padding: "3px" }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <Suspense fallback={<div className="w-full h-full bg-gray-50/50 animate-pulse" />}>
            <DynamicMeshThumbnail meshKey={item.meshName} />
          </Suspense>
        )}
        {active && (
          <>
            <div className="absolute inset-0 rounded-[14px] ring-2 ring-inset ring-white/40 pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#8a7c65] flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </>
        )}
      </div>
      <span
        className={`mt-1.5 text-center leading-tight font-black uppercase transition-colors
          ${active ? "text-[#8a7c65]" : "text-gray-500"}`}
        style={{ fontSize: 10, letterSpacing: "0.05em", maxWidth: "100%", wordBreak: "break-word" }}
      >
        {short}
      </span>
    </Motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   ✅ HAIR CARD — real image from clothes.js
 ───────────────────────────────────────────────────────── */
function DynamicMeshThumbnail({ meshKey }) {
  const [dataUrl, setDataUrl] = useState(null);
  const { nodes } = useGLTF("/avatar.glb");

  useEffect(() => {
    // 1. Find the target mesh (case-insensitive lookup)
    const target = Object.values(nodes).find(n =>
      n.name?.toLowerCase() === meshKey?.toLowerCase() && (n.isMesh || n.isSkinnedMesh)
    );
    if (!target) return;

    // 2. Setup thumbnail capture logic
    const renderThumb = () => {
      const renderer = getThumbnailRenderer(140, DEFAULT_GL_SETTINGS);
      if (!renderer) return;

      const scene = new THREE.Scene();
      // Ensure the scene background is transparent or neutral
      scene.background = null;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);

      // Setup Lights
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const light = new THREE.DirectionalLight(0xffffff, 1.5);
      light.position.set(1, 1, 2);
      scene.add(light);

      // Prepare Mesh
      target.updateMatrixWorld(true);
      const mesh = target.clone();
      mesh.visible = true;
      mesh.frustumCulled = false;

      // Center the mesh at (0,0,0)
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      mesh.position.sub(center);
      scene.add(mesh);

      // Position camera based on mesh size
      const maxDim = Math.max(size.x, size.y, size.z);
      camera.position.set(0, 0, maxDim * 1.5); // Look from front
      camera.lookAt(0, 0, 0);

      // Force render
      renderer.setClearColor(0x000000, 0); // Transparent background
      renderer.render(scene, camera);

      // Capture
      const uri = renderer.domElement.toDataURL();
      setDataUrl(uri);

      // Full Cleanup
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach(m => m.dispose());
        }
      });
      scene.clear();
    };

    // Small delay to ensure GLTF is fully ready for cloning
    const timer = setTimeout(renderThumb, 100);
    return () => clearTimeout(timer);
  }, [meshKey, nodes]);

  if (!dataUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50/50 animate-pulse">
        <div className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-[#8a7c65]" />
      </div>
    );
  }

  return <img src={dataUrl} alt="Mesh thumb" className="w-full h-full object-cover" style={{ padding: "4px" }} />;
}

/* ─────────────────────────────────────────────────────────
   HAIR CARD — falls back to DynamicHairThumbnail if image is missing
 ───────────────────────────────────────────────────────── */
function HairCard({ meshKey, label, active, onClick }) {
  const staticImg = getClothingImage(meshKey);
  const [imgErr, setImgErr] = useState(false);
  const short = label.length > 13 ? label.slice(0, 12) + "…" : label;

  return (
    <Motion.button
      onClick={onClick}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center focus:outline-none"
      style={{ width: "100%" }}
    >
      <div
        className={`relative w-full rounded-[14px] overflow-hidden border-2 transition-all duration-300 shadow-md
          ${active ? "border-[#8a7c65] shadow-lg shadow-[#8a7c65]/20" : "border-transparent hover:border-[#8a7c65]/30"}`}
        style={{
          aspectRatio: "3/4",
          background: active ? "linear-gradient(145deg,#f5f0e8,#ede5d8)" : "rgba(255,255,255,0.7)",
        }}
      >
        {meshKey === "none" ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 opacity-40">
            <Trash2 size={24} style={{ color: "#8a7c65" }} />
            <span className="text-[9px] font-black uppercase tracking-tighter">Remove</span>
          </div>
        ) : staticImg && !imgErr ? (
          <img src={staticImg} alt={label} className="w-full h-full object-cover" style={{ padding: "3px" }} onError={() => setImgErr(true)} />
        ) : (
          <Suspense fallback={<div className="w-full h-full bg-gray-50 animate-pulse" />}>
            <DynamicMeshThumbnail meshKey={meshKey} />
          </Suspense>
        )}

        {active && (
          <>
            <div className="absolute inset-0 rounded-[14px] ring-2 ring-inset ring-white/40 pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#8a7c65] flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </>
        )}
      </div>
      <span
        className={`mt-1.5 text-center leading-tight font-black uppercase transition-colors
          ${active ? "text-[#8a7c65]" : "text-gray-500"}`}
        style={{ fontSize: 10, letterSpacing: "0.05em", maxWidth: "100%", wordBreak: "break-word" }}
      >
        {short}
      </span>
    </Motion.button>
  );
}

/* ─────────────────────────────────────────────────────────
   HAIR PANEL
 ───────────────────────────────────────────────────────── */
function HairPanel({ canonicalGender, selectedHair, onSelectHair }) {
  const opts = HAIR_OPTIONS[canonicalGender] || HAIR_OPTIONS.female;
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 mb-6 flex-shrink-0">
        <p className="text-2xl font-black uppercase tracking-widest text-[#8a7c65] mb-2">Hair Style</p>
        <p className="text-base text-gray-500 font-medium">{opts.length} styles · tap to apply</p>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {opts.map((h) => (
            <HairCard key={h} meshKey={h} label={HAIR_LABELS[h] || h.replace(/_/g, " ")}
              active={selectedHair === h} onClick={() => onSelectHair(h)} />
          ))}
        </div>
      </div>
      {selectedHair && (
        <div className="mt-3 flex justify-center flex-shrink-0">
          <div className="px-5 py-2 bg-[#8a7c65]/10 rounded-full border border-[#8a7c65]/20">
            <span className="text-sm font-black text-[#8a7c65] uppercase tracking-widest">
              ✓ {HAIR_LABELS[selectedHair] || selectedHair}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   ✅ CLOTHING ITEM PANEL — real images, no WebGL thumbnails
 ───────────────────────────────────────────────────────── */
function ClothingItemPanel({ uiGender, activeCategory, subcategory, selectedItem, onSelectItem, onConfirmSelection, onBack, avatarSize, selectedBrand, setSelectedBrand }) {
  const subKey = `${uiGender}__${activeCategory}__${subcategory}`;
  const items = CATALOG.clothingItems[subKey] || [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header — fixed, never scrolls ── */}
      <div className="px-2 mb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={onBack}
          className="p-3 rounded-2xl bg-white/60 text-gray-500 border border-black/5 shadow-sm transition hover:bg-white hover:text-gray-700"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-xl font-black uppercase tracking-widest text-[#8a7c65]">{subcategory}</p>
          <p className="text-sm text-gray-400 font-medium mt-0.5">{items.length} pieces · tap to try on</p>
        </div>
      </div>

      {/* ── Scrollable area: Brand Guide + Items ── */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4 pb-4">

        {/* Brand Size Guide — INSIDE scroll, always visible at top */}
        <div className="px-2">
          <BrandSizeGuide 
            avatarSize={avatarSize} 
            selectedBrand={selectedBrand} 
            setSelectedBrand={setSelectedBrand} 
          />
        </div>

        {/* Items grid */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center opacity-40 text-center px-4 py-10">
            <ShoppingBag size={40} className="text-gray-300 mb-3" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No items found</p>
            <p className="text-xs text-gray-300 mt-1">Check your CatalogData or clothes.js</p>
          </div>
        ) : (
          <div className="px-2 grid gap-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {items.map((item) => (
              <ClothingCard
                key={item.id}
                item={item}
                active={selectedItem?.id === item.id}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Selected item confirmation — fixed at bottom ── */}
      {selectedItem && (
        <div className="mt-4 flex flex-col items-center gap-3 flex-shrink-0 pb-4 px-2">
          <Motion.div
            key={selectedItem.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex items-center justify-between px-6 py-3 bg-[#8a7c65]/5 rounded-2xl border border-[#8a7c65]/20 shadow-sm"
          >
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-[#8a7c65] uppercase tracking-widest opacity-60">Ready to style?</span>
                <span className="text-sm font-black text-gray-800 uppercase tracking-widest truncate max-w-[140px]">
                  {selectedItem.meshName.replace(/_/g, " ")}
                </span>
             </div>
             
             <Motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => onConfirmSelection(selectedItem)}
               className="px-8 py-2.5 bg-[#1a1a1a] text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg flex items-center gap-2"
             >
               OK <Check size={14} />
             </Motion.button>
          </Motion.div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   COLOR PICKER PANEL
 ───────────────────────────────────────────────────────── */
function ColorPickerPanel({ item, color, onColorChange, onReset, onDone }) {
  const imgSrc = getClothingImage(item?.meshName);
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/40 border border-gray-100">
        {imgSrc && !imgErr ? (
          <img src={imgSrc} alt={item?.meshName} className="w-12 h-16 object-cover rounded-xl border-2 border-white shadow"
            onError={() => setImgErr(true)} />
        ) : (
          <div className="w-12 h-12 rounded-xl border-2 border-white shadow" style={{ backgroundColor: color || "#d4a892" }} />
        )}
        <div>
          <p className="text-xs font-black uppercase text-[#8a7c65] tracking-widest mb-0.5">Selected</p>
          <p className="text-base font-bold text-gray-700 truncate max-w-[160px]">{item?.meshName?.replace(/_/g, " ")}</p>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4 rounded-3xl bg-white/40 border border-gray-100">
        <label className="text-sm font-black uppercase text-gray-500 tracking-wider">Color Tint</label>
        <div className="flex items-center gap-4">
          <input type="color" value={color || "#d4a892"} onChange={(e) => onColorChange(e.target.value)}
            className="w-16 h-16 rounded-2xl cursor-pointer border-4 border-white shadow-lg overflow-hidden" />
          <input type="text" value={color || ""} placeholder="Original Texture" onChange={(e) => onColorChange(e.target.value)}
            className="flex-1 bg-transparent border-b-2 border-gray-300 py-1 text-base font-mono focus:border-[#8a7c65] outline-none" />
        </div>
        {color && (
          <button onClick={onReset} className="text-sm text-[#8a7c65] hover:text-[#d4a892] font-black tracking-wider text-left mt-1">
            ✕ Reset to Original
          </button>
        )}
      </div>
      <button onClick={onDone}
        className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-black text-base uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
        <Check size={18} /> Done
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SUBCATEGORY GRID
 ───────────────────────────────────────────────────────── */
function WardrobeCarousel({ items = [], activeItem, onSelectItem }) {
  if (!items || items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-6 text-center text-gray-500">
        No wardrobe items are available for this category yet.
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-gray-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gray-500 font-black">Wardrobe Shelf</p>
          <h3 className="text-xl font-black text-[#1f1f1f]">Browse looks</h3>
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-gray-400 font-black">Swipe to try</span>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
        {items.map((item) => (
          <div key={item.id} className="snap-start" style={{ minWidth: 220, width: 220 }}>
            <ClothingCard item={item} active={activeItem?.id === item.id} onClick={() => onSelectItem(item)} />
            <div className="mt-3 text-xs uppercase tracking-[0.22em] text-gray-500 font-bold">
              {item.outfit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubcatGrid({ uiGender, activeCategory, onPick }) {
  const subcats = CATALOG.subcategories[uiGender]?.[activeCategory] || [];
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 mb-4 flex-shrink-0">
        <p className="text-base font-black uppercase tracking-widest text-[#8a7c65] mb-1">{activeCategory}</p>
        <p className="text-sm text-gray-400 font-medium">Choose a type</p>
      </div>
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          {subcats.map((sub) => {
            const img = SUBCAT_ICONS[sub] || SUBCAT_ICONS["_default"];
            const bg = SUBCAT_COLORS[sub] || SUBCAT_COLORS["_default"];
            const count = CATALOG.clothingItems[`${uiGender}__${activeCategory}__${sub}`]?.length || 0;
            return (
              <Motion.button key={sub} onClick={() => onPick(sub)}
                whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-2xl focus:outline-none group" style={{ background: bg }}>
                <div className="absolute inset-0 opacity-60 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.55) 0%, transparent 75%)" }} />
                <div className="relative w-full flex items-center justify-center pt-2 pb-2" style={{ minHeight: 180 }}>
                  <img src={img} alt={sub}
                    className="w-full object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-115"
                    style={{ maxHeight: 210, padding: "0" }}
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <div className="relative px-5 py-4 flex flex-col items-start"
                  style={{ background: "rgba(255,255,255,0.70)", backdropFilter: "blur(10px)", borderTop: "1px solid rgba(255,255,255,0.6)" }}>
                  <span className="font-black uppercase text-gray-900 leading-tight text-base tracking-[0.1em]">{sub}</span>
                  <span className="mt-1 font-bold text-gray-500 text-sm tracking-widest">{count} {count === 1 ? "piece" : "pieces"}</span>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/70 transition-all pointer-events-none" />
              </Motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const CATEGORY_COLORS = {
  Tops: "bg-blue-800", Bottoms: "bg-green-800", Dresses: "bg-purple-800",
  Footwear: "bg-rose-800", "Special Categories": "bg-yellow-800", Hair: "bg-amber-800",
};

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function Clothing_cat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, API_BASE } = useAuth();
  const [webGLAvailable] = useState(() => isWebGLAvailable());

  const avatarData = useMemo(() => location.state?.avatarData || null, [location.state]);
  const avatarConfig = useMemo(
    () => location.state?.avatarConfig || location.state?.measurements || null,
    [location.state]
  );

  // ✅ Size from filename detection (FM→M, FXL→XL etc.)
  const passedSize = location.state?.size || avatarData?.size || null;

  // ✅ Resolved measurements for backend fit analysis
  const resolvedMeasurements = useMemo(() => {
    if (passedSize && SIZE_MEASUREMENTS[passedSize]) return SIZE_MEASUREMENTS[passedSize];
    if (location.state?.measurements) return location.state.measurements;
    if (location.state?.bodyMeasurements) return location.state.bodyMeasurements;
    if (avatarConfig) return avatarConfig;
    return null;
  }, [passedSize, location.state, avatarConfig]);

  const detectedGender = useMemo(() => detectGender(avatarData, avatarConfig, location.state), [avatarData, avatarConfig, location.state]);
  const uiGender = genderToUI(detectedGender);
  const canonicalGender = uiToGender(uiGender);

  const [selectedHair, setSelectedHair] = useState(() => avatarConfig?.hair || DEFAULT_HAIR[detectedGender]);
  useEffect(() => {
    setSelectedHair((prev) => {
      const ok = (canonicalGender === "female" && prev?.startsWith("F_")) || (canonicalGender === "male" && prev?.startsWith("M_"));
      return ok ? prev : DEFAULT_HAIR[canonicalGender];
    });
  }, [canonicalGender]);

  const [activeCategory, setActiveCategory] = useState(() => CATALOG.categories[genderToUI(detectedGender)]?.[0] || "Tops");
  const [activeSubcat, setActiveSubcat] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [activeColor, setActiveColor] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedClothSize, setSelectedClothSize] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [tempLookName, setTempLookName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const resetWizard = () => { setActiveSubcat(null); setActiveItem(null); setActiveColor(null); setShowColorPicker(false); };
  const handleConfirmSelection = () => setShowColorPicker(true);

  // ✅ avatarSize: filename detection first
  const avatarSize = useMemo(() => {
    if (passedSize && SIZE_ORDER_LIST.includes(passedSize)) return passedSize;
    const s = String(avatarData?.size || "").trim().toUpperCase();
    if (SIZE_ORDER_LIST.includes(s)) return s;
    return getRecommendedSize(avatarConfig);
  }, [passedSize, avatarData, avatarConfig]);

  const { selections, pendingItem, selectItem, removeSlot, setSelections } = useOutfitState({ avatarSize });

  useEffect(() => { if (location.state?.selections) setSelections(location.state.selections); }, [location.state, setSelections]);

  const [analysisData, setAnalysisData] = useState([]);
  const [showFitIndicators, setShowFitIndicators] = useState(false);

  const isHairCategory = activeCategory === "Hair";
  const allCategories = [...(CATALOG.categories[uiGender] || []), "Hair"];

  useEffect(() => { return () => { disposeThumbnailRenderer?.(); }; }, []);

  /* ── Handlers ── */
  const handleCategoryChange = (cat) => { setActiveCategory(cat); resetWizard(); };
  const handleSubcatPick = (sub) => { setActiveSubcat(sub); setActiveItem(null); setActiveColor(null); setShowColorPicker(false); };

  const handleItemPick = (item, colorOverride = null, openPicker = false) => {
    setActiveItem(item);
    const size = item.size || avatarSize || "M";
    const brand = item.brand || "DEFAULT";
    const finalColor = colorOverride !== null ? colorOverride : (item.color || activeColor);

    setSelectedClothSize(size);
    setActiveColor(finalColor);
    selectItem({ ...item, color: finalColor, size });
    fetchBackendFit(size, brand);
    if (openPicker) setShowColorPicker(true);
  };

  const handleColorChange = (col) => { setActiveColor(col); if (activeItem) selectItem({ ...activeItem, color: col, size: avatarSize || "M" }); };
  const handleColorReset = () => { setActiveColor(null); if (activeItem) selectItem({ ...activeItem, color: null, size: avatarSize || "M" }); };
  const handleDone = () => resetWizard();

  const fetchBackendFit = async (size, brand = "DEFAULT") => {
    if (!size || !API_BASE) return;
    try {
      const { default: axios } = await import("axios");
      const bodyMeasurements = resolvedMeasurements
        ? { shoulders: resolvedMeasurements.shoulders, chest: resolvedMeasurements.chest, waist: resolvedMeasurements.waist, neck: resolvedMeasurements.neck || 35 }
        : null;
      const res = await axios.post(`${API_BASE}/api/analyze-fit`, { selectedSize: size, brand, bodyMeasurements }, { timeout: 5000 });
      if (res.data.status === "success" && res.data.zones) setAnalysisData(res.data.zones);
    } catch { if (import.meta.env.DEV) console.warn("⚠️ Fit analysis unavailable"); }
  };

  const handleFinalize = () =>
    navigate("/report", { state: { selections, avatarData, avatarConfig: { ...(avatarConfig || {}), hair: selectedHair, gender: canonicalGender } } });

  const handleSaveLook = () => {
    if (Object.values(selections).every((v) => !v)) { alert("Select some items first!"); return; }
    setTempLookName(`Look ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setShowSaveModal(true);
  };

  const executeSaveLook = async (finalName) => {
    setIsSaving(true);
    const look = {
      name: finalName || `Look ${new Date().toLocaleTimeString()}`,
      gender: canonicalGender,
      avatarConfig: { ...(avatarConfig || {}), hair: selectedHair, gender: canonicalGender },
      avatarData: avatarData || null,
      selections,
      createdAt: serverTimestamp()
    };

    try {
      if (user) {
        await addDoc(collection(db, "users", user.uid, "looks"), look);
        alert("Look saved to your account!");
      } else {
        const e = JSON.parse(localStorage.getItem("shadow_fit_looks") || "[]");
        localStorage.setItem("shadow_fit_looks", JSON.stringify([...e, { ...look, id: Date.now(), createdAt: null, date: new Date().toLocaleDateString() }]));
        alert("Look saved locally (Guest Mode)!");
      }
      setShowSaveModal(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save look.");
    } finally {
      setIsSaving(false);
    }
  };

  const liveAvatarConfig = useMemo(() => ({ ...(avatarConfig || {}), gender: canonicalGender, hair: selectedHair }), [avatarConfig, canonicalGender, selectedHair]);
  const activeSlotCount = Object.values(selections).filter(Boolean).length;

  const [selectedBrand, setSelectedBrand] = useState("Zara");

  const handleNavToHeatmap = () => {
    if (activeSlotCount === 0) {
      alert("⚠️ Please try on at least one clothing piece before running the Fit Check Heatmap.");
      return;
    }
    navigate("/heatmap", { 
      state: { 
        selections, 
        avatarData, 
        avatarConfig: liveAvatarConfig, 
        measurements: resolvedMeasurements, 
        size: passedSize || avatarSize,
        selectedBrand // Passing the brand to heatmap
      } 
    });
  };

  const wardrobeItems = useMemo(() => getWardrobeItems(uiGender, activeCategory), [uiGender, activeCategory]);

  // ✅ Fit pill — PERFECT FIT when avatarSize === clothSize
  const fitInfo = useMemo(() => {
    if (!avatarSize || !activeItem) return null;
    return getFitInfo(avatarSize, selectedClothSize || avatarSize);
  }, [avatarSize, activeItem, selectedClothSize]);

  /* ── Left panel routing ── */
  const renderLeftPanel = () => {
    if (isHairCategory)
      return <div className="flex-1 p-5 overflow-hidden flex flex-col"><HairPanel canonicalGender={canonicalGender} selectedHair={selectedHair} onSelectHair={setSelectedHair} /></div>;

    if (showColorPicker && activeItem)
      return (
        <div className="flex-1 p-5 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setShowColorPicker(false)} className="p-2 rounded-xl bg-white/60 text-gray-500 hover:text-gray-700 border border-black/5 transition-all"><ChevronLeft size={18} /></button>
            <p className="text-base font-black uppercase tracking-widest text-[#8a7c65]">Customize Color</p>
          </div>
          <ColorPickerPanel item={activeItem} color={activeColor} onColorChange={handleColorChange} onReset={handleColorReset} onDone={handleDone} />
        </div>
      );

    if (activeCategory === "Search")
      return (
        <div className="flex-1 p-4 overflow-hidden flex flex-col">
          <VisualSearchPanel
            uiGender={uiGender}
            avatarConfig={avatarConfig}
            onSelectItem={(item) => handleItemPick(item, null, false)}
            onPreviewItem={(item) => handleItemPick(item, null, false)}
          />
        </div>
      );

    if (activeSubcat)
      return (
        <div className="flex-1 p-5 overflow-hidden flex flex-col">
          <ClothingItemPanel
            uiGender={uiGender}
            activeCategory={activeCategory}
            subcategory={activeSubcat}
            selectedItem={activeItem}
            onSelectItem={handleItemPick}
            onConfirmSelection={handleConfirmSelection}
            onBack={() => setActiveSubcat(null)}
            avatarSize={avatarSize}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
          />
        </div>
      );

    return (
      <div className="flex flex-col h-full">
        <div className="px-4 mb-6">
          <p className="text-2xl font-black uppercase tracking-widest text-[#8a7c65]">Wardrobe</p>
          <p className="text-sm text-gray-500 max-w-[26rem]">Browse the latest {getCategoryLabel(activeCategory)} styles, swipe through the shelf, and tap any look to try it on instantly.</p>
        </div>

        <div className="px-4 mb-6">
          <WardrobeCarousel items={wardrobeItems} activeItem={activeItem} onSelectItem={(item) => handleItemPick(item, null, false)} />
          {activeItem && !showColorPicker && activeCategory !== "Search" && activeCategory !== "Hair" && !activeSubcat && (
            <div className="mt-4 px-2">
               <Motion.button
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 onClick={handleConfirmSelection}
                 className="w-full py-4 bg-[#1a1a1a] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-2"
               >
                 Customize Selected Cloth <Check size={18} />
               </Motion.button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <SubcatGrid uiGender={uiGender} activeCategory={activeCategory} onPick={handleSubcatPick} />
        </div>
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <div className="relative min-h-screen text-[#1a1a1a] font-['Inter',sans-serif] overflow-hidden flex flex-col">
      <Motion.div initial={{ scale: 1 }} animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", willChange: "transform", opacity: 0.4 }} />

      <div className="absolute top-0 left-0 right-0 z-30 pointer-events-auto"><Navbar /></div>

      <div className="relative z-20 flex flex-col min-h-screen">
        <main className="flex-1 flex overflow-hidden">

          {/* ════ LEFT PANEL ════ */}
          <aside className="w-full md:w-[500px] border-r border-black/5 bg-white/10 backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="p-5 pt-24 flex flex-col gap-3 border-b border-black/5 bg-white/20 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(location.state?.fromFavorites ? "/favorites" : "/body-details", { state: { selections, avatarData, avatarConfig, measurements: resolvedMeasurements, size: passedSize || avatarSize } })}
                  className="p-2.5 bg-white/60 text-gray-500 rounded-xl hover:bg-white transition-all active:scale-95 backdrop-blur-sm border border-black/5"><ChevronLeft size={22} /></button>
                <div className="w-10 h-10 bg-[#8a7c65] rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"><ShoppingBag size={20} /></div>
                <div className="flex-1">
                  <h1 className="text-lg font-black tracking-widest uppercase text-gray-800">OUTFIT BUILDER</h1>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Digital Twin Studio</p>
                </div>
              </div>

            </div>

            {/* AI Search Button — "Outside the panel" / Big button */}
            <div className="px-5 pt-4 flex-shrink-0">
              <Motion.button
                onClick={() => handleCategoryChange("Search")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all relative overflow-hidden
                  ${activeCategory === "Search"
                    ? "bg-[#332b1e] text-white"
                    : "bg-[#2a2620] text-white"}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#4a4238] flex items-center justify-center text-white flex-shrink-0">
                  <Scan size={24} />
                </div>

                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-[14px] font-black uppercase tracking-widest">Visual AI Search</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scan your own clothes</span>
                </div>

                <div className="ml-auto w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/30">
                  <ChevronRight size={18} />
                </div>
              </Motion.button>
            </div>

            {/* Category tabs */}
            <div className="p-4 flex gap-3 overflow-x-auto no-scrollbar flex-shrink-0 px-5">
              {allCategories.map((cat) => (
                <button key={cat} onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-widest border
                    ${activeCategory === cat 
                      ? "bg-slate-900 text-white border-slate-900" 
                      : "bg-white text-gray-500 border-gray-100 shadow-sm"}`}>
                  {cat === "Hair" ? <span className="flex items-center gap-2"><Scissors size={14} />Hair</span> : getCategoryLabel(cat)}
                </button>
              ))}
            </div>

            {/* Breadcrumb */}
            {!isHairCategory && activeCategory !== "Search" && (activeSubcat || showColorPicker) && (
              <div className="px-5 py-2.5 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/5 border-b border-black/5 flex-shrink-0">
                <button onClick={handleDone} className="hover:text-[#8a7c65] transition-colors">{activeCategory}</button>
                {activeSubcat && (<><span className="opacity-40">›</span><button onClick={() => { setShowColorPicker(false); setActiveItem(null); setActiveColor(null); }} className="hover:text-[#8a7c65] transition-colors">{activeSubcat}</button></>)}
                {showColorPicker && (<><span className="opacity-40">›</span><span className="text-[#8a7c65]">Color</span></>)}
              </div>
            )}

            {renderLeftPanel()}
          </aside>

          {/* ════ 3D PREVIEW ════ */}
          <section className="flex-1 relative bg-transparent">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
              {isHairCategory && selectedHair && (
                <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="px-5 py-2 rounded-full border flex items-center gap-2 shadow-sm backdrop-blur-sm"
                  style={{ backgroundColor: "rgba(245,240,232,0.90)", borderColor: "#8a7c6533" }}>
                  <Scissors size={14} style={{ color: "#8a7c65" }} />
                  <span className="text-sm font-black tracking-widest" style={{ color: "#8a7c65" }}>{HAIR_LABELS[selectedHair] || selectedHair}</span>
                </Motion.div>
              )}
              {/* ✅ PERFECT FIT pill */}
              {!isHairCategory && fitInfo && (
                <Motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  className="px-5 py-2 rounded-full border flex items-center gap-2 shadow-sm backdrop-blur-sm"
                  style={{ backgroundColor: `${fitInfo.bg}cc`, borderColor: `${fitInfo.color}33` }}>
                  <span className="text-base">{fitInfo.icon}</span>
                  <span className="text-sm font-black tracking-widest" style={{ color: fitInfo.color }}>{fitInfo.label}</span>
                </Motion.div>
              )}
            </div>

            <div className="absolute inset-0">
              <button onClick={() => setShowFitIndicators((v) => !v)}
                className={`absolute top-6 right-6 z-20 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-sm font-black uppercase tracking-wider transition-all border
                  ${showFitIndicators ? "bg-[#8a7c65] text-white shadow-lg border-[#8a7c65]" : "bg-white/80 text-gray-500 hover:bg-white shadow-sm border-gray-100"}`}>
                <Activity size={16} />{showFitIndicators ? "Hide Fit Check" : "Live Fit Check"}
              </button>
              {webGLAvailable ? (
                <CanvasErrorBoundary fallback={<NoWebGLBanner />}>
                  <AvatarCanvas avatarConfig={liveAvatarConfig} avatarData={avatarData} gender={canonicalGender}
                    selections={selections} pendingItem={pendingItem} analysisData={analysisData} showHeatmap={showFitIndicators} />
                </CanvasErrorBoundary>
              ) : <NoWebGLBanner />}
            </div>
          </section>

          {/* ════ OUTFIT SUMMARY ════ */}
          <aside className="hidden lg:flex w-[340px] border-l border-black/5 bg-black/20 backdrop-blur-3xl flex-col">
            <div className="p-8 border-b border-white/5 bg-white/5">
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">YOUR OUTFIT</h2>
              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center gap-2.5 bg-white/10 text-white/90 text-sm px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                   <span className={`w-2.5 h-2.5 rounded-full ${activeSlotCount > 0 ? "bg-white shadow-[0_0_8px_white]" : "bg-gray-500"}`} />
                  {activeSlotCount} {activeSlotCount === 1 ? "slot" : "slots"} active
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {selectedHair && selectedHair !== "none" && (
                <Motion.div layout className="p-5 rounded-3xl bg-white/10 border border-white/10 relative group backdrop-blur-xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <span className="text-[10px] font-black uppercase px-4 py-1.5 rounded-full text-white bg-[#8a3a1e] tracking-widest">Hair</span>
                    <div className="flex gap-2">
                       <button onClick={() => handleCategoryChange("Hair")} className="w-10 h-10 bg-white/10 rounded-xl text-white hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all shadow-lg backdrop-blur-md"><Edit3 size={18} /></button>
                       <button onClick={() => setSelectedHair("none")} className="w-10 h-10 bg-white/10 rounded-xl text-white hover:bg-red-500/30 border border-white/10 flex items-center justify-center transition-all shadow-lg backdrop-blur-md"><Trash2 size={18} /></button>
                    </div>
                  </div>

                  <p className="text-[17px] font-black text-white leading-tight mb-1 relative z-10">{HAIR_LABELS[selectedHair] || selectedHair}</p>
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest relative z-10">{selectedHair}</p>
                </Motion.div>
              )}

              {Object.values(selections).every((v) => !v) && !selectedHair ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-40 pt-16">
                  <ShoppingBag size={52} className="text-gray-200 mb-4" />
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Your outfit is empty</p>
                </div>
              ) : (
                Object.keys(selections).filter((cat) => selections[cat]).map((cat) => {
                  const s = selections[cat];
                  const thumbSrc = getClothingImage(s.meshName || s.name);
                  return (
                    <Motion.div key={cat} layoutId={cat} className="p-5 rounded-3xl bg-white/10 border border-white/10 relative group backdrop-blur-xl shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full text-white tracking-widest ${CATEGORY_COLORS[cat] || "bg-[#8a3a1e]"}`}>{cat}</span>
                        <div className="flex gap-2">
                          <button onClick={() => removeSlot(cat)} className="w-10 h-10 bg-white/10 rounded-xl text-white hover:bg-red-500/30 border border-white/10 flex items-center justify-center transition-all shadow-lg backdrop-blur-md"><Trash2 size={18} /></button>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start relative z-10">
                        {thumbSrc && (
                          <div className="w-14 h-20 rounded-xl overflow-hidden border border-white/10 shadow-xl flex-shrink-0">
                             <img src={thumbSrc} alt={s.meshName} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[17px] font-black text-white mb-1 truncate leading-tight">{s.meshName?.replace(/_/g," ") || s.name}</p>
                          <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest mb-3">{s.outfit || s.meshName}</p>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-white/60 font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                              SIZE <span className="text-white ml-1">{s.size}</span>
                            </span>
                            {s.color && <div className="ml-auto w-6 h-6 rounded-full border-2 border-white/20 shadow-inner" style={{ backgroundColor: s.color }} />}
                          </div>
                        </div>
                      </div>
                    </Motion.div>
                  );
                })
              )}
            </div>

            <div className="p-8 border-t border-white/10 bg-white/5 backdrop-blur-3xl mt-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Motion.button onClick={handleSaveLook} whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-[1.5rem] text-sm font-black bg-white text-gray-800 shadow-xl transition-all">
                  <Save size={16} /><span>{user ? "Cloud Save" : "Save Look"}</span>
                </Motion.button>
                <Motion.button
                  onClick={handleNavToHeatmap}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-2 py-3.5 px-3 rounded-[1.5rem] text-sm font-black bg-white/10 text-white border border-white/20 shadow-lg backdrop-blur-md transition-all">
                  <Activity size={16} /><span>Fit Check</span>
                </Motion.button>
              </div>

              <Motion.button onClick={handleFinalize} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                className="w-full py-5 rounded-[1.5rem] text-base font-black flex items-center justify-center gap-3 bg-[#0a0a0a] text-white shadow-2xl relative overflow-hidden group border-t border-white/20">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <Check size={20} />
                <span className="uppercase tracking-[0.2em]">Finalize Outfit</span>
              </Motion.button>

              <div className="relative group">
                <button onClick={() => setSelections({ top: null, bottom: null, dress: null, special: null, footwear: null, hat: null })}
                  className="w-full py-4 text-base font-bold text-white/50 hover:text-white transition-all tracking-wide border border-white/10 rounded-[1.5rem] bg-transparent flex items-center justify-center relative">
                  Clear all selections
                </button>
              </div>
            </div>
          </aside>
        </main>

        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <button onClick={handleFinalize} className="w-16 h-16 bg-[#3C3489] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform">
            <Check size={28} />
          </button>
        </div>

        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none }
          .custom-scrollbar::-webkit-scrollbar { width: 4px }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px }
        `}</style>
        <div className="mt-12">
          <Footer isLightPage={true} />
        </div>

        {/* ── SAVING MODAL ── */}
        <AnimatePresence>
          {showSaveModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowSaveModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

              <Motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8a7c65] rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-gray-800">Name Your Look</h3>
                  </div>
                  <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-400" /></button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8a7c65] mb-2 block">Look Title</label>
                    <input autoFocus type="text" value={tempLookName} onChange={(e) => setTempLookName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeSaveLook(tempLookName)}
                      placeholder="e.g. Summer Outing" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8a7c65]/20 focus:bg-white text-gray-800 font-bold transition-all" />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button onClick={() => setShowSaveModal(false)} className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                    <button onClick={() => executeSaveLook(tempLookName)} disabled={isSaving || !tempLookName.trim()}
                      className="flex-1 py-4 bg-[#8a7c65] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#8a7c65]/30 hover:bg-[#7a6c55] disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      {isSaving ? "Saving..." : <><Check size={18} /> Confirm</>}
                    </button>
                  </div>
                </div>
              </Motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}