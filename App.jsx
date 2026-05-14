import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Choose from "./pages/Choose";
import BodyDetails from "./pages/BodyDetails";
import Privacy from "./pages/Privacy";
import HowItWorks from "./pages/HowItWorks";

import UploadPhoto from "./pages/UploadPhoto";
import Generate_twin from "./pages/Generate_twin";
import Generated from "./pages/Generated";
import Favorites from "./pages/Favorites";
import SavedLooks from "./pages/SavedLooks";
import Measurements from "./pages/Measurements";
import Building_u from "./pages/Building_u";
import Report from "./pages/Report";
import LearnMore from "./pages/LearnMore";
import Heatmap from "./pages/Heatmap";
import Clothing_Cat from "./pages/measurements/Clothing_Cat";


export default function App() {
  return (
    <AuthProvider>
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
        
        {/* ✅ Favorites Management (v6.03) */}
        <Route path="/favorites" element={<Favorites />} />

        {/* ✅ Saved Looks / Look-Book (v6.07) */}
        <Route path="/saved-looks" element={<SavedLooks />} />

        {/* ✅ Try-on module routes */}
        <Route path="/measurements/clothing-cat" element={<Clothing_Cat />} />


   

        {/* Other pages */}
        <Route path="/report" element={<Report />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/learnmore" element={<LearnMore />} />
      </Routes>
    </AuthProvider>
  );
}
