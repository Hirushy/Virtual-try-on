"use client";

import React from "react";
import { Link } from "react-router-dom"; 
import { motion as Motion } from "framer-motion";
import Navbar from "../components/Navbar";
import introImg from "../assets/nt.jpg";
import stepsImg from "../assets/ntt.jpg";
import featuresImg from "../assets/n.jpg";
import benefitsImg from "../assets/n.jpg";

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
  <section className="p-10 my-10 transition-all duration-300 border border-gray-200 shadow-lg rounded-2xl bg-white/80 hover:shadow-xl backdrop-blur-sm">
    <div
      className={`grid md:grid-cols-12 gap-10 items-center ${
        imageOnRight ? "md:grid-flow-col-dense" : ""
      }`}
    >
      <div className="md:col-span-7">{children}</div>
      <div className="flex justify-center md:col-span-5">
        <Motion.img
          src={imgSrc}
          alt={imgAlt}
          initial="hidden"
          whileInView="visible"
          custom={2}
          variants={fadeUp}
          className="w-full h-[420px] object-cover rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-300"
        />
      </div>
    </div>
  </section>
);

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff] to-[#f7f5f2] text-[#1a1a1a] font-['Didact_Gothic',sans-serif] overflow-x-hidden">
      {/* Navbar */}
      <div className="fixed top-0 left-0 z-20 w-full border-b border-gray-200 shadow-sm bg-white/80 backdrop-blur-md">
        <Navbar />
      </div>

      {/* Header */}
      <section className="flex flex-col items-center justify-center pt-32 pb-10 text-center">
        <Motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-5xl md:text-6xl font-light tracking-tight text-[#111]"
        >
          Discover Virtual Elegance
        </Motion.h1>
        <Motion.p
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="max-w-2xl mt-6 text-lg md:text-xl leading-relaxed text-[#555]"
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
            <h2 className="text-3xl md:text-4xl font-semibold text-[#111] mb-4">
              Concept
            </h2>
            <p className="text-lg md:text-[20px] leading-relaxed text-[#6f6452] mb-3">
              The Virtual Try-On system allows users to create a 3D avatar of
              themselves and try clothes virtually before buying.
            </p>
            <p className="text-lg md:text-[20px] leading-relaxed text-[#6f6452]">
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
            <h2 className="text-3xl md:text-4xl font-semibold text-[#111] mb-4">
              How It Works
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-lg md:text-[20px] text-[#6f6452] leading-relaxed">
              <li>User enters body measurements or uploads a photo.</li>
              <li>The system creates a realistic 3D avatar.</li>
              <li>User selects outfits to try on virtually.</li>
              <li>The system displays real-time fitting and look.</li>
              <li>Optional: Fit feedback using color heatmaps.</li>
            </ol>

            {/* ✅ React Router Link (Vite compatible) */}
            <Link to="/how-it-works">
              <button className="px-8 py-3 mt-6 transition-all duration-300 bg-[#111] text-white rounded-md shadow-md hover:bg-[#333] hover:shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-semibold text-[#111] mb-4">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-lg md:text-[20px] text-[#6f6452] space-y-2">
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
            <h2 className="text-3xl md:text-4xl font-semibold text-[#111] mb-4">
              Benefits to Users
            </h2>
            <ul className="list-disc list-inside text-lg md:text-[20px] text-[#6f6452] space-y-2">
              <li>Find the perfect fit without visiting a store</li>
              <li>Saves time and reduces return rates</li>
              <li>Enhances shopping confidence</li>
              <li>Eco-friendly — reduces unnecessary shipping</li>
            </ul>

            <h2 className="text-3xl md:text-4xl font-semibold text-[#111] mt-8 mb-4">
              Future Enhancements
            </h2>
            <ul className="list-disc list-inside text-lg md:text-[20px] text-[#6f6452] space-y-2">
              <li>Virtual wardrobe for saved looks</li>
              <li>Integration with online fashion stores</li>
              <li>AR try-on via phone camera</li>
              <li>AI-based style recommendations</li>
            </ul>
          </Motion.div>
        </Card>
      </main>

      {/* Call to Action */}
      <section className="flex flex-col items-center justify-center py-24 px-6 bg-gradient-to-r from-[#b9ad97] to-[#a4957e] text-center text-[#111] border-t border-gray-300">
        <Motion.h2
          initial="hidden"
          whileInView="visible"
          variants={fadeUp}
          className="text-3xl font-semibold tracking-wide md:text-4xl"
        >
          Ready to Experience Your Virtual Style?
        </Motion.h2>
        <Motion.p
          initial="hidden"
          whileInView="visible"
          custom={2}
          variants={fadeUp}
          className="mt-4 text-lg md:text-xl text-[#222]"
        >
          Click below to start your Virtual Try-On journey.
        </Motion.p>
        <Motion.a
          href="/choose"
          initial="hidden"
          whileInView="visible"
          custom={3}
          variants={fadeUp}
          className="mt-8 px-10 py-3 bg-white text-[#111] border border-[#111] rounded-lg font-medium hover:bg-[#111] hover:text-white transition-all duration-300 shadow-md hover:shadow-xl"
        >
          Start Virtual Try-On
        </Motion.a>
      </section>

      {/* Footer */}
      <footer className="py-8 text-sm text-center text-[#555] bg-white border-t border-gray-200">
        © {new Date().getFullYear()}{" "}
        <span className="font-medium">Virtual Try-On</span> — Designed with
        Elegance & Innovation.
      </footer>
    </div>
  );
};

export default LearnMore;
