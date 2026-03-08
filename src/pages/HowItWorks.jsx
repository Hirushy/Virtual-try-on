"use client";

import React from "react";
import Navbar from "../components/Navbar";
import { motion as Motion } from "framer-motion";
import avatarCreate from "../assets/bs.jpg"; // Replace with your own images if needed

export default function HowItWorks() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
    }),
  };

  const steps = [
    {
      title: "Create Your Avatar",
      text: "Enter your measurements or upload your photo. Our AI builds a realistic 3D avatar of you.",
      img: avatarCreate,
      number: 1,
    },
    {
      title: "AI Generates Avatar",
      text: "Your personal 3D model is generated in seconds. We map body shape, pose, and facial features accurately.",
      img: avatarCreate,
      number: 2,
    },
    {
      title: "Choose Your Outfit",
      text: "Select clothes from our catalog or upload your own outfit to try on virtually.",
      img: avatarCreate,
      number: 3,
    },
    {
      title: "Try-On & Fit Analysis",
      text: "See how the outfit fits your avatar. Compare looks, view heatmaps, and get your fit score.",
      img: avatarCreate,
      number: 4,
    },
    {
      title: "Confirm & Download",
      text: "Confirm your perfect fit. Download your fit report or restart try-on to explore more outfits.",
      img: avatarCreate,
      number: 5,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#fdfcfb] text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Header Section */}
      <section className="flex flex-col items-center justify-center pt-32 pb-10 bg-[#ffffff] text-center px-6">
        <Motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0}
         
          

           className="mb-6 text-5xl font-light tracking-tight text-center md:text-6xl"
          >
            How {" "}
            <span className="font-medium text-[#8a7c65]">It Works</span>
        </Motion.h1>

        <Motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.2}
          className="max-w-2xl mx-auto mb-12 leading-relaxed text-center text-gray-700"
          >
          In just a few steps, our AI creates your 3D avatar and lets you try on
          outfits effortlessly.
        </Motion.p>
      </section>

      {/* Steps Timeline */}
      <div className="max-w-6xl px-8 pt-20 pb-24 mx-auto lg:px-16">
        <div className="relative ml-6 border-l border-[#8a7c65]/30 md:ml-10">
          {steps.map((step, i) => (
            <Motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.3}
              className="relative pl-10 mb-16"
            >
              {/* Step Number */}
              <div className="absolute flex items-center justify-center w-10 h-10 text-lg font-bold text-white rounded-full shadow-lg -left-5 bg-[#8a7c65]">
                {step.number}
              </div>

              {/* Step Card */}
              <div className="p-6 border shadow-md bg-white/90 border-[#d8d4c8] rounded-2xl md:flex md:items-center md:justify-between">
                <div className="pr-6 md:w-2/3">
                  <h2 className="mb-2 text-2xl font-semibold text-[#8a7c65]">
                    {step.title}
                  </h2>
                  <p className="leading-relaxed text-gray-700">{step.text}</p>
                </div>

                <div className="mt-4 md:w-1/3 md:mt-0">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="object-cover w-full h-48 shadow-lg rounded-xl"
                  />
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      </div>

      {/* Footer Aesthetic */}
      <footer className="w-full h-16 bg-[#f2f2f2] border-t border-gray-200 flex items-center justify-center text-sm text-gray-600 tracking-wide">
        © {new Date().getFullYear()} Virtual Try-On — Designed with simplicity & style.
      </footer>
    </div>
  );
}
