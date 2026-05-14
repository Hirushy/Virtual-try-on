// src/pages/measurements/VisualSearchPanel.jsx
"use client";

import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
    Search, X, Check, Sparkles,
    RefreshCw, ShoppingBag, Camera, AlertCircle,
} from "lucide-react";

import { CATALOG } from "./CatalogData";
import { maleClothes, femaleClothes } from "./clothes";
import {
    BRAND_LIST,
    BRAND_DISPLAY_NAMES,
    getRecommendedBrandSize,
    categoryToGarmentType,
} from "./BrandSizeData";
import { useAuth } from "../../context/AuthContext";

// ─────────────────────────────────────────────────────────────────────────────
// STYLE CATALOG MAP — Granular mapping for filename & AI detection
// ─────────────────────────────────────────────────────────────────────────────
const STYLE_CATALOG_MAP = {
    // Original AI codes
    ns: ["Top_Blouse1", "Top_Blouse8", "Top_Crop1", "Top_Crop2", "Top_Crop6", "Top_Crop8", "Top_Crop9", "Top_Crop10", "Top_T-shirt8"],
    ws: ["Top_Blouse2", "Top_Blouse3", "Top_Blouse4", "Top_Blouse5", "Top_Blouse6", "Top_Blouse7", "Top_Blouse9", "Top_Blouse10", "Top_Crop3", "Top_Crop7", "Top_T-shirt1", "Top_T-shirt2", "Top_T-shirt3", "Top_T-shirt4", "Top_T-shirt5", "Top_T-shirt6", "Top_T-shirt7", "Top_T-shirt9", "Top_T-shirt10"],
    sw: ["Top_T-shirt2", "Top_T-shirt5", "Top_T-shirt6", "Top_T-shirt10", "Bottom_Jeans3", "Bottom_Jeans5", "Bottom_Jeans7", "Bottom_Shorts1", "Bottom_Shorts2", "Bottom_Trouser3", "SC_Loungewear1", "SC_Loungewear2"],
    ofw: ["Top_Blouse1", "Top_Blouse2", "Top_Blouse4", "Top_Blouse9", "Top_Crop1", "Top_Crop10", "Bottoms_Skirt1", "Bottoms_Skirt2", "Bottoms_Skirt3", "Bottoms_Skirt4", "Bottoms_Skirt5", "Bottoms_Skirt6", "Bottoms_Skirt7", "Bottoms_Skirt8"],
    p: ["Dress_midi1", "Dress_midi2", "Dress_midi5", "Dress_mini1", "Dress_mini2", "Dress_mini3", "Dress_mini4", "Dress_Maxi1", "Top_Crop1", "Top_Crop2", "Top_Crop3", "Top_Crop5", "Top_Crop6", "Top_Crop7", "Top_Crop8", "Top_Crop9", "Top_Crop10"],
    swim: ["SP_Activewear1", "SP_Activewear2"],

    // New specific filename triggers (Women)
    jeans: ["Bottom_Jeans2", "Bottom_Jeans3", "Bottom_Jeans4", "Bottom_Jeans5", "Bottom_Jeans6", "Bottom_Jeans7", "Bottom_Jeans8", "Bottom_Trouser1", "Bottom_Trouser2", "Bottom_Trouser3"],
    skirt: ["Bottoms_Skirt1", "Bottoms_Skirt2", "Bottoms_Skirt3", "Bottoms_Skirt4", "Bottoms_Skirt5", "Bottoms_Skirt6", "Bottoms_Skirt7", "Bottoms_Skirt8"],
    dress: ["Dress_Maxi1", "Dress_midi1", "Dress_midi2", "Dress_midi3", "Dress_midi4", "Dress_midi5", "Dress_mini1", "Dress_mini2", "Dress_mini3", "Dress_mini4"],
    sl: ["Top_Blouse1", "Top_Crop1", "Top_Crop2", "Top_Crop5", "Top_Crop6", "Top_Crop7", "Top_Crop8", "Top_Crop9", "Top_Crop10"],
    shirt: ["Top_T-shirt1", "Top_T-shirt2", "Top_T-shirt3", "Top_T-shirt4", "Top_T-shirt5", "Top_T-shirt6", "Top_T-shirt7", "Top_T-shirt8", "Top_T-shirt9", "Top_T-shirt10"],
    hat: ["Hat_Black1", "Hat_Gray2.001"],
    b: ["Top_Blouse1", "Top_Blouse2", "Top_Blouse3", "Top_Blouse4", "Top_Blouse5", "Top_Blouse6", "Top_Blouse7", "Top_Blouse8", "Top_Blouse9", "Top_Blouse10"],

    // New specific filename triggers (Men)
    pants: ["Bottom_Shorts1", "Bottoms_Jeans1", "Bottoms_Jeans2", "Bottoms_Pants2", "Bottoms_Pants3", "Bottoms_Pants4", "Bottoms_Pants5", "Bottoms_Pants6"],
    mshirt: ["Top_T-shirt1", "Top_T-shirt2", "Top_T-shirt3", "Top_T-shirt4", "Top_T-shirt5", "Top_T-shirt6", "Top_T-shirt7", "Top_T-shirt8", "Top_T-shirt9", "Top_T-shirt10", "Top_T-shirt11", "Top_T-shirt12", "Top_T-shirt13", "Top_T-shirt14"],
};

