"use client";

import React from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


export default function Choose() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-[#f8f6f3] text-[#1f1f1f] overflow-hidden font-['Didact_Gothic',sans-serif]"
      style={{
        
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Navbar */}
      <div className="absolute left-0 top-0 z-20 w-full">
        <Navbar />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-0"></div>

      {/* Main Content */}
      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-8 pb-24 pt-24 lg:px-24">
        {/* Header */}
        <Motion.div
          className="mb-12 flex max-w-2xl flex-col items-center space-y-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <p className="uppercase tracking-[0.3em] text-sm text-[#8a7c65]">
            Step Into Your Virtual Self
          </p>
          <h1 className="text-5xl font-light leading-tight lg:text-6xl">
            Choose How to{" "}
            <span className="font-medium text-[#8a7c65]">Create Your Avatar</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-gray-700">
            Build your <strong>digital twin</strong> effortlessly. Enter your
            measurements or upload a photo to begin your style journey.
          </p>
        </Motion.div>

        {/* Cards */}
        <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-10 lg:flex-row">

          {/* Measurements Card */}
          <Motion.div
            className="relative bg-white shadow-md rounded-2xl overflow-hidden border border-[#414040] hover:shadow-xl transition-all duration-500 max-w-sm w-full"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-[#8a7c65]/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col items-start space-y-4 p-8 text-left">
              <h2 className="text-2xl font-medium text-[#1f1f1f]">
                Create with Measurements
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Enter your height, weight, and detailed sizes — we’ll craft a
                perfectly measured avatar for you.
              </p>
              <button
                onClick={() => navigate("/body-details")}
                className="mt-4 px-8 py-3 border border-[#000000] text-[#555350] font-medium hover:bg-[#000000] hover:text-white transition-all duration-300 ease-in-out"
              >
                Type Your Measurements
              </button>
            </div>
          </Motion.div>

          {/* Photo Upload Card */}
          <Motion.div
            className="relative bg-white shadow-md rounded-2xl overflow-hidden border border-[#414040] hover:shadow-xl transition-all duration-500 max-w-sm w-full"
            whileHover={{ scale: 1.03 }}
          >
            <div className="absolute inset-0 bg-[#8a7c65]/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 flex flex-col items-start space-y-4 p-8 text-left">
              <h2 className="text-2xl font-medium text-[#1f1f1f]">
                Create with Photo
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                Upload a photo, and our smart AI will build your{" "}
                <strong>3D digital twin</strong> instantly.
              </p>
              <button
                onClick={() => navigate("/upload-photo")}
                className="mt-4 px-8 py-3 border border-[#000000] text-[#555350] font-medium hover:bg-[#000000] hover:text-white transition-all duration-300 ease-in-out"
              >
                Upload a Photo
              </button>
            </div>
          </Motion.div>
        </div>

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-[#8a7c65] underline underline-offset-4 hover:text-[#6e604e] transition-all duration-300 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </section>

      {/* Footer aesthetic band */}
      <div className="w-full h-24 bg-[#f4f1ed]"></div>
    </div>
  );
}
