"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroBg from "../assets/pink.jpg";
import Footer from "../components/Footer";

export default function Privacy() {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] overflow-x-hidden font-['Didact_Gothic',sans-serif]">
      {/* Background Image with improved overlay for text clarity */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center select-none pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      {/* White tint overlay to ensure text pops */}
      <div className="fixed inset-0 z-0 bg-white/40 pointer-events-none" />

      {/* Navbar */}
      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl px-6 pt-32 pb-20 mx-auto space-y-12 md:px-12">
        <Motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Header */}
          <Motion.h1
            variants={fadeIn}
            className="mb-6 text-4xl font-extrabold tracking-tight text-center md:text-6xl text-[#1a1a1a]"
          >
            Privacy &{" "}
            <span className="text-[#8a7c65]">Data Protection</span>
          </Motion.h1>

          <Motion.p
            variants={fadeIn}
            className="max-w-4xl mx-auto mb-12 text-lg md:text-xl leading-relaxed text-center text-gray-700 font-medium"
          >
            We value your privacy. This page explains how your data is handled
            when you use our AI Virtual Try-On service — with full transparency
            and control.
          </Motion.p>

          {/* Section: Data We Collect */}
          <Motion.div
            variants={fadeIn}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#8a7c65] mb-6 border-b border-white/50 pb-3">
              Data We Collect
            </h2>
            <ul className="space-y-4 text-lg md:text-xl text-gray-800 font-semibold list-disc list-inside">
              <li>Measurements you provide: height, weight, and body size.</li>
              <li>Uploaded images: photos you upload for avatar generation.</li>
              <li>Technical info: device type, browser version, and usage data.</li>
            </ul>

            <h3 className="text-xl md:text-3xl font-bold text-[#8a7c65] mt-10 mb-4">
              We do not collect:
            </h3>
            <ul className="space-y-4 text-lg md:text-xl text-gray-800 font-semibold list-disc list-inside">
              <li>Personal identification details (e.g., name, email, address)</li>
              <li>Any sensitive biometric data beyond what’s required for avatar creation</li>
            </ul>
          </Motion.div>

          {/* Section: Data Processing & Consent */}
          <Motion.div
            variants={fadeIn}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-6 border-b border-white/50 pb-3">
              Data Processing & Consent
            </h2>
            <p className="mb-6 leading-relaxed text-gray-800 font-semibold text-lg md:text-xl">
              We are committed to protecting your privacy. Photos and measurement data used for avatar processing are securely handled. Your digital twins and styling outfits can be saved locally to your device or securely stored in our cloud to persist your sessions. You maintain full control over your data and can delete your saved properties at any time. We never share your data with third parties.
            </p>

            <Motion.button
              onClick={() => alert("Thank you for your consent!")}
              className="mt-2 px-8 py-3 bg-[#1f1f1f] text-white font-bold tracking-widest uppercase text-sm rounded-xl shadow-md hover:bg-[#8a7c65] transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              I Understand & Consent
            </Motion.button>
          </Motion.div>

          {/* Section: How We Store & Protect Data */}
          <Motion.div
            variants={fadeIn}
            className="bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl p-8 md:p-10 mb-8 shadow-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-6 border-b border-white/50 pb-3">
              How We Store & Protect Your Data
            </h2>
            <ul className="space-y-4 text-lg md:text-xl text-gray-800 font-semibold list-disc list-inside">
              <li>Local Processing: Data is processed securely on our servers.</li>
              <li>Data Control: You can delete your cloud-saved twins and styling combinations at any time.</li>
              <li>Encrypted Transfers (HTTPS) protect your information.</li>
              <li>We comply with global data protection standards.</li>
              <li>Cookies: Only essential cookies are used; no third-party tracking.</li>
            </ul>

            <p className="mt-6 italic text-lg md:text-xl text-gray-800 font-bold bg-[#8a7c65]/5 p-5 rounded-xl border-l-4 border-[#8a7c65]">
              Note: Your photos and measurements are never shared, sold, or used
              for advertising.
            </p>

            <div className="flex flex-wrap gap-4 mt-8">
              <Motion.button
                onClick={() => navigate("/learnmore")}
                className="px-8 py-3 border-[2px] border-[#8a7c65] text-[#8a7c65] font-bold tracking-widest uppercase text-sm rounded-xl hover:bg-[#8a7c65] hover:text-white transition-all duration-300 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </Motion.button>

              <Motion.button
                onClick={() => navigate("/how-it-works")}
                className="px-8 py-3 bg-[#1f1f1f] text-white font-bold tracking-widest uppercase text-sm border-[2px] border-[#1f1f1f] rounded-xl shadow-md hover:bg-transparent hover:text-[#1f1f1f] transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue
              </Motion.button>
            </div>
          </Motion.div>
        </Motion.div>
      </div>

      <Footer isLightPage={true} />
    </div>
  );
}