const STYLE_LABELS = {
    // Original labels
    ns:   { label: "No Sleeve", emoji: "🩱", color: "#f43f5e", bg: "#fff1f2" },
    ws:   { label: "With Sleeve", emoji: "👕", color: "#3b82f6", bg: "#eff6ff" },
    sw:   { label: "Street Wear", emoji: "🧢", color: "#8b5cf6", bg: "#f5f3ff" },
    ofw:  { label: "Office Wear", emoji: "💼", color: "#0ea5e9", bg: "#f0f9ff" },
    p:    { label: "Party Wear", emoji: "🎉", color: "#ec4899", bg: "#fdf2f8" },
    swim: { label: "Activewear", emoji: "🏊", color: "#10b981", bg: "#ecfdf5" },

    // New labels for manual triggers
    jeans:  { label: "Jeans & Trousers", emoji: "👖", color: "#3b82f6", bg: "#eff6ff" },
    skirt:  { label: "Skirts", emoji: "💃", color: "#ec4899", bg: "#fdf2f8" },
    dress:  { label: "Dresses", emoji: "👗", color: "#8b5cf6", bg: "#f5f3ff" },
    sl:     { label: "Sleeveless / Crop", emoji: "🎽", color: "#f43f5e", bg: "#fff1f2" },
    shirt:  { label: "T-Shirts", emoji: "👕", color: "#0ea5e9", bg: "#f0f9ff" },
    hat:    { label: "Hats & Caps", emoji: "🎩", color: "#78716c", bg: "#fafaf9" },
    b:      { label: "Blouses", emoji: "👚", color: "#f472b6", bg: "#fdf2f8" },
    pants:  { label: "Men's Bottoms", emoji: "🩳", color: "#0f172a", bg: "#f1f5f9" },
    mshirt: { label: "Men's T-Shirts", emoji: "👔", color: "#1e293b", bg: "#f8fafc" },
};

const FIT_CONFIG = {
    perfect: { label: "Perfect Fit", color: "#10b981", icon: "💎" },
    slightly_loose: { label: "Slightly Relaxed", color: "#3b82f6", icon: "✨" },
    slightly_snug: { label: "Slightly Snug", color: "#f59e0b", icon: "🔥" },
    approximate: { label: "Closest Size", color: "#8b5cf6", icon: "📐" },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function buildImageLookup() {
    const map = {};
    [...maleClothes, ...femaleClothes].forEach((item) => {
        if (item.meshName && item.image) map[item.meshName] = item.image;
    });
    return map;
}
const IMAGE_LOOKUP = buildImageLookup();
const getImageByMesh = (m) => IMAGE_LOOKUP[m] || null;

function buildCatalogIndex() {
    const index = {};
    ["Women", "Men"].forEach((gender) => {
        (CATALOG.categories[gender] || []).forEach((cat) => {
            (CATALOG.subcategories[gender]?.[cat] || []).forEach((sub) => {
                const key = `${gender}__${cat}__${sub}`;
                (CATALOG.clothingItems[key] || []).forEach((item) => {
                    index[item.meshName] = { ...item, __gender: gender, __category: cat, __subcat: sub };
                });
            });
        });
    });
    return index;
}
const CATALOG_INDEX = buildCatalogIndex();
const UNISEX_CODES = new Set(["hat", "swim", "sw"]);

function getItemsForStyle(styleCode, uiGender) {
    return (STYLE_CATALOG_MAP[styleCode] || [])
        .map((meshName) => {
            const item = CATALOG_INDEX[meshName];
            if (!item) return null;
            // Only filter by gender if it's not a unisex code
            if (!UNISEX_CODES.has(styleCode) && item.__gender !== uiGender) return null;
            return { ...item, image: getImageByMesh(meshName) };
        })
        .filter(Boolean);
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const [header, data] = reader.result.split(",");
            resolve({ base64: data, mediaType: header.match(/:(.*?);/)?.[1] || "image/jpeg" });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function detectStyleViaBackend(base64Image, mediaType, apiBase) {
    const url = `${apiBase}/api/visual-search`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: base64Image, mediaType }),
    });
    if (!response.ok) throw new Error(`Server error ${response.status}`);
    const data = await response.json();
    return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function ScanLines() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]">
            <Motion.div animate={{ y: ["-100%", "200%"] }} transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                style={{ position: "absolute", left: 0, right: 0, height: "2px", background: "linear-gradient(90deg,transparent,#8a7c65,#d4a892,#8a7c65,transparent)", boxShadow: "0 0 14px 5px rgba(138,124,101,0.45)" }} />
        </div>
    );
}

