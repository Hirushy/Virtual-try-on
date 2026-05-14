// src/pages/SavedLooks.jsx
// FIXED: reads `look.avatarConfig` and `look.avatarData` (not `look.avatar_config`)
// to match what Clothing_Cat.jsx now writes to Firestore.
// Also passes them correctly to tryOnLook navigate state.

"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  ShoppingBag,
  Play,
  Calendar,
  Layers,
  Sparkles,
  ChevronLeft,
  Search,
  Cloud,
  HardDrive,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import heroBg from "../assets/pink.jpg";
import AvatarCanvas from "./measurements/AvatarCanvas";

export default function SavedLooks() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [looks, setLooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // 1. Local guest data
      const local = (JSON.parse(localStorage.getItem("shadow_fit_looks")) || []).map(l => ({
        ...l,
        isCloud: false,
        date: l.date || new Date().toLocaleDateString(),
      }));

      // 2. Firestore cloud data — only visible when the matching uid is signed in
      let cloud = [];
      if (user) {
        try {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "looks")
          );
          cloud = querySnapshot.docs.map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id,
            isCloud: true,
            // createdAt is a Firestore Timestamp — convert to readable string
            date: docSnap.data().createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          }));
        } catch (err) {
          console.error("Firestore fetch failed:", err);
        }
      }

      setLooks([...cloud, ...local]);
      setLoading(false);
    };

    fetchAll();
  }, [user]); // Re-runs whenever the signed-in user changes

  const deleteLook = async (look) => {
    if (look.isCloud) {
      if (!window.confirm("Delete this look from your cloud account?")) return;
      try {
        await deleteDoc(doc(db, "users", user.uid, "looks", look.id));
        setLooks(prev => prev.filter(l => l.id !== look.id));
      } catch (err) {
        alert("Failed to delete from cloud.");
      }
    } else {
      const updated = looks.filter(l => l.id !== look.id);
      setLooks(updated);
      localStorage.setItem(
        "shadow_fit_looks",
        JSON.stringify(updated.filter(l => !l.isCloud))
      );
    }
  };

  const tryOnLook = (look) => {
    navigate("/measurements/clothing-cat", {
      state: {
        // FIXED: Clothing_Cat.jsx writes `avatarData` and `avatarConfig` (not `avatar_data`)
        // Pass them under the same names so Clothing_Cat.jsx picks them up correctly
        avatarData: look.avatarData || null,
        avatarConfig: look.avatarConfig || null,
        selections: look.selections,
        gender: look.gender,
        fromLooks: true,
      },
    });
  };

  const filteredLooks = looks.filter(
    l =>
      (l.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.gender || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative min-h-screen bg-transparent text-[#1a1a1a] font-['Inter',sans-serif] overflow-x-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 select-none pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, opacity: 0.8 }}
      />
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-12 px-8 md:px-24 bg-white/40 backdrop-blur-md border-b border-gray-100 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#8a7c65]/5 rounded-full blur-3xl opacity-50" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Motion.button
            onClick={() => navigate("/measurements/clothing-cat")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8a7c65] transition-colors mb-8 text-lg font-semibold group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Studio
          </Motion.button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/20">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-5xl font-black tracking-tight md:text-7xl text-[#1a1a1a]">
                  Digital <span className="text-[#8a7c65]">Look-Book</span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl text-xl md:text-2xl font-medium leading-relaxed">
                Your personal fashion registry. Persisted styling combinations across multiple digital twins.
              </p>
            </Motion.div>

            {/* Search Bar */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative w-full md:w-96"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search styles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#8a7c65]/20 focus:bg-white text-lg font-medium transition-all shadow-sm"
              />
            </Motion.div>
          </div>
        </div>
      </header>

      {/* Look-Book Grid */}
      <main className="max-w-7xl mx-auto px-8 md:px-24 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-[#8a7c65]/30 border-t-[#8a7c65] rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredLooks.length > 0 ? (
              <Motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {filteredLooks.map((look, index) => (
                  <Motion.div
                    key={look.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white/20 backdrop-blur-xl border border-white/30 rounded-[2.5rem] p-1 shadow-2xl hover:shadow-3xl hover:shadow-[#8a7c65]/20 transition-all duration-700 relative flex flex-col hover:bg-white/30 hover:border-white/50 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {/* Top Preview Canvas */}
                    <div className="h-48 w-full bg-white/10 backdrop-blur-md rounded-[2rem] relative overflow-hidden flex items-center justify-center group-hover:scale-[0.98] transition-transform duration-500 border border-white/20">
                      <div className="absolute top-4 left-4 flex gap-2">
                        {look.isCloud ? (
                          <span className="px-4 py-1.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-blue-200 shadow-sm">
                            <Cloud size={14} /> Cloud
                          </span>
                        ) : (
                          <span className="px-4 py-1.5 bg-white/90 text-gray-500 rounded-full text-[10px] font-black uppercase flex items-center gap-1 border border-gray-200 shadow-sm">
                            <HardDrive size={14} /> Local
                          </span>
                        )}
                      </div>
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-4 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-[#8a7c65] shadow-sm uppercase tracking-wide">
                          {look.gender}
                        </span>
                      </div>
                      
                      {/* 3D Avatar Area - pointer events disabled to prevent accidental zooming */}
                      <div className="absolute w-[200%] h-[200%] left-[-50%] top-[-25%] pointer-events-none">
                        <AvatarCanvas
                          avatarConfig={look.avatarConfig}
                          avatarData={look.avatarData}
                          gender={look.gender || (look.avatarConfig?.gender) || (look.avatarData?.gender) || "female"}
                          selections={look.selections}
                        />
                      </div>
                    </div>

                    {/* Look Info */}
                    <div className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold group-hover:text-[#8a7c65] transition-colors">
                            {look.name}
                          </h3>
                          <p className="text-base text-gray-800 flex items-center gap-1.5 mt-1">
                            <Calendar size={16} /> Created {look.date}
                          </p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); deleteLook(look); }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-100/50 rounded-xl transition-all border border-transparent hover:border-red-200"
                          title="Delete Style"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Outfit Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(look.selections || {})
                          .filter(([_, config]) => config !== null)
                          .map(([cat, config]) => {
                            const itemName = config.item?.name || config.name || config.outfit || config.meshName || "Unknown Piece";
                            const itemColor = config.color || "#ffffff";
                            const itemSize = config.size || "M";
                            const itemDetail = config.style || config.outfit || "";
                            return (
                              <div key={cat} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:bg-white/20 transition-colors duration-500">
                                <p className="text-xs uppercase tracking-widest font-bold text-gray-700 mb-1">{cat}</p>
                                <p className="text-sm font-bold truncate text-gray-800">{itemName}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <div className="w-2 h-2 rounded-full border border-gray-200" style={{ backgroundColor: itemColor }} />
                                  <span className="text-xs text-gray-600 font-medium">
                                    {itemSize}{itemDetail ? ` • ${itemDetail}` : ""}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="p-8 pt-0 mt-auto flex gap-3">
                      <button
                        onClick={() => tryOnLook(look)}
                        className="flex-[3] py-4 bg-[#1f1f1f] text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-[#8a7c65] transition-all duration-500 shadow-xl hover:shadow-[#8a7c65]/40 active:scale-95"
                      >
                        Restore Look <Play size={16} fill="currentColor" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLook(look); }}
                        className="flex-1 py-4 bg-red-50 text-red-500 rounded-[1.5rem] font-bold flex items-center justify-center hover:bg-red-100 transition-all duration-300 border border-red-100"
                        title="Delete Look"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </Motion.div>
                ))}
              </Motion.div>
            ) : (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-200 mb-8 border border-gray-100">
                  <ShoppingBag size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-300 mb-2">Look-Book Empty</h2>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">
                  {searchTerm
                    ? "No outfits match your search."
                    : user
                      ? "Style an avatar in the studio and save it here to build your collection."
                      : "Log in to see your cloud-saved looks, or style one as a guest below."}
                </p>
                <button
                  onClick={() => navigate("/measurements/clothing-cat")}
                  className="px-10 py-3.5 bg-black text-white rounded-full font-bold hover:bg-[#8a7c65] transition-all shadow-2xl shadow-black/20"
                >
                  Go to Studio
                </button>
              </Motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer isLightPage={true} />
    </div>
  );
}