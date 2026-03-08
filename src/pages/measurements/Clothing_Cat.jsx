// ✅ UPDATED: src/pages/measurements/Clothing_Cat.jsx
// ✅ Adds: Upload Clothing Photo → Suggest → Filter catalog (NO HARM to your current flow)
// ✅ Keeps: your existing selection flow + AvatarCanvas wiring + clothInstanceId logic

"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { motion as Motion } from "framer-motion";

import { CATALOG } from "./catalogData";
import { CLOTH_OBJ_MAP } from "./glbMap";
import AvatarCanvas from "./AvatarCanvas";

// ✅ NEW helper (client-side scan)
import { classifyClothClient } from "./clothVision";

function getSizeCode(label) {
  if (!label) return null;

  // Examples:
  // "XS — Bust 31–32 in" -> "XS"
  // "M — Bust 35–36 in"  -> "M"
  // "XS (Loose) — Chest" -> "XS"
  const first = String(label).trim().split(" ")[0];
  return first.replace(/[^\w]/g, ""); // remove weird characters
}

export default function Clothing_cat() {
  const navigate = useNavigate();
  const location = useLocation();

  const avatarData = useMemo(() => location.state?.avatarData || null, [location.state]);
  const avatarConfig = useMemo(() => location.state?.avatarConfig || null, [location.state]);
  const photos = useMemo(() => location.state?.photos || null, [location.state]);

  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);
  const [selectedStyleLabel, setSelectedStyleLabel] = useState(null);

  const [selectedCloth, setSelectedCloth] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null); // label string from size list
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [showSummary, setShowSummary] = useState(false);

  const [clothVersion, setClothVersion] = useState(0);

  // ✅ NEW: Upload clothing photo (optional)
  const [clothPhoto, setClothPhoto] = useState(null);
  const [clothPhotoPreview, setClothPhotoPreview] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [scanSuggestion, setScanSuggestion] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);

  // ✅ Catalog
  const categories = CATALOG.categories;
  const subcategories = CATALOG.subcategories;
  const subSubcategories = CATALOG.subSubcategories;
  const clothingItems = CATALOG.clothingItems;
  const sizeChart = CATALOG.sizeChart;

  // ✅ cleanup preview url
  useEffect(() => {
    return () => {
      if (clothPhotoPreview) URL.revokeObjectURL(clothPhotoPreview);
    };
  }, [clothPhotoPreview]);

  const handleGenderClick = (g) => {
    setSelectedGender(g);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
    setSelectedStyleLabel(null);
    setSelectedCloth(null);
    setSelectedSize(null);
    setSelectedColor("#ffffff");
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

const handleHeatmapNavigate = () => {
  navigate("/heatmap", {
    state: {
      avatarData,
      avatarConfig,
      selectedTopName,      // ✅ CORRECT
      selectedTopSize: selectedSizeCode,  // ✅ CORRECT
      selectedColor,
      clothInstanceId,
    }
  });
};

  const handleCategoryClick = (c) => {
    setSelectedCategory(c);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
    setSelectedStyleLabel(null);
    setSelectedCloth(null);
    setSelectedSize(null);
    setSelectedColor("#ffffff");
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

  
  const handleSubcategoryClick = (s) => {
    const available = subSubcategories[selectedGender]?.[selectedCategory]?.[s];
    if (available) {
      setSelectedSubcategory(s);
      setSelectedSubSubcategory(null);
      setSelectedStyleLabel(null);
      setSelectedCloth(null);
      setSelectedSize(null);
      setSelectedColor("#ffffff");
      setShowSummary(false);
      setClothVersion((v) => v + 1);
    } else {
      alert("Styles not yet added for this subcategory.");
    }
  };

  const handleSubSubcategoryClick = (item) => {
    setSelectedSubSubcategory(item.key);
    setSelectedStyleLabel(item.name);
    setSelectedCloth(null);
    setSelectedSize(null);
    setSelectedColor("#ffffff");
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

  const handleClothClick = (cloth) => {
    setSelectedCloth(cloth);
    setSelectedSize(null);
    setSelectedColor("#ffffff");
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

  const handleSizeClick = (size) => {
    setSelectedSize(size);
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

  const handleBack = () => {
    if (showSummary) return setShowSummary(false);
    if (selectedSize) return setSelectedSize(null);
    if (selectedCloth) return setSelectedCloth(null);
    if (selectedSubSubcategory) return (setSelectedSubSubcategory(null), setSelectedStyleLabel(null));
    if (selectedSubcategory) return setSelectedSubcategory(null);
    if (selectedCategory) return setSelectedCategory(null);
    if (selectedGender) return setSelectedGender(null);
  };

  const handleReset = () => {
    setSelectedGender(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedSubSubcategory(null);
    setSelectedStyleLabel(null);
    setSelectedCloth(null);
    setSelectedSize(null);
    setSelectedColor("#ffffff");
    setShowSummary(false);
    setClothVersion((v) => v + 1);
  };

  const handleConfirmFit = () => {
    navigate("/report", {
      state: {
        selectedGender,
        selectedCategory,
        selectedSubcategory,
        selectedSubSubcategory,
        selectedStyleLabel,
        selectedCloth,
        selectedSize,
        selectedColor,
        avatarData,
        avatarConfig,
        photos,
        mode: "catalog",
      },
    });
  };

  // ✅ NEW: scan helpers
  const resetScan = () => {
    setScanMode(false);
    setScanSuggestion(null);
    setScanLoading(false);

    if (clothPhotoPreview) URL.revokeObjectURL(clothPhotoPreview);
    setClothPhoto(null);
    setClothPhotoPreview(null);
  };

  const handleClothPhotoUpload = async (file) => {
    if (!file) return;

    if (clothPhotoPreview) URL.revokeObjectURL(clothPhotoPreview);

    setClothPhoto(file);
    setClothPhotoPreview(URL.createObjectURL(file));
    setScanLoading(true);

    try {
      const suggestion = await classifyClothClient(file, CATALOG);
      setScanSuggestion(suggestion);
      setScanMode(true);

      // ✅ apply suggestions safely (only if user hasn't selected yet)
      if (suggestion?.gender && !selectedGender) setSelectedGender(suggestion.gender);
      if (suggestion?.category && !selectedCategory) setSelectedCategory(suggestion.category);
      if (suggestion?.subcategory && !selectedSubcategory) setSelectedSubcategory(suggestion.subcategory);

      if (suggestion?.color) setSelectedColor(suggestion.color);

      // ✅ optional: jump to styleKey
      if (suggestion?.styleKey) {
        setSelectedSubSubcategory(suggestion.styleKey);

        const g = suggestion.gender || selectedGender;
        const c = suggestion.category || selectedCategory;
        const s = suggestion.subcategory || selectedSubcategory;
        const arr = CATALOG?.subSubcategories?.[g]?.[c]?.[s] || [];
        const found = arr.find((x) => x.key === suggestion.styleKey);
        setSelectedStyleLabel(found?.name || null);
      } else {
        // keep current style selection untouched if any
      }

      // ✅ clear cloth/size
      setSelectedCloth(null);
      setSelectedSize(null);
      setShowSummary(false);
      setClothVersion((v) => v + 1);
    } finally {
      setScanLoading(false);
    }
  };

  // ✅ Filtered views (scanMode only filters what user sees)
  const filteredCategories = useMemo(() => {
    if (!scanMode || !scanSuggestion?.gender) return categories;
    const g = scanSuggestion.gender;
    const only = scanSuggestion.category ? [scanSuggestion.category] : categories[g];
    return { ...categories, [g]: only };
  }, [scanMode, scanSuggestion, categories]);

  const filteredSubcategories = useMemo(() => {
    if (!scanMode || !scanSuggestion?.gender || !scanSuggestion?.category) return subcategories;
    const g = scanSuggestion.gender;
    const c = scanSuggestion.category;
    const only = scanSuggestion.subcategory ? [scanSuggestion.subcategory] : subcategories[g]?.[c];
    return {
      ...subcategories,
      [g]: { ...(subcategories[g] || {}), [c]: only || [] },
    };
  }, [scanMode, scanSuggestion, subcategories]);

  const filteredSubSubcategories = useMemo(() => {
    if (!scanMode || !scanSuggestion?.styleKey) return subSubcategories;

    const g = scanSuggestion.gender || selectedGender;
    const c = scanSuggestion.category || selectedCategory;
    const s = scanSuggestion.subcategory || selectedSubcategory;
    if (!g || !c || !s) return subSubcategories;

    const arr = subSubcategories?.[g]?.[c]?.[s] || [];
    const only = arr.filter((x) => x.key === scanSuggestion.styleKey);

    return {
      ...subSubcategories,
      [g]: {
        ...(subSubcategories[g] || {}),
        [c]: { ...((subSubcategories[g] || {})[c] || {}), [s]: only },
      },
    };
  }, [scanMode, scanSuggestion, subSubcategories, selectedGender, selectedCategory, selectedSubcategory]);

  const safeSizes =
    (selectedGender && selectedSubSubcategory && sizeChart?.[selectedGender]?.[selectedSubSubcategory]) || [];

  // ✅ selection -> object name inside avatar1.glb
  const selectedTopName = useMemo(() => {
    if (!selectedSubSubcategory || !selectedCloth?.name) return null;
    const key = `${selectedSubSubcategory}__${selectedCloth.name}`;
    return CLOTH_OBJ_MAP[key] || null;
  }, [selectedSubSubcategory, selectedCloth]);

  // ✅ convert label -> size code (XS/S/M/L/XL/XXL)
  const selectedSizeCode = useMemo(() => getSizeCode(selectedSize), [selectedSize]);

  const clothInstanceId = useMemo(() => {
    if (!selectedTopName) return "no-top";
    return `${selectedTopName}::${selectedCloth?.id || selectedCloth?.name || "top"}::${selectedSizeCode || "no-size"}::v${clothVersion}`;
  }, [selectedTopName, selectedCloth, selectedSizeCode, clothVersion]);

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      <section className="flex flex-col items-center justify-center min-h-screen gap-10 px-8 pt-32 pb-24 lg:flex-row lg:gap-20 lg:px-24">
        <Motion.div
          className="z-10 flex flex-col items-center flex-1 space-y-6 text-center lg:items-start lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-4xl font-light leading-tight tracking-tight lg:text-6xl">
            Your <span className="font-medium text-[#8a7c65]">Clothing Catalog</span>
          </h1>

          <p className="max-w-md text-gray-600">
            Select your outfit type, style, size, and color to explore your try-on preview.
          </p>

          {/* ✅ NEW: Upload clothing photo (optional) */}
          <div className="w-full max-w-md p-4 bg-white border border-gray-200 shadow rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upload Clothing Photo (Optional)</h2>
              {scanMode && (
                <button onClick={resetScan} className="px-3 py-1 text-sm text-white bg-gray-600 rounded-full">
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleClothPhotoUpload(e.target.files?.[0])}
                className="block w-full text-sm"
              />
            </div>

            {clothPhotoPreview && (
              <div className="flex items-center gap-4 mt-4">
                <img
                  src={clothPhotoPreview}
                  alt="cloth preview"
                  className="object-cover w-24 h-24 border rounded-xl"
                />
                <div className="text-sm text-gray-600">
                  {scanLoading ? (
                    <div className="font-medium">Scanning...</div>
                  ) : scanSuggestion ? (
                    <>
                      <div><strong>Suggested:</strong></div>
                      <div>Gender: {scanSuggestion.gender || "—"}</div>
                      <div>Category: {scanSuggestion.category || "—"}</div>
                      <div>Subcategory: {scanSuggestion.subcategory || "—"}</div>
                      <div>Color: {scanSuggestion.color || "—"}</div>
                    </>
                  ) : (
                    <div className="font-medium">No suggestion yet</div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
              Works now with simple client-side scan. Later you can connect backend classifier without changing this UI.
            </div>
          </div>

          <div className="flex flex-col w-full max-w-md gap-4 pt-6">
            {!selectedGender && (
              <div className="flex flex-wrap items-center gap-4">
                {["Women", "Men"].map((g) => (
                  <Motion.button
                    key={g}
                    onClick={() => handleGenderClick(g)}
                    className="px-6 py-3 text-white rounded-full shadow bg-gradient-to-r from-[#000000] to-[#2d2c2a] hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {g}
                  </Motion.button>
                ))}

                <Motion.button
                  onClick={() => navigate("/measurements", { state: { avatarData, avatarConfig, photos } })}
                  className="text-[#8a7c65] underline underline-offset-4 hover:text-[#6e604e] transition-all duration-300 font-medium"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ← Back to measurements
                </Motion.button>
              </div>
            )}

            {selectedGender && !selectedCategory && (
              <div className="flex flex-wrap gap-4">
                {Array.isArray(filteredCategories[selectedGender]) &&
                  filteredCategories[selectedGender].map((c) => (
                    <Motion.button
                      key={c}
                      onClick={() => handleCategoryClick(c)}
                      className="px-6 py-3 text-white bg-[#47443d] rounded-full shadow hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {c}
                    </Motion.button>
                  ))}
                <Motion.button
                  onClick={handleBack}
                  className="px-6 py-2 mt-4 text-white bg-gray-500 rounded-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back
                </Motion.button>
              </div>
            )}

            {selectedCategory && !selectedSubcategory && (
              <div className="flex flex-wrap gap-4">
                {Array.isArray(filteredSubcategories[selectedGender]?.[selectedCategory]) &&
                  filteredSubcategories[selectedGender][selectedCategory].map((s) => (
                    <Motion.button
                      key={s}
                      onClick={() => handleSubcategoryClick(s)}
                      className="px-6 py-3 text-white bg-[#47443d] rounded-full shadow hover:scale-105"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {s}
                    </Motion.button>
                  ))}
                <Motion.button
                  onClick={handleBack}
                  className="px-6 py-2 mt-4 text-white bg-gray-500 rounded-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back
                </Motion.button>
              </div>
            )}

            {selectedSubcategory && !selectedSubSubcategory && (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {Array.isArray(filteredSubSubcategories[selectedGender]?.[selectedCategory]?.[selectedSubcategory]) &&
                  filteredSubSubcategories[selectedGender][selectedCategory][selectedSubcategory].map((item) => (
                    <Motion.button
                      key={item.key}
                      onClick={() => handleSubSubcategoryClick(item)}
                      className="p-4 bg-white shadow rounded-2xl hover:scale-105"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <img src={item.image} alt={item.name} className="object-cover w-40 h-40 mb-2 rounded-xl" />
                      <div>{item.name}</div>
                    </Motion.button>
                  ))}
                <Motion.button
                  onClick={handleBack}
                  className="px-6 py-2 mt-4 text-white bg-gray-500 rounded-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back
                </Motion.button>
              </div>
            )}

            {selectedSubSubcategory && !selectedCloth && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {(clothingItems[selectedSubSubcategory] || []).map((i) => (
                  <Motion.button
                    key={i.id}
                    onClick={() => handleClothClick(i)}
                    className="p-3 bg-white shadow rounded-2xl hover:scale-105"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <img src={i.image} alt={i.name} className="object-cover w-32 h-40 mb-2 rounded-xl" />
                    <div className="text-gray-800">{i.name}</div>
                  </Motion.button>
                ))}
                <Motion.button
                  onClick={handleBack}
                  className="px-6 py-2 mt-4 text-white bg-gray-500 rounded-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back
                </Motion.button>
              </div>
            )}

            {selectedCloth && !selectedSize && (
              <div className="flex flex-col gap-3">
                {safeSizes.map((s) => (
                  <Motion.button
                    key={s}
                    onClick={() => handleSizeClick(s)}
                    className="px-6 py-3 text-white bg-[#8a7c65] rounded-full shadow hover:scale-105"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {s}
                  </Motion.button>
                ))}
                <Motion.button
                  onClick={handleBack}
                  className="px-6 py-2 mt-4 text-white bg-gray-500 rounded-full"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Back
                </Motion.button>
              </div>
            )}

            {selectedSize && !showSummary && (
              <div className="flex flex-col gap-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-20 h-10 border rounded-xl"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  placeholder="#ffffff / rgb(255,255,255)"
                  className="px-3 py-2 border w-60 rounded-xl"
                />
                <div className="flex gap-4">
                  <Motion.button
                    onClick={handleBack}
                    className="px-6 py-2 text-white bg-gray-500 rounded-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </Motion.button>
                  <Motion.button
                    onClick={() => setShowSummary(true)}
                    className="px-6 py-2 text-white bg-[#000000] rounded-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Confirm
                  </Motion.button>
                </div>
              </div>
            )}

            {showSummary && (
              <div className="w-full max-w-md p-6 space-y-2 bg-white shadow rounded-2xl">
                <h2 className="mb-4 text-2xl font-bold">Summary of Selection</h2>
                <p><strong>Gender:</strong> {selectedGender}</p>
                <p><strong>Category:</strong> {selectedCategory}</p>
                <p><strong>Subcategory:</strong> {selectedSubcategory}</p>
                <p><strong>Style:</strong> {selectedStyleLabel}</p>
                <p><strong>Cloth:</strong> {selectedCloth?.name}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                <p><strong>Size Code:</strong> {selectedSizeCode || "None"}</p>
                <p><strong>Color:</strong> {selectedColor}</p>
                <p><strong>Top Object:</strong> {selectedTopName || "No mapped top (shows only avatar)"}</p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <Motion.button
                    onClick={handleReset}
                    className="px-6 py-2 text-white bg-gray-500 rounded-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Reset
                  </Motion.button>


                  <Motion.button
                    onClick={handleConfirmFit}
                    className="px-6 py-2 text-white bg-[#020202] rounded-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Confirm Fit
                  </Motion.button>

 {/* ✅ NEW HEATMAP BUTTON */}
  <Motion.button
    onClick={handleHeatmapNavigate}
    className="px-6 py-2 text-white bg-[#8a7c65] rounded-full"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
  >
    Heatmap
  </Motion.button>


                  <Motion.button
                    onClick={handleBack}
                    className="px-6 py-2 text-white bg-gray-500 rounded-full"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </Motion.button>


                </div>
              </div>
            )}
          </div>
        </Motion.div>

        <Motion.div
          className="relative flex items-center justify-center flex-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <AvatarCanvas
            key="stable-canvas"
            avatarConfig={avatarConfig}
            avatarData={avatarData}
            selectedTopName={selectedTopName}
            selectedTopSize={selectedSizeCode}
            selectedColor={selectedColor}
            clothInstanceId={clothInstanceId}
          />
        </Motion.div>
      </section>

      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with elegance & innovation.
      </footer>
    </div>
  );
}
