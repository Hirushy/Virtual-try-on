"use client";

import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import AvatarCanvas from "./measurements/AvatarCanvas";
import HeatmapOverlay from "../components/HeatmapOverlay";

/* ============================================================
 Animation Injection
============================================================ */

if (typeof document !== "undefined" && !document.getElementById("heatmap-anim")) {
  const styleTag = document.createElement("style");
  styleTag.id = "heatmap-anim";

  styleTag.innerHTML = `
    @keyframes fadeSlideIn {
      from { opacity:0; transform:translateX(10px); }
      to { opacity:1; transform:translateX(0); }
    }
  `;

  document.head.appendChild(styleTag);
}

/* ============================================================
 Heatmap Page
============================================================ */

export default function Heatmap() {

  const location = useLocation();

  const state = location.state || {};
  const { avatarData, selectedTopSize = "M" } = state;

  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [overlaySize, setOverlaySize] = useState({
    width: 480,
    height: 520
  });

  const avatarWrapRef = useRef(null);

  /* ============================================================
 Sync overlay size with avatar container
============================================================ */

  useEffect(() => {

    const wrapper = avatarWrapRef.current;
    if (!wrapper) return;

    const observer = new ResizeObserver((entries) => {

      for (const entry of entries) {

        setOverlaySize({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });

      }

    });

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };

  }, []);

  /* ============================================================
 Fit Analysis API Call
============================================================ */

  useEffect(() => {

    if (!avatarData || !selectedTopSize) {
      setAnalysisData([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function runInference() {

      setLoading(true);

      try {

        const allowedSizes = ["XS", "S", "M", "L", "XL", "XXL"];

        if (!allowedSizes.includes(selectedTopSize)) {
          setAnalysisData([]);
          return;
        }

        const weights = avatarData?.shape_key_weights || {};

        const payload = {
          bodyMeasurements: {
            shoulders: (weights.Shoulders || 0) * 50,
            chest: (weights.Chest || 0) * 100,
            waist: (weights.Waist || 0) * 90,
            neck: (weights.Neck || 0) * 40
          },
          selectedSize: selectedTopSize
        };

        const API_BASE =
          import.meta.env.VITE_API_URL ||
          window.location.origin.replace(/:\d+$/, ":8001");

        const response = await fetch(
          `${API_BASE}/api/analyze-fit`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error(`Fit analysis failed (${response.status})`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (Array.isArray(data?.zones)) {

          const mapped = data.zones.map(z => ({
            ...z,
            icon: z.type === "tight" ? "⬇" : z.type === "loose" ? "⬆" : "✓",
            isCritical: z.score < 25,
            confidence: z.confidence || 0.92
          }));

          setAnalysisData(mapped);

        } else {
          setAnalysisData([]);
        }

      } catch (error) {

        console.error("Fit analysis error:", error);

        if (isMounted) {
          setAnalysisData([]);
        }

      } finally {

        if (isMounted) {
          setLoading(false);
        }

      }

    }

    runInference();

    return () => {
      isMounted = false;
      controller.abort();
    };

  }, [avatarData, selectedTopSize]);

  /* ============================================================
 Risk calculation
============================================================ */

  const riskCount = analysisData.filter(
    z => z.isCritical && (z.confidence || 0.92) > 0.7
  ).length;

  /* ============================================================
 UI
============================================================ */

  return (

    <div style={{ minHeight: "100vh", background: "#050508", color: "white" }}>

      <Navbar />

      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "8rem 2.5rem 5rem",
          display: "flex",
          gap: "4rem",
          flexWrap: "wrap"
        }}
      >

        {/* ================= Avatar + Heatmap ================= */}

        <section
          style={{
            flex: 1.4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >

          <h1 style={{ fontSize: "4rem", letterSpacing: "0.3em" }}>
            FIT ANALYSIS
          </h1>

          {loading && (
            <p style={{ opacity: 0.7 }}>
              CALCULATING ZONE TENSION...
            </p>
          )}

          <div
            ref={avatarWrapRef}
            style={{
              position: "relative",
              borderRadius: "35px",
              padding: "2.5rem",
              border: "1px solid #1e1e2e",
              width: "100%",
              maxWidth: "480px"
            }}
          >

            {/* 3D Avatar */}

            <AvatarCanvas {...state} />

            {/* Heatmap Overlay */}

            {analysisData.length > 0 && !loading && (

              <HeatmapOverlay
                analysisData={analysisData}
                width={overlaySize.width}
                height={overlaySize.height}
              />

            )}

          </div>

        </section>

        {/* ================= Zone Info ================= */}

        <aside style={{ flex: 1, minWidth: "380px" }}>

          <h2 style={{ color: "#8a7c65", marginBottom: "20px" }}>
            ZONE DATA
          </h2>

          {analysisData.map((zone, i) => (

            <div
              key={i}
              style={{
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid #222",
                borderRadius: "10px",
                animation: "fadeSlideIn 0.3s ease"
              }}
            >

              <strong>
                {zone.icon} {zone.name}
              </strong>

              <p style={{ fontSize: "12px", opacity: 0.7 }}>
                {zone.desc}
              </p>

            </div>

          ))}

          {riskCount > 0 && (
            <p style={{ color: "#ff5577", marginTop: "15px" }}>
              ⚠ {riskCount} critical zones detected
            </p>
          )}

        </aside>

      </main>

    </div>
  );
}