// src/pages/Report.jsx
"use client";

import React, { useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import heroBg from "../assets/pink.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import AvatarCanvas from "./measurements/AvatarCanvas";
import { ArrowLeft, Download } from "lucide-react";

export default function Report() {
  const navigate = useNavigate();
  const location = useLocation();
  const reportRef = useRef(null);

  const {
    selections = {},
    avatarData = null,
    avatarConfig = null,
    analysisData = [],
    selectedSize = "M",
    fitScore = 0,
    fitVerdict = "Perfect",
    userMeasurements = null
  } = location.state || {};

  // Calculate dynamic weight again just for display
  const userWeight = useMemo(() => {
    if (!userMeasurements) return 50;
    const baseGirth = (userMeasurements.waist || 75) * 0.4 + (userMeasurements.hips || 99) * 0.3 + (userMeasurements.chest || 94) * 0.3;
    const girthFactor = baseGirth / 90;
    const height = avatarConfig?.height || 170;
    return Math.round(55 * Math.pow(girthFactor, 2.5) * (height / 170));
  }, [userMeasurements, avatarConfig]);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      // Short delay to ensure WebGL 3D model completes any final render queue
      await new Promise((r) => setTimeout(r, 100));
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      const pdfWidth = canvas.width;
      const pdfHeight = canvas.height;
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [pdfWidth, pdfHeight] });
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Fit_Report_Size_${selectedSize}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="relative min-h-screen bg-[#1a1515] text-[#1a1a1a] font-['Inter',sans-serif] flex flex-col overflow-x-hidden">
      {/* Animated Cinematic Background */}
      <Motion.div initial={{ scale: 1 }} animate={{ scale: 1.08 }}
        transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center", willChange: "transform", opacity: 0.4 }} />

      <div className="relative z-10 w-full">
        <Navbar />
      </div>

      <main className="relative z-10 flex-1 w-full flex flex-col items-center py-10 px-4">
        
        {/* ACTION BAR */}
        <div className="max-w-[950px] w-full flex justify-between items-center mb-6 z-10">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-black font-black uppercase text-xs tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Return to Heatmap
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="px-8 py-4 bg-[#1a1a1a] hover:bg-black text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02]"
          >
            <Download className="w-4 h-4" /> Download Official PDF
          </button>
        </div>

        {/* A4 REPORT SHELL (CAPTURED BY HTML2CANVAS) */}
        <div 
          ref={reportRef}
          className="w-full max-w-[950px] bg-white shadow-2xl relative overflow-hidden"
          style={{ minHeight: '1250px' }} // Proportional A4 ratio approach
        >
          {/* Header */}
          <div className="px-14 pt-14 pb-8 border-b border-gray-200 flex justify-between items-end bg-white">
            <div>
              <h1 className="text-6xl font-serif font-black tracking-tighter text-[#1a1a1a]">Digital Twin</h1>
              <p className="text-lg font-black uppercase tracking-[0.2em] text-[#8a7c65] mt-2">Official Fit Analysis</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Date Generated</p>
              <p className="text-lg font-bold text-gray-800">{today}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row" style={{ minHeight: '1050px' }}>
            
            {/* L: Details Panel */}
            <div className="flex-1 p-14 flex flex-col gap-10 bg-white">
              
              {/* Profile Block */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3 mb-6">Subject Profile</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-4">
                  <div>
                    <p className="text-xs uppercase text-[#8a7c65] font-black tracking-widest">Est. Weight</p>
                    <p className="text-3xl font-black mt-1">{userWeight} <span className="text-lg text-gray-400">kg</span></p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[#8a7c65] font-black tracking-widest">Analyzed Size</p>
                    <p className="text-3xl font-black mt-1">{selectedSize}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs uppercase text-[#8a7c65] font-black tracking-widest">Measurement Source</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">{userMeasurements?.source === "estimated" ? "AI Photographic Estimation" : "Manual Metric Entry"}</p>
                  </div>
                </div>
              </div>

              {/* Verdict Block */}
              <div className="bg-[#fcfbf9] p-8 rounded-3xl border border-black/5 shadow-inner">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Overall Machine Verdict</h3>
                <div className="flex items-center gap-6">
                  <div className="text-[5rem] tracking-tighter font-black leading-none" style={{ color: fitScore > 85 ? '#22C55E' : fitScore > 65 ? '#EAB308' : '#EF4444' }}>
                    {fitScore}<span className="text-4xl">%</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black uppercase tracking-widest text-[#1a1a1a] leading-none mb-2">{fitVerdict}</div>
                    <div className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">Fit Classification</div>
                  </div>
                </div>
                <p className="text-base text-gray-600 mt-6 leading-relaxed font-semibold tracking-wide">
                  This dossier certifies the exact spatial mapping constraints of your 3D digital physique against the standardized metric volume requirements for apparel size {selectedSize}. 
                </p>
              </div>

              {/* Zones Block */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3 mb-6">Localized Zone Calibration</h3>
                <div className="space-y-7">
                  {analysisData.length > 0 ? analysisData.map((zone, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-lg font-black text-gray-900 tracking-wide">{zone.name}</span>
                        <span className="text-[13px] font-black uppercase tracking-widest" style={{ color: zone.type === 'perfect' ? '#22C55E' : zone.type === 'tight' ? '#EF4444' : '#3B82F6' }}>
                           {zone.type === 'perfect' ? '100% Perfect' : `${zone.score}% ${zone.type}`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden flex shadow-inner">
                         <div 
                           className="h-full rounded-full" 
                           style={{ 
                             width: zone.type === 'perfect' ? '100%' : `${zone.score}%`,
                             backgroundColor: zone.type === 'perfect' ? '#22C55E' : zone.type === 'tight' ? '#EF4444' : '#3B82F6'
                           }} 
                         />
                      </div>
                      <div className="flex justify-between mt-3 text-xs font-black text-gray-400 px-1 uppercase tracking-widest">
                         <span>Anatomy: {zone.selVal}cm</span>
                         <span>Garment bounds: {zone.cmpVal}cm</span>
                      </div>
                    </div>
                  )) : (
                    <p className="text-base text-gray-400 italic font-medium">No localized zone data transmitted.</p>
                  )}
                </div>
              </div>

              {/* Composition Block */}
              {Object.keys(selections).length > 0 && (
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 pb-3 mb-5">Worn Assets</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(selections).filter(cat => selections[cat]?.item).map(cat => (
                      <div key={cat} className="flex items-center gap-4 bg-[#fcfbf9] p-4 rounded-xl border border-black/5">
                        <div className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: selections[cat].color }} />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#8a7c65]">{cat}</p>
                          <p className="text-sm font-black text-gray-900 mt-0.5">{selections[cat].item.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Watermark */}
              <div className="mt-auto pt-10">
                <p className="text-[9px] font-black uppercase text-gray-300 tracking-[0.3em]">Generated by Virtual Try-On Fit Engine v5</p>
              </div>

            </div>

            {/* R: 3D Visualization side */}
            <div className="w-full md:w-[45%] bg-[#faf9f7] relative flex flex-col pt-14 border-l border-gray-100 overflow-hidden shadow-inner">
               <div className="px-10 mb-2 relative z-10">
                 <h3 className="text-xs font-black uppercase tracking-[0.1em] text-[#8a7c65] border-b border-[#8a7c65]/20 pb-3">3D Spatial Mapping Verification</h3>
                 <p className="text-xs text-gray-600 mt-4 font-semibold uppercase tracking-widest leading-relaxed">Topographic mesh rendering of human anatomical dimensions within standard apparel framework.</p>
               </div>
               
               {/* Fixed Height Container for the Canvas to ensure reliable WebGL buffer capturing */}
               <div className="flex-1 w-full h-[900px] relative pointer-events-auto flex items-center justify-center">
                 <AvatarCanvas 
                    avatarConfig={avatarConfig}
                    avatarData={avatarData}
                    selections={selections}
                    analysisData={analysisData}
                    showHeatmap={true}
                 />
               </div>
            </div>

          </div>
        </div>
      </main>

      <div className="relative z-10 w-full mt-auto">
        <Footer isLightPage={false} />
      </div>
    </div>
  );
}
