"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";
import authImg from "../assets/auth.png";
import avatarImg from "../assets/avatar.png";
import browseImg from "../assets/browse.png";
import fitImg from "../assets/fit.png";
import saveImg from "../assets/save.png";

const steps = [
  {
    number: "01",
    label: "Authentication",
    title: "Sign in securely",
    description:
      "Log in with your Google account via Firebase Authentication. Your data stays completely private and tied only to your profile — no one else can access your avatars or outfits.",
    tags: ["Google OAuth", "Firebase Auth", "Private profile"],
    color: "blue",
    image: authImg,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    number: "02",
    label: "Avatar Creation",
    title: "Build your digital self",
    description:
      "Create a body-accurate avatar in two ways — enter your measurements manually (height, weight, chest, waist, hip and more), or upload a photo and let our AI generate your avatar automatically.",
    tags: ["AI generation", "Manual measurements", "Saved to profile"],
    color: "purple",
    image: avatarImg,
    options: [
      { label: "Option A", value: "Enter measurements" },
      { label: "Option B", value: "Upload a photo" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    number: "03",
    label: "Browse & Try On",
    title: "Shop with confidence",
    description:
      "Browse the full clothing catalog and try items on your avatar in real time. Upload any clothing image, pick the store, and the system instantly maps your body measurements to their specific size chart.",
    tags: ["Virtual try-on", "Store-specific sizing", "ZARA · Temu · more"],
    color: "teal",
    image: browseImg,
    options: [
      { label: "Browse", value: "Clothing catalog" },
      { label: "Upload", value: "Item image" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    number: "04",
    label: "Fit Analysis",
    title: "Understand your fit",
    description:
      "Get a detailed breakdown of how each garment fits your unique body. The system scores the overall fit, highlights tight and loose areas, rates size accuracy, and gives you practical tips for improvement.",
    tags: ["Fit score", "Area breakdown", "Improvement tips"],
    color: "amber",
    image: fitImg,
    options: [
      { label: "Fit score", value: "Overall rating" },
      { label: "Zones", value: "Tight / loose areas" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10" />
        <path d="M12 20V4" />
        <path d="M6 20v-6" />
      </svg>
    ),
  },
  {
    number: "05",
    label: "Save & Export",
    title: "Keep your looks, share your report",
    description:
      "Save any outfit combination to My Looks for future reference. When you're ready, download a complete PDF fit report — a polished summary of your size, fit analysis, and personalised recommendations.",
    tags: ["My Looks", "PDF download", "Shareable report"],
    color: "green",
    image: saveImg,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <polyline points="9 15 12 18 15 15" />
      </svg>
    ),
  },
];

const colorMap = {
  blue: {
    icon: "bg-blue-50 text-blue-700",
    tag: "bg-blue-50 text-blue-800 border-blue-200",
    num: "text-blue-600",
    dot: "bg-blue-500",
    optBorder: "border-blue-100",
  },
  purple: {
    icon: "bg-purple-50 text-purple-700",
    tag: "bg-purple-50 text-purple-800 border-purple-200",
    num: "text-purple-600",
    dot: "bg-purple-500",
    optBorder: "border-purple-100",
  },
  teal: {
    icon: "bg-teal-50 text-teal-700",
    tag: "bg-teal-50 text-teal-800 border-teal-200",
    num: "text-teal-600",
    dot: "bg-teal-500",
    optBorder: "border-teal-100",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700",
    tag: "bg-amber-50 text-amber-800 border-amber-200",
    num: "text-amber-600",
    dot: "bg-amber-500",
    optBorder: "border-amber-100",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700",
    tag: "bg-emerald-50 text-emerald-800 border-emerald-200",
    num: "text-emerald-600",
    dot: "bg-emerald-500",
    optBorder: "border-emerald-100",
  },
};

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function StepCard({ step, index }) {
  const [ref, inView] = useInView();
  const c = colorMap[step.color];

  return (
    <div
      ref={ref}
      className="grid grid-cols-[56px_1fr] gap-0 group"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.55s ease ${index * 0.1}s, transform 0.55s ease ${index * 0.1}s`,
      }}
    >
      {/* Left timeline */}
      <div className="flex flex-col items-center">
        <div
          className={`w-12 h-12 rounded-full border border-white/50 bg-white/40 backdrop-blur-md shadow-md flex items-center justify-center text-base font-bold mt-6 z-10 transition-all duration-300 group-hover:border-transparent group-hover:bg-[#3d276b] group-hover:text-white ${c.num}`}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {index + 1}
        </div>
        {index < steps.length - 1 && (
          <div className="w-0.5 flex-1 bg-white/60 backdrop-blur-sm mt-1" />
        )}
      </div>

      {/* Card */}
      <div className={`ml-6 md:ml-8 mt-6 mb-12 bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl p-8 md:p-10 transition-all duration-300 shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${step.image ? 'md:flex md:items-center md:gap-10' : ''}`}>
        
        {/* Left Side: Text Content */}
        <div className="flex-1 w-full">
          {/* Icon + label row */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${c.icon}`}>
              {step.icon}
            </div>
            <span className="text-base font-bold uppercase tracking-widest text-[#1a1a1a]">
              {step.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-snug">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-xl font-semibold text-gray-800 leading-relaxed mb-8">{step.description}</p>

          {/* Option pills (optional) */}
          {step.options && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {step.options.map((opt) => (
                <div
                  key={opt.label}
                  className={`bg-white/40 backdrop-blur-sm rounded-2xl p-4 border border-white/50`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-2">{opt.label}</p>
                  <p className="text-lg font-bold text-gray-900">{opt.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {step.tags.map((tag) => (
              <span
                key={tag}
                className={`text-sm font-extrabold px-4 py-1.5 rounded-full border border-white/60 bg-white/50 text-[#1a1a1a] shadow-sm`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Side: Dynamic Step Image */}
        {step.image && (
          <div className="mt-10 md:mt-0 flex-[0.8] rounded-3xl overflow-hidden border-2 border-white/60 shadow-2xl h-[300px] md:h-[400px]">
            <img src={step.image} alt={step.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const [heroRef, heroIn] = useInView(0.1);

  return (
    <div className="relative min-h-screen text-[#1f1f1f] font-['Didact_Gothic',sans-serif] overflow-x-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 select-none pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, opacity: 0.8 }}
      />
      {/* White tint overlay to ensure dark text pops */}
      <div className="fixed inset-0 z-0 bg-white/40 pointer-events-none" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 z-50 w-full border-b border-white/40 bg-white/70 backdrop-blur-md shadow-sm">
        <Navbar />
      </div>

      <main className="relative z-10 pt-28 pb-24 max-w-7xl mx-auto px-6 md:px-12 lg:px-20">

        {/* ── Hero Header ── */}
        <div
          ref={heroRef}
          className="text-center mb-20"
          style={{
            opacity: heroIn ? 1 : 0,
            transform: heroIn ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <p className="text-sm md:text-base font-extrabold uppercase tracking-[.2em] text-[#8a7c65] mb-6">
            The process
          </p>
          <h1
            className="text-5xl md:text-6xl font-black text-[#1a1a1a] leading-tight mb-8"
          >
            From login to your{" "}
            <span className="italic text-[#3d276b]">perfect fit</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed max-w-3xl mx-auto shadow-sm">
            Five simple steps — authentication, avatar creation, virtual try-on,
            fit analysis, and a downloadable report.
          </p>
        </div>

        {/* ── Steps ── */}
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* ── CTA Block ── */}
        <div className="mt-8 rounded-3xl bg-[#3d276b] p-10 text-center overflow-hidden relative">
          {/* subtle radial tint */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.06) 0%, transparent 70%)",
            }}
          />
          <p className="text-sm md:text-base font-extrabold uppercase tracking-[.2em] text-purple-300 mb-4 relative z-10">
            Ready to start?
          </p>
          <h2
            className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10"
          >
            Find your perfect fit today
          </h2>
          <p className="text-lg md:text-xl font-bold text-purple-200 mb-10 max-w-3xl mx-auto relative z-10 leading-relaxed shadow-sm">
            Create your avatar in under two minutes and start trying on clothes
            with accurate, store-specific size recommendations.
          </p>
          <a
            href="/choose"
            className="relative z-10 inline-flex items-center gap-3 bg-white text-[#3d276b] text-lg font-bold px-10 py-4 rounded-xl transition-opacity duration-200 hover:opacity-90 shadow-xl"
          >
            Create my avatar
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

      </main>

      <Footer isLightPage={true} />
    </div>
  );
}