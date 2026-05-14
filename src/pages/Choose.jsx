"use client";
import React from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";



const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } },
};

const cardEntrance = {
  hidden: { opacity: 0, y: 60, scale: 0.9, rotateX: 10 },
  show: { opacity: 1, y: 0, scale: 1, rotateX: 0, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } },
};

const itemStagger = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const methods = [
  {
    tag: "Method 01 — Manual",
    title: "Precision by\nMeasurements",
    description: "Enter your body details to create an accurate 3D avatar — no photo needed.",
    steps: ["Input measurements", "Convert to avatar", "Generate model", "Try-on simulation", "Fit analysis"],
    cta: "Enter Measurements",
    route: "/body-details",
  },
  {
    tag: "Method 02 — Photo",
    title: "AI Body\nDetection",
    description: "Upload a full-body image and let AI generate your avatar automatically.",
    steps: ["Upload photo", "Detect body landmarks", "Calculate ratios", "Generate model", "Fit analysis"],
    cta: "Upload Photo",
    route: "/upload-photo",
  },
];

export default function Choose() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-white text-black font-sans overflow-hidden">
      
      {/* LAYER 0: CINEMATIC BACKGROUND (PINK FABRIC) WITH SUBTLE ZOOM */}
      <Motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{
          duration: 15,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          willChange: 'transform',
          opacity: 0.4
        }}
      />
      

      {/* Content Overlay */}
      <div className="relative z-20 min-h-screen flex flex-col p-8 lg:p-16 max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="w-full mb-12">
          <Navbar />
        </div>

        <Motion.div 
          initial="hidden" 
          animate="show" 
          variants={stagger}
          className="flex-grow flex flex-col items-center justify-center text-center space-y-12 py-10"
        >
          {/* Headline Section */}
          <div className="max-w-4xl space-y-6">
            <Motion.h1 
              variants={fadeUp} 
              className="text-5xl lg:text-8xl font-bold tracking-tight leading-tight text-black drop-shadow-xl"
            >
              Choose Your Avatar <br /> 
              <span className="text-black/30">Creation Method</span>
            </Motion.h1>
            
            <Motion.p 
              variants={fadeUp} 
              className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto font-medium"
            >
              Build your digital twin effortlessly. Choose the method that fits your flow.
            </Motion.p>
          </div>

          {/* The Two Rectangles (Methods) - Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full max-w-6xl mt-12">
            {methods.map((m) => (
              <Motion.div
                key={m.tag}
                variants={cardEntrance}
                whileHover={{ y: -12, scale: 1.01 }}
                className="group relative border border-black/5 p-10 lg:p-12 flex flex-col justify-between min-h-[440px] bg-white/10 backdrop-blur-3xl hover:bg-white/40 hover:border-black/20 transition-all duration-700 text-left overflow-hidden ring-1 ring-black/5 shadow-2xl"
              >
                {/* Decorative background pulse */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-colors duration-700" />
                
                <div className="relative z-10">
                  <span className="text-[13px] uppercase tracking-[0.4em] font-bold text-black/40 mb-6 block">
                    {m.tag}
                  </span>
                  <h2 className="text-5xl font-bold mb-4 whitespace-pre-line leading-tight text-black">
                    {m.title}
                  </h2>
                  <p className="text-lg leading-relaxed mb-10 text-black/60 font-medium max-w-sm">
                    {m.description}
                  </p>
                  
                  <Motion.ul 
                    className="space-y-5"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    variants={{
                      show: { transition: { staggerChildren: 0.1 } }
                    }}
                  >
                    {m.steps.map((step, i) => (
                      <Motion.li 
                        key={i} 
                        variants={itemStagger}
                        className="text-sm flex items-center gap-4 text-black/50 group-hover:text-black/80 transition-colors uppercase tracking-[0.15em] font-bold"
                      >
                        <span className="font-bold text-black/15">0{i + 1}</span>
                        <span>{step}</span>
                      </Motion.li>
                    ))}
                  </Motion.ul>
                </div>

                <div className="mt-14 flex justify-end relative z-10">
                  <button 
                    onClick={() => navigate(m.route)}
                    className="flex items-center gap-5 text-sm font-bold uppercase tracking-[0.3em] group/btn text-black"
                  >
                    <span className="py-5 px-10 border border-black/10 bg-black text-white group-hover/btn:bg-transparent group-hover/btn:text-black group-hover/btn:border-black transition-all duration-500 shadow-xl">
                      {m.cta}
                    </span>
                    <span className="text-3xl transition-transform group-hover/btn:translate-x-3">→</span>
                  </button>
                </div>
              </Motion.div>
            ))}
          </div>
        </Motion.div>

        <Footer isLightPage={true} />
      </div>


      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}