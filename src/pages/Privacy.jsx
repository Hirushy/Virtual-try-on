"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1f1f1f] overflow-hidden font-['Didact_Gothic',sans-serif]">
      {/* Navbar */}
      <div className="absolute top-0 left-0 z-20 w-full">
        <Navbar />
      </div>

      {/* Content */}
      <div className="max-w-5xl px-6 pt-32 pb-20 mx-auto space-y-12 md:px-12">
        <Motion.div
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15 } } }}
        >
          {/* Header */}
          <Motion.h1
            variants={fadeIn}
            className="mb-6 text-5xl font-light tracking-tight text-center md:text-6xl"
          >
            Privacy &{" "}
            <span className="font-medium text-[#8a7c65]">Data Protection</span>
          </Motion.h1>

          <Motion.p
            variants={fadeIn}
            className="max-w-2xl mx-auto mb-12 leading-relaxed text-center text-gray-700"
          >
            We value your privacy. This page explains how your data is handled
            when you use our AI Virtual Try-On service — with full transparency
            and control.
          </Motion.p>

          {/* Section: Data We Collect */}
          <Motion.div
            variants={fadeIn}
            className="bg-[#f9f9f9] border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-[#8a7c65] mb-4">
              Data We Collect
            </h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Measurements you provide: height, weight, and body size.</li>
              <li>Uploaded images: photos you upload for avatar generation.</li>
              <li>
                Technical info: device type, browser version, and usage data.
              </li>
            </ul>
            <h3 className="text-lg font-medium text-[#8a7c65] mt-6 mb-2">
              We do not collect:
            </h3>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Personal identification details (e.g., name, email, address)</li>
              <li>
                Any sensitive biometric data beyond what’s required for avatar
                creation
              </li>
            </ul>
          </Motion.div>

          {/* Section: Data Processing & Consent */}
          <Motion.div
            variants={fadeIn}
            className="bg-[#f9f9f9] border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-[#8a7c65] mb-4">
              Data Processing & Consent
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              We are committed to protecting your privacy. All photos and
              measurement data for avatar processing are securely handled and
              immediately deleted after use. We do not store personal metrics,
              and your data is never shared with third parties.
            </p>

            <Motion.button
              onClick={() => alert("Thank you for your consent!")}
              className="mt-4 px-10 py-3 bg-[#1f1f1f] text-white font-medium tracking-wide border border-[#1f1f1f] hover:bg-transparent hover:text-[#1f1f1f] transition-all duration-300 ease-in-out"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              I Understand & Consent
            </Motion.button>
          </Motion.div>

          {/* Section: How We Store & Protect Data */}
          <Motion.div
            variants={fadeIn}
            className="bg-[#f9f9f9] border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-[#8a7c65] mb-4">
              How We Store & Protect Your Data
            </h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Local Processing: Data is processed securely on our servers.</li>
              <li>Auto Deletion: All uploaded data is automatically deleted.</li>
              <li>Encrypted Transfers (HTTPS) protect your information.</li>
              <li>We comply with GDPR & global data protection standards.</li>
              <li>Cookies: Only essential cookies are used; no third-party tracking.</li>
            </ul>

            <p className="mt-4 italic text-gray-600">
              Note: Your photos and measurements are never shared, sold, or used
              for advertising.
            </p>

            <div className="flex flex-wrap gap-4 mt-6">
              {/* ✅ Learn More button now navigates to LearnMore.jsx */}
              <Motion.button
                onClick={() => navigate("/learnmore")}
                className="px-10 py-3 border border-[#8a7c65] text-[#8a7c65] font-medium tracking-wide hover:bg-[#8a7c65] hover:text-white transition-all duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </Motion.button>

              <Motion.button
                onClick={() => navigate("/how-it-works")}
                className="px-10 py-3 bg-[#1f1f1f] text-white font-medium tracking-wide border border-[#1f1f1f] hover:bg-transparent hover:text-[#1f1f1f] transition-all duration-300 ease-in-out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Continue
              </Motion.button>
            </div>
          </Motion.div>

          {/* Section: Your Rights & Control */}
          <Motion.div
            variants={fadeIn}
            className="bg-[#f9f9f9] border border-gray-200 rounded-2xl p-8 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-[#8a7c65] mb-4">
              Your Rights & Control
            </h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Delete My Data: Request deletion of stored data anytime.</li>
              <li>Transparency: You have full visibility over your information.</li>
            </ul>
          </Motion.div>
        </Motion.div>
      </div>

      {/* Footer aesthetic band */}
      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity & style.
      </footer>
    </div>
  );
}
