// src/pages/Favorites.jsx

"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  User,
  ExternalLink,
  Calendar,
  Ruler,
  Heart,
  ChevronLeft,
  Cloud,
  HardDrive
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AvatarCanvas from "./measurements/AvatarCanvas";

export default function Favorites() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // 1. Local guest data (field names are already correct — written by fixed Measurements.jsx)
      const local = (JSON.parse(localStorage.getItem("shadow_fit_avatars")) || []).map(a => ({
        ...a,
        isCloud: false,
        // Ensure date is present for guest entries that have no createdAt
        date: a.date || new Date().toLocaleDateString(),
      }));

      // 2. Firestore cloud data (if logged in)
      // Only shown when the matching uid is signed in — other accounts see nothing.
      let cloud = [];
      if (user) {
        try {
          const querySnapshot = await getDocs(
            collection(db, "users", user.uid, "favorites")
          );
          cloud = querySnapshot.docs.map(docSnap => ({
            ...docSnap.data(),
            id: docSnap.id,
            isCloud: true,
            // createdAt is a Firestore Timestamp — convert to readable date string
            date: docSnap.data().createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
          }));
        } catch (err) {
          console.error("Firestore fetch failed:", err);
        }
      }

      // Cloud entries first (most recent saves), then guest local entries
      setAvatars([...cloud, ...local]);
      setLoading(false);
    };

    fetchAll();
  }, [user]); // Re-runs whenever the signed-in user changes (login / logout)

  const deleteAvatar = async (avatar) => {
    if (avatar.isCloud) {
      if (!window.confirm("Delete this from your cloud account?")) return;
      try {
        await deleteDoc(doc(db, "users", user.uid, "favorites", avatar.id));
        setAvatars(prev => prev.filter(a => a.id !== avatar.id));
      } catch (err) {
        alert("Failed to delete from cloud.");
      }
    } else {
      const updated = avatars.filter(a => a.id !== avatar.id);
      setAvatars(updated);
      localStorage.setItem(
        "shadow_fit_avatars",
        JSON.stringify(updated.filter(a => !a.isCloud))
      );
    }
  };

  const useAvatar = (avatar) => {
    navigate("/measurements/clothing-cat", {
      state: {
        // FIXED: Measurements.jsx writes `config` and `data` (not `avatarConfig`/`avatarData`)
        // Pass them under the names Clothing_Cat.jsx expects: avatarData and avatarConfig
        avatarData: avatar.data || null,
        avatarConfig: avatar.config || null,
        fromFavorites: true,
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#1a1a1a] font-['Inter',sans-serif] overflow-x-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 select-none pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, opacity: 0.8 }}
      />
      <Navbar />

      {/* Header */}
      <header className="pt-32 pb-12 px-8 md:px-24 bg-white/40 backdrop-blur-md border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8a7c65]/5 rounded-full blur-3xl  -mt-2" />
        <div className="max-w-7xl mx-auto relative z-10">
          <Motion.button
            onClick={() => navigate("/")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8a7c65] transition-colors mb-8 text-lg font-semibold group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Motion.button>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 bg-[#8a7c65] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#8a7c65]/20">
                <Heart size={32} fill="currentColor" />
              </div>
              <h1 className="text-5xl font-black tracking-tight md:text-7xl text-[#1a1a1a]">
                My Saved <span className="text-[#8a7c65]">Twins</span>
              </h1>
            </div>
            <p className="text-gray-600 max-w-3xl text-xl md:text-2xl font-medium leading-relaxed">
              Manage your saved digital twins and instantly restore them to the studio for new outfit sessions.
            </p>
          </Motion.div>
        </div>
      </header>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-8 md:px-24 py-16">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-[#8a7c65]/30 border-t-[#8a7c65] rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {avatars.length > 0 ? (
              <Motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {avatars.map((avatar, index) => (
                  <Motion.div
                    key={avatar.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white/20 backdrop-blur-xl border border-white/30 rounded-[2rem] p-8 shadow-2xl hover:shadow-3xl hover:shadow-[#8a7c65]/20 transition-all duration-700 relative flex flex-col hover:bg-white/30 hover:border-white/50 hover:scale-[1.02] hover:-translate-y-1"
                  >
                    {/* 3D Preview Header */}
                    <div className="w-full h-64 bg-white/10 backdrop-blur-md rounded-2xl mb-6 relative overflow-hidden group-hover:shadow-inner transition-all flex items-end justify-center border border-white/20">
                      {/* Top Overlay Actions & Badges */}
                      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-xl flex items-center justify-center text-[#8a7c65] shadow-sm">
                          {avatar.isCloud ? <Cloud size={20} /> : <User size={20} />}
                        </div>
                        {avatar.isCloud ? (
                          <span className="px-2 py-1 bg-blue-100/90 backdrop-blur-md text-blue-600 text-[8px] font-black uppercase rounded-lg border border-blue-200">
                            Cloud Account
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-gray-500 text-[8px] font-black uppercase rounded-lg border border-gray-200">
                            Guest Local
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteAvatar(avatar); }}
                        className="absolute top-4 right-4 z-10 p-2.5 bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shadow-sm border border-transparent hover:border-red-200"
                        title="Delete Twin"
                      >
                        <Trash2 size={18} />
                      </button>

                      {/* 3D Avatar (Pointer events disabled to prevent accidental zooming/panning in cards) */}
                      <div className="absolute w-[200%] h-[200%] left-[-50%] top-[-25%] pointer-events-none">
                        <AvatarCanvas
                          avatarConfig={avatar.config}
                          avatarData={avatar.data}
                          gender={avatar.gender || (avatar.config?.gender) || (avatar.data?.gender) || "female"}
                        />
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-[#8a7c65] transition-colors">
                        {avatar.name}
                      </h3>
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-3 text-base text-gray-800 font-medium">
                          <Calendar size={18} className="text-gray-400" /> {avatar.date}
                        </div>
                        <div className="flex items-center gap-3 text-base text-gray-800 font-medium">
                          <Ruler size={18} className="text-gray-400" />
                          {avatar.summary?.size || "Custom"} • {avatar.gender}
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:border-[#8a7c65]/30 group-hover:bg-white/20 transition-all duration-500">
                        <p className="text-xs uppercase tracking-widest font-bold text-gray-700 mb-2">
                          Detected Proportions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {avatar.summary && (
                            <>
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold text-gray-700 shadow-sm border border-white/30">
                                {avatar.summary.bodyType}
                              </span>
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold text-gray-700 shadow-sm border border-white/30">
                                {avatar.summary.waistDesc}
                              </span>
                            </>
                          )}
                          <span className="px-2 py-1 bg-[#8a7c65]/20 backdrop-blur-sm rounded-md text-xs font-bold text-[#8a7c65] shadow-sm border border-[#8a7c65]/30">
                            v{avatar.id.toString().slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex gap-3">
                      <button
                        onClick={() => useAvatar(avatar)}
                        className="flex-[3] py-4 bg-[#1f1f1f] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#8a7c65] transition-all duration-500 shadow-lg hover:shadow-[#8a7c65]/30 active:scale-[0.98]"
                      >
                        Use Twin <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteAvatar(avatar); }}
                        className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold flex items-center justify-center hover:bg-red-100 transition-all duration-300 border border-red-100"
                        title="Delete Twin"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </Motion.div>
                ))}
              </Motion.div>
            ) : (
              <Motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-8">
                  <Heart size={48} />
                </div>
                <h2 className="text-2xl font-bold text-gray-400 mb-2">No Saved Twins Found</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-8">
                  {user
                    ? "Your high-fidelity digital twins will appear here once you save them from the studio."
                    : "Log in to see your cloud-saved twins, or create one as a guest below."}
                </p>
                <button
                  onClick={() => navigate("/choose")}
                  className="px-8 py-3 bg-[#1f1f1f] text-white rounded-full font-bold hover:bg-[#8a7c65] transition-all active:scale-95 shadow-xl shadow-black/10"
                >
                  Create My First Twin
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