function UploadZone({ onFile, imagePreview, onClear, scanning }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    return (
        <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f?.type.startsWith("image/")) onFile(f); }}
            onClick={() => !imagePreview && inputRef.current?.click()}
            className={`relative rounded-[2rem] overflow-hidden transition-all duration-300 border max-w-[260px] mx-auto shadow-sm
                ${dragging ? "border-[#8a7c65] scale-[1.02]" : "border-[#e2e0db]"}
                ${!imagePreview ? "cursor-pointer hover:border-[#8a7c65]/50" : ""}`}
            style={{ aspectRatio: "1/1.1", background: imagePreview ? "white" : (dragging ? "#f0ebe3" : "#e8e7e1") }}>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
            {imagePreview ? (
                <>
                    <img src={imagePreview} alt="Garment" className="w-full h-full object-contain p-4" />
                    {scanning && <ScanLines />}
                    {scanning && <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center gap-3 rounded-[2rem]">
                        <div className="w-12 h-12 rounded-full border-2 border-[#d4a892] border-t-transparent animate-spin" />
                        <p className="text-white text-[11px] font-black uppercase tracking-widest">AI Analysing...</p>
                    </div>}
                    {!scanning && <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"><X size={18} /></button>}
                </>
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                    <div className="w-20 h-20 rounded-full bg-white/50 flex items-center justify-center shadow-inner"><Camera size={30} className="text-gray-400" /></div>
                    <div className="text-center px-4">
                        <p className="text-[17px] font-black text-[#1e1e1e] uppercase tracking-widest leading-tight">DROP CLOTHING<br />IMAGE</p>
                        <p className="text-[11px] text-gray-400 mt-3 font-bold tracking-widest">or click to browse<br />JPG · PNG · WEBP</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function BrandSelector({ selected, onSelect }) {
    return (
        <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">SELECT BRAND</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {BRAND_LIST.map((key) => (
                    <button key={key} onClick={() => onSelect(key)}
                        className={`py-2 px-4 rounded-full text-[11px] font-black whitespace-nowrap transition-all border flex-shrink-0
                            ${selected === key ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                        {BRAND_DISPLAY_NAMES[key] || key}
                    </button>
                ))}
            </div>
        </div>
    );
}

function StyleBadge({ detection }) {
    const style = STYLE_LABELS[detection?.styleCode];
    if (!style) return null;
    return (
        <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border overflow-hidden" style={{ borderColor: `${style.color}30`, background: style.bg }}>
            <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `${style.color}18` }}>{style.emoji}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ background: style.color }}>{detection.styleCode.toUpperCase()}</span>
                        <span className="text-[11px] font-black uppercase tracking-widest" style={{ color: style.color }}>{style.label}</span>
                    </div>
                    <p className="text-[12px] font-bold text-gray-600 mt-1 truncate capitalize">{detection.garmentType} · {detection.color}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-[20px] font-black" style={{ color: style.color }}>{detection.confidence}%</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">match</p>
                </div>
            </div>
            <div className="px-4 pb-3 border-t" style={{ borderColor: `${style.color}15` }}>
                <div className="flex items-start gap-2 pt-2.5">
                    <Sparkles size={12} style={{ color: style.color }} className="flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-500 font-medium leading-snug">{detection.reason}</p>
                </div>
            </div>
        </Motion.div>
    );
}

function SizeResult({ result, brandKey }) {
    if (!result) return null;
    const cfg = FIT_CONFIG[result.fit] || FIT_CONFIG.perfect;
    return (
        <Motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4 p-4 rounded-2xl border bg-white border-gray-100 shadow-sm">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black flex-shrink-0 shadow-md" style={{ background: cfg.color }}>{result.size}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-[#8a7c65] uppercase tracking-widest">{cfg.icon} {cfg.label} · {BRAND_DISPLAY_NAMES[brandKey]}</p>
                <p className="text-xs text-gray-500 font-bold mt-1 leading-snug">{result.note}</p>
            </div>
        </Motion.div>
    );
}

function MatchedItemCard({ item, isPreview, isSelected, onPreview, onSelect }) {
    const [imgErr, setImgErr] = useState(false);
    const imgSrc = !imgErr ? (item.image || getImageByMesh(item.meshName)) : null;
    const active = isPreview || isSelected;
    return (
        <Motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border overflow-hidden transition-all cursor-pointer group ${active ? "border-[#8a7c65] shadow-lg shadow-[#8a7c65]/15" : "border-gray-100 hover:border-[#8a7c65]/40"}`} onClick={() => onPreview(item)}>
            <div className="w-full aspect-[3/4] bg-gray-50 relative overflow-hidden">
                {imgSrc ? <img src={imgSrc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={() => setImgErr(true)} alt={item.meshName} /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={24} className="text-gray-300" /></div>}
                {active && <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#8a7c65] flex items-center justify-center shadow-md"><Check size={11} className="text-white" /></div>}
            </div>
            <div className="p-2">
                <p className="text-[9px] font-black uppercase text-gray-500 text-center truncate leading-tight">{item.meshName.replace(/_/g, " ")}</p>
                <AnimatePresence>
                    {isPreview && !isSelected && <Motion.button initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1.5 w-full py-1.5 bg-[#8a7c65] text-white text-[9px] font-black uppercase tracking-widest rounded-lg overflow-hidden" onClick={(e) => { e.stopPropagation(); onSelect(item); }}>Add to Outfit</Motion.button>}
                    {isSelected && <Motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-1.5 w-full py-1.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-1 overflow-hidden"><Check size={10} /> Added</Motion.div>}
                </AnimatePresence>
            </div>
        </Motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────
export default function VisualSearchPanel({ uiGender = "Women", avatarConfig, onSelectItem, onPreviewItem }) {
    const { API_BASE } = useAuth();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [detection, setDetection] = useState(null);
    const [matchedItems, setMatchedItems] = useState([]);
    const [sizeResult, setSizeResult] = useState(null);
    const [previewItem, setPreviewItem] = useState(null);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectedBrand, setSelectedBrand] = useState("ZARA");
    const [error, setError] = useState(null);

    const avatarMeasurements = useMemo(() => ({
        bust: avatarConfig?.chest || 92,
        waist: avatarConfig?.waist || 76,
        hips: avatarConfig?.hips || 100,
    }), [avatarConfig]);

    const styleInfo = useMemo(() => detection ? STYLE_LABELS[detection.styleCode] : null, [detection]);

    const resetState = useCallback(() => {
        setDetection(null); setMatchedItems([]); setSizeResult(null); setPreviewItem(null); setSelectedItems(new Set()); setError(null);
    }, []);

    const handleFile = useCallback((file) => {
        setImageFile(file); setImagePreview(URL.createObjectURL(file)); resetState();
    }, [resetState]);

    const handleClear = useCallback(() => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null); setImagePreview(null); resetState();
    }, [imagePreview, resetState]);

    // ─── Reactive Sizing Update ───
    // Updates size result instantly when brand changes or detection happens
    useEffect(() => {
        if (!detection) {
            setSizeResult(null);
            return;
        }
        const garmentType = categoryToGarmentType(detection.garmentType || detection.styleCode);
        const sizing = getRecommendedBrandSize(selectedBrand, garmentType, avatarMeasurements, avatarConfig);
        setSizeResult(sizing);
    }, [selectedBrand, detection, avatarMeasurements, avatarConfig]);

    const handleScan = useCallback(async () => {
        if (!imageFile || scanning) return;
        setScanning(true);
        // Note: we don't reset sizeResult here anymore so it doesn't flicker 
        // until the new detection is ready.
        setDetection(null); setMatchedItems([]); setPreviewItem(null); setSelectedItems(new Set()); setError(null);
        
        try {
            const fname = imageFile.name.toLowerCase();
            let styleCode = null;
            const codes = Object.keys(STYLE_CATALOG_MAP);
            for (const code of codes) {
                const regex = new RegExp(`(^|[^a-z])${code}([^a-z]|$)`, 'i');
                if (regex.test(fname)) {
                    styleCode = code;
                    break;
                }
            }
            let result;
            if (styleCode) {
                result = {
                    styleCode: styleCode, confidence: 100,
                    reason: `Manual filename override detected: "${imageFile.name}"`,
                    color: "Auto", garmentType: STYLE_LABELS[styleCode]?.label || "Clothing"
                };
            } else {
                const { base64, mediaType } = await fileToBase64(imageFile);
                result = await detectStyleViaBackend(base64, mediaType, API_BASE);
            }
            setDetection(result);
            const items = getItemsForStyle(result.styleCode, uiGender);
            setMatchedItems(items);
            
            if (items.length > 0 && onPreviewItem) {
                setPreviewItem(items[0]);
                onPreviewItem({ ...items[0], __fromVisualSearch: true, __category: items[0].__category || "top" });
            }
        } catch (err) {
            console.error("Visual search error:", err);
            setError(err.message || "Failed to analyse. Try again.");
        } finally {
            setScanning(false);
        }
    }, [imageFile, scanning, uiGender, API_BASE, onPreviewItem]);

    const handlePreview = useCallback((item) => {
        setPreviewItem(item);
        if (onPreviewItem) onPreviewItem({ ...item, __fromVisualSearch: true, __category: item.__category || "top" });
    }, [onPreviewItem]);

    const handleSelect = useCallback((item) => {
        setSelectedItems((prev) => new Set([...prev, item.id]));
        if (onSelectItem) onSelectItem({ ...item, __fromVisualSearch: true, __category: item.__category || "top" });
    }, [onSelectItem]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="px-1 mb-5 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-[22px] font-black text-[#96866b] uppercase tracking-[0.08em] leading-none">VISUAL SEARCH</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">AI · UPLOAD → DETECT → MATCH</p>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-[#f0ebff] text-[#7c3aed] text-[9px] font-black uppercase tracking-widest border border-[#7c3aed]/10">AI-POWERED</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1 pb-4">
                <UploadZone onFile={handleFile} imagePreview={imagePreview} onClear={handleClear} scanning={scanning} />
                <BrandSelector selected={selectedBrand} onSelect={setSelectedBrand} />
                <button onClick={handleScan} disabled={!imageFile || scanning}
                    className={`w-full py-4 rounded-2xl text-[14px] font-black uppercase tracking-[0.2em] border transition-all flex items-center justify-center gap-3
                        ${!imageFile || scanning ? "bg-white/50 text-gray-300 border-gray-100 cursor-not-allowed" : "bg-black text-white border-black hover:bg-gray-900 active:scale-[0.98]"}`}>
                    {scanning ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> DETECTING...</> : "🔍  SCAN & FIND MATCHES"}
                </button>
                <AnimatePresence>{error && <Motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100"><AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" /><div className="flex-1 min-w-0"><p className="text-xs font-black text-red-700 uppercase tracking-wide">Analysis Failed</p><p className="text-[11px] text-red-400 mt-0.5 leading-snug">{error}</p></div><button onClick={() => setError(null)} className="text-red-300 hover:text-red-500 flex-shrink-0"><X size={14} /></button></Motion.div>}</AnimatePresence>
                {!imageFile && !detection && <div className="py-10 flex flex-col items-center text-center opacity-40"><Search size={48} className="text-gray-300" /><p className="mt-5 text-base font-black text-gray-700 uppercase tracking-widest">UPLOAD A CLOTHING PHOTO</p><p className="text-xs text-gray-400 mt-2 font-bold uppercase leading-relaxed">Try naming files: jeans, skirt, dress, shirt, etc.</p></div>}
                <AnimatePresence>{sizeResult && <Motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><SizeResult result={sizeResult} brandKey={selectedBrand} /></Motion.div>}</AnimatePresence>
                <AnimatePresence>{matchedItems.length > 0 && <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2">{styleInfo && <span className="text-base">{styleInfo.emoji}</span>}<p className="text-[11px] font-black uppercase tracking-[0.15em]" style={{ color: styleInfo?.color || "#8a7c65" }}>{styleInfo?.label || "Matches"} · {matchedItems.length} items</p></div><button onClick={handleScan} disabled={scanning} className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#8a7c65] transition-colors disabled:opacity-40"><RefreshCw size={10} /> Retry</button></div>
                    <div className="grid grid-cols-3 gap-2.5">{matchedItems.map((item) => <MatchedItemCard key={item.id} item={item} isPreview={previewItem?.id === item.id} isSelected={selectedItems.has(item.id)} onPreview={handlePreview} onSelect={handleSelect} />)}</div>
                </Motion.div>}</AnimatePresence>
                <AnimatePresence>{detection && matchedItems.length === 0 && !scanning && <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center text-center opacity-60"><ShoppingBag size={36} className="text-gray-300 mb-3" /><p className="text-sm font-black text-gray-500 uppercase tracking-widest">No Catalog Matches</p><p className="text-xs text-gray-400 mt-1 font-medium">No items for "{styleInfo?.label}" in {uiGender} catalog</p></Motion.div>}</AnimatePresence>
            </div>
        </div>
    );
}