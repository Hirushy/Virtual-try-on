"use client";

import React from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import heroBg from "../assets/pink.jpg";
import stepsImgSrc from "../media_store/bg.mp4";
import featuresImgSrc from "../media_store/as.mp4";
import benefitsImgSrc from "../media_store/bg.mp4";

// Using stable absolute URLs from public/ to bypass Vite import issues for videos
const introImg = "/media/mno.mov";
const stepsImg = stepsImgSrc;
const featuresImg = featuresImgSrc;
const benefitsImg = benefitsImgSrc;

// Animation setup
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.2, ease: "easeOut" },
  }),
};

// Reusable Card Component
const Card = ({ children, imgSrc, imgAlt, imageOnRight = false }) => (
  <section className="p-10 md:p-14 my-16 transition-all duration-500 border border-white/50 shadow-2xl rounded-[40px] bg-white/30 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] backdrop-blur-xl">
    <div
      className={`grid md:grid-cols-12 gap-12 items-center ${imageOnRight ? "md:grid-flow-col-dense" : ""
        }`}
    >
      <div className="md:col-span-6">{children}</div>
      <div className="flex justify-center md:col-span-6">
        {imgSrc && (imgSrc.endsWith(".mp4") || imgSrc.endsWith(".mov")) ? (
          <Motion.video
            src={imgSrc}
            autoPlay
            loop
            muted
            playsInline
            initial="hidden"
            whileInView="visible"
            custom={2}
            variants={fadeUp}
            className="w-full h-[600px] object-cover rounded-[30px] shadow-2xl border-2 border-white/30 hover:scale-[1.03] transition-transform duration-700"
          />
        ) : (
          <Motion.img
            src={imgSrc}
            alt={imgAlt}
            initial="hidden"
            whileInView="visible"
            custom={2}
            variants={fadeUp}
            className="w-full h-[600px] object-cover rounded-[30px] shadow-2xl border-2 border-white/30 hover:scale-[1.03] transition-transform duration-700"
          />
        )}
      </div>
    </div>
  </section>
);

const LearnMore = () => {
  return (
    <div className="relative min-h-screen bg-transparent text-[#1a1a1a] font-['Didact_Gothic',sans-serif] overflow-x-hidden">
      {/* Background Image (Flowing Fabric Style) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000 select-none pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, opacity: 0.8 }}
      />
      {/* White tint overlay to ensure dark text pops */}
      <div className="fixed inset-0 z-0 bg-white/40 pointer-events-none" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 z-20 w-full border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Header */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-12 text-center">
        <Motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-4xl md:text-5xl font-black tracking-tight text-black"
        >
          Discover <span className="text-[#8a7c65]">Virtual Elegance</span>
        </Motion.h1>
        <Motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="max-w-3xl mt-6 text-lg md:text-xl font-bold leading-relaxed text-[#1a1a1a]"
        >
          Step into the future of fashion — where innovation meets individuality.
          Experience the Web-Based AI Virtual Try-On System that lets you
          visualize, fit, and style yourself instantly.
        </Motion.p>
      </section>

      <main className="max-w-6xl px-6 mx-auto md:px-10">
        {/* Concept */}
        <Card imgSrc={introImg} imgAlt="Concept">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-left"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-4">
              Concept
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-semibold mb-4">
              The Virtual Try-On system allows users to create a 3D avatar of
              themselves and try clothes virtually before buying.
            </p>
            <p className="text-lg md:text-xl leading-relaxed text-gray-800 font-semibold">
              It combines artificial intelligence, 3D modeling, and fashion
              design to deliver a realistic and personalized fitting experience.
            </p>
          </Motion.div>
        </Card>

        {/* How It Works */}
        <Card imageOnRight imgSrc={stepsImg} imgAlt="How It Works">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-left"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-6">
              How It Works
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-lg md:text-xl text-gray-800 font-semibold leading-relaxed">
              <li>User enters body measurements or uploads a photo.</li>
              <li>The system creates a realistic 3D avatar.</li>
              <li>User selects outfits to try on virtually.</li>
              <li>The system displays real-time fitting and look.</li>
              <li>Optional: Fit feedback using color heatmaps.</li>
            </ol>

            {/* ✅ React Router Link (Vite compatible) */}
            <Link to="/how-it-works">
              <button className="px-8 py-3 mt-6 transition-all duration-300 bg-[#1f1f1f] text-white rounded-xl shadow-md text-sm font-bold uppercase tracking-widest hover:bg-[#8a7c65] hover:shadow-lg">
                How It Works
              </button>
            </Link>
          </Motion.div>
        </Card>

        {/* Key Features */}
        <Card imgSrc={featuresImg} imgAlt="Key Features">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-left"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-6">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-lg md:text-xl text-gray-800 font-semibold space-y-4">
              <li>AI-powered avatar creation</li>
              <li>Real-time garment fitting simulation</li>
              <li>Measurement-based accuracy</li>
              <li>Modern, web-based interface</li>
              <li>Privacy-protected data handling</li>
            </ul>
          </Motion.div>
        </Card>

        {/* Benefits & Future Enhancements */}
        <Card imageOnRight imgSrc={benefitsImg} imgAlt="Benefits">
          <Motion.div
            initial="hidden"
            whileInView="visible"
            variants={fadeUp}
            className="text-left"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mb-6">
              Benefits to Users
            </h2>
            <ul className="list-disc list-inside text-lg md:text-xl text-gray-800 font-semibold space-y-4">
              <li>Find the perfect fit without visiting a store</li>
              <li>Saves time and reduces return rates</li>
              <li>Enhances shopping confidence</li>
              <li>Eco-friendly — reduces unnecessary shipping</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold text-[#8a7c65] mt-10 mb-6">
              Future Enhancements
            </h2>
            <ul className="list-disc list-inside text-lg md:text-xl text-gray-800 font-semibold space-y-4">
              <li>Virtual wardrobe for saved looks</li>
              <li>Integration with online fashion stores</li>
              <li>AR try-on via phone camera</li>
              <li>AI-based style recommendations</li>
            </ul>
          </Motion.div>
        </Card>
      </main>

      {/* Call to Action */}
      <section className="relative z-10 flex flex-col items-center justify-center py-24 px-8 mt-10 mb-20 mx-6 md:mx-auto max-w-5xl bg-white/30 backdrop-blur-lg border border-white/50 rounded-3xl text-center text-black shadow-2xl">
        <Motion.h2
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1a1a1a]"
        >
          Ready to Experience Your Virtual Style?
        </Motion.h2>
        <Motion.p
          initial="hidden"
          whileInView="visible"
          custom={2}
          variants={fadeUp}
          className="mt-6 text-lg md:text-xl font-bold text-[#1a1a1a]"
        >
          Click below to start your Virtual Try-On journey.
        </Motion.p>
        <Motion.a
          href="/choose"
          initial="hidden"
          whileInView="visible"
          custom={3}
          variants={fadeUp}
          className="mt-8 px-10 py-4 bg-[#1f1f1f] text-white rounded-2xl font-bold shadow-xl text-sm md:text-base hover:bg-[#8a7c65] hover:text-white transition-all duration-300 uppercase tracking-widest border border-transparent hover:border-[#8a7c65]"
        >
          Start Virtual Try-On
        </Motion.a>
      </section>

      <Footer isLightPage={true} />
    </div>
  );
};

export default LearnMore;
