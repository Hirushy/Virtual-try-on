"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, useProgress, Html, Float, Environment, ContactShadows } from "@react-three/drei";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";
import { useAuth } from "../context/AuthContext";
import { CanvasErrorBoundary, DEFAULT_GL_SETTINGS } from "../components/WebGLHandler";

/**
 * Premium Loader Component
 */
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center w-80 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/60 mb-2">
          Digital Twin Initializing
        </p>
        <p className="text-[12px] font-black text-white/90 tracking-widest">
          {Math.round(progress)}%
        </p>
        <div className="w-32 h-[1px] bg-white/20 mt-4 overflow-hidden relative">
          <Motion.div
            className="absolute inset-0 bg-white"
            initial={{ x: "-100%" }}
            animate={{ x: `${progress - 100}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>
    </Html>
  );
}

/**
 * Optimized Avatar Model for fast entrance
 */
function AvatarModel() {
  const { scene, animations } = useGLTF("/walk.glb");
  const groupRef = useRef();
  const { actions } = useAnimations(animations || [], groupRef);

  useEffect(() => {
    if (actions) {
      const walkKey = Object.keys(actions).find(k => k.toLowerCase().includes("walk"));
      const action = actions[walkKey] || Object.values(actions)[0];
      if (action) {
        action.reset().fadeIn(0.3).play();
        action.timeScale = 1; // Fast walk cycle
      }
    }
  }, [actions]);

  useFrame((state) => {
    if (groupRef.current) {
      // Walk significantly faster from Right to Left
      const speed = 2.8;
      const range = 20;
      const startX = 10;
      const t = (state.clock.elapsedTime * speed) % range;

      groupRef.current.position.x = startX - t;
      groupRef.current.rotation.y = -Math.PI / 3;
      groupRef.current.position.y = -5;
      groupRef.current.position.z = 1.7;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <primitive object={scene} scale={4.8} />
      </Float>
    </group>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#070707] text-white overflow-hidden font-outfit">
      {/* Navigation */}
      <div className="absolute top-0 left-0 z-50 w-full">
        <Navbar />
      </div>

      {/* Main Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">

        {/* Background Layer: High-Contrast Silk Image (Matching Screenshot) */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${heroBg})`, opacity: 0.85 }}
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        {/* 3D Scene Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <CanvasErrorBoundary>
            <Canvas
              dpr={[1, 2]}
              camera={{ fov: 40, position: [0, 0, 18] }}
              gl={DEFAULT_GL_SETTINGS}
            >
              <Suspense fallback={<Loader />}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1.2} />
                <Environment preset="city" />
                <AvatarModel />
                <ContactShadows opacity={0.4} scale={10} blur={2} far={10} />
              </Suspense>
            </Canvas>
          </CanvasErrorBoundary>
        </div>

        {/* Content Layer (Foreground) */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-8 flex flex-col items-center justify-center text-center">

          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center"
          >
            {/* 
                TIERED TYPOGRAPHY HEADING
                "DISCOVER YOUR PERFECT FIT & STYLE"
            */}
            <div className="flex flex-col items-center font-montserrat font-black leading-[0.85] tracking-[-0.04em]">
              <span className="text-[150px] md:text-[130px] text-white">
                DISCOVER
              </span>
              <span className="text-[95px] md:text-[150px] text-white/50">
                YOUR PERFECT
              </span>
              <span className="text-[90px] md:text-[130px] text-white">
                FIT & STYLE
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mt-20">
              <Motion.button
                className="w-[280px] md:w-[320px] h-[55px] md:h-[65px] bg-white text-black font-serif-premium font-medium uppercase text-[11px] md:text-[13px] tracking-[0.4em] transition-all duration-500 hover:bg-gray-100 active:scale-95 shadow-2xl rounded-[4px]"
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate("/choose")}
              >
                Start Virtual Try-On
              </Motion.button>

               <Motion.button
                className="w-[220px] md:w-[260px] h-[55px] md:h-[65px] border border-white/50 text-white font-serif-premium font-medium uppercase text-[11px] md:text-[13px] tracking-[0.4em] backdrop-blur-md hover:bg-white/10 transition-all duration-300 active:scale-95 rounded-[4px]"
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => navigate("/learnmore")}
              >
                Learn More
              </Motion.button>
            </div>

            <p className="mt-16 text-[13px] font-bold uppercase tracking-[0.4em] text-white/50">
              {user ? (
                <>Logged in as: <span className="text-white/70">{user.email}</span></>
              ) : (
                <>Experience the future of fashion</>
              )}
            </p>
          </Motion.div>
        </div>

      </section>

      {/* Footer Area */}
      <Footer />
    </div>
  );
};

export default Home;