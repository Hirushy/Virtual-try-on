import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Choose from "./pages/Choose";
import BodyDetails from "./pages/BodyDetails";
import Privacy from "./pages/Privacy";
import HowItWorks from "./pages/HowItWorks";

import UploadPhoto from "./pages/UploadPhoto";
import Generate_twin from "./pages/Generate_twin";
import Generated from "./pages/Generated";
import Measurements from "./pages/Measurements";

import Report from "./pages/Report";
import Building_u from "./pages/Building_u";
import LearnMore from "./pages/LearnMore";
import Heatmap from "./pages/Heatmap";

// ✅ Try-On module pages (inside measurements folder)
import Clothing_Cat from "./pages/measurements/Clothing_Cat";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/choose" element={<Choose />} />

      {/* ✅ Type measurements path */}
      <Route path="/body-details" element={<BodyDetails />} />
      <Route path="/building_u" element={<Building_u />} />
      <Route path="/heatmap" element={<Heatmap />} />

      {/* ✅ Upload photo path */}
      <Route path="/upload-photo" element={<UploadPhoto />} />
      <Route path="/generate-twin" element={<Generate_twin />} />
      <Route path="/generated" element={<Generated />} />

      {/* ✅ ONE hub page (both flows arrive here) */}
      <Route path="/measurements" element={<Measurements />} />

      {/* ✅ Try-on module routes */}
      <Route path="/measurements/clothing-cat" element={<Clothing_Cat />} />
 

      {/* Other pages */}
      <Route path="/report" element={<Report />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/learnmore" element={<LearnMore />} />
    </Routes>
  );
}
