"use client";

import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import hero1 from "../assets/hh.jpg";
import hero2 from "../assets/bs.jpg";
import hero3 from "../assets/un.jpg";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

const Home = () => {
  const navigate = useNavigate();
  const [backendMessage, setBackendMessage] = useState("");

  useEffect(() => {
    // Fetch a message from backend
    axios
      .get(`${API_BASE}/`)
      .then((res) => {
        setBackendMessage(res?.data?.message || "");
      })
      .catch((err) => {
        // Don't spam scary errors when backend is simply off
        console.log("Backend offline (OK):", err?.message || err);
      });
  }, []);

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] overflow-hidden font-['Didact_Gothic',sans-serif]">
      {/* Navbar */}
      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center min-h-screen gap-10 px-8 pt-24 pb-24 lg:flex-row lg:px-24 lg:gap-20">
        {/* Left Text */}
        <Motion.div
          className="z-10 flex flex-col max-w-xl space-y-6 text-center lg:text-left"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="uppercase tracking-[0.3em] text-sm text-[#8a7c65]">
            Web-Based AI Virtual Try-On
          </p>

          <h1 className="text-5xl font-light leading-tight tracking-tight lg:text-7xl">
            Discover Your Perfect <br />
            <span className="font-medium text-[#8a7c65]">Style & Fit</span>
          </h1>

          <p className="text-base leading-relaxed text-gray-700">
            Step into digital fashion elegance — create your virtual avatar and
            explore timeless style through AI precision.
          </p>

          {/* Display backend message */}
          {backendMessage && (
            <p className="text-sm text-green-600">
              Backend says: {backendMessage}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-6 pt-4 lg:justify-start">
            <Motion.button
              className="px-10 py-3 bg-[#1f1f1f] text-white font-medium tracking-wide border border-[#1f1f1f] hover:bg-transparent hover:text-[#1f1f1f] transition-all duration-300 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/choose")}
            >
              Start Virtual Try-On
            </Motion.button>

            <Motion.button
              className="px-10 py-3 border border-[#8a7c65] text-[#8a7c65] font-medium tracking-wide hover:bg-[#8a7c65] hover:text-white transition-all duration-300 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/learnmore")}
            >
              Learn More
            </Motion.button>
          </div>
        </Motion.div>

        {/* Right Side - Hero Images */}
        <div className="relative grid grid-cols-2 gap-4 lg:gap-6">
          <Motion.img
            src={hero1}
            alt="Fashion model 1"
            className="object-cover w-48 h-64 sm:w-60 sm:h-80 lg:w-72 lg:h-[420px] shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          />
          <Motion.img
            src={hero2}
            alt="Fashion model 2"
            className="object-cover w-48 h-64 sm:w-60 sm:h-80 lg:w-72 lg:h-[420px] mt-10 shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
          <Motion.img
            src={hero3}
            alt="Fashion model 3"
            className="object-cover col-span-2 w-full h-64 sm:h-80 lg:h-[400px] mt-4 shadow-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          />
        </div>
      </section>

      {/* Footer aesthetic band */}
      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity &
        style.
      </footer>
    </div>
  );
};

export default Home;
