import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ArrowRight } from "lucide-react";

/**
 * Luxury Fashion Lab Footer
 * Features a multi-column layout with Newsletter subscription
 */
const Footer = () => {
  const textColor = "text-gray-400";
  const headingColor = "text-white";
  const bgColor = "bg-gradient-to-br from-[#070707] via-[#0a0a0a] to-[#120a1a]";
  const borderColor = "border-white/5";

  return (
    <footer className={`w-full ${bgColor} border-t ${borderColor} pt-20 pb-10 relative z-10 font-sans`}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Column 1: Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <h2 className={`text-3xl font-serif-premium font-light tracking-[-0.05em] ${headingColor}`}>
                Fitora<span className="text-purple-500">.</span>
              </h2>
            </Link>
            <p className={`text-[13px] leading-relaxed max-w-[240px] ${textColor}`}>
              Discover your perfect fit & style with AI-powered virtual try-on technology. Designed for the future of fashion.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className={`${textColor} hover:text-purple-400 transition-colors`}>
                  <Icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (Explore) */}
          <div className="space-y-6">
            <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${headingColor}`}>
              Explore
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Home", path: "/" },
                { name: "Favorites", path: "/favorites" },
                { name: "Try-On Studio", path: "/choose" },
                { name: "AI Looks", path: "/saved-looks" },
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms", path: "#" },
              ].map((item) => (
                <li key={item.name}>
                  <Link to={item.path} className={`text-[12px] ${textColor} hover:text-purple-400 transition-colors uppercase tracking-widest`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Features (Fashion Lab) */}
          <div className="space-y-6">
            <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${headingColor}`}>
              Fashion Lab
            </h4>
            <ul className="space-y-4">
              {[
                "Virtual Try-On",
                "AI Outfit Matching",
                "Body Fit Preview",
                "Style Recommendations",
                "Saved Looks",
                "Fashion Trends",
              ].map((item) => (
                <li key={item} className={`text-[12px] ${textColor} uppercase tracking-widest cursor-default`}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter & Contact */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className={`text-[11px] font-black uppercase tracking-[0.4em] ${headingColor}`}>
                Stay Updated
              </h4>
              <p className={`text-[12px] ${textColor}`}>
                Get latest fashion trends and AI styling updates.
              </p>
              <div className="flex items-center border-b border-white/10 py-2 group focus-within:border-purple-500 transition-colors">
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="bg-transparent border-none text-[10px] tracking-widest uppercase focus:outline-none flex-1 placeholder:text-gray-500 text-white"
                />
                <button className={`${headingColor} hover:text-purple-400 transition-colors`}>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <Mail size={14} className="text-purple-500" />
                <span className={`text-[11px] tracking-widest ${textColor}`}>SUPPORT@FITORA.COM</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={14} className="text-purple-500" />
                <span className={`text-[11px] tracking-widest ${textColor}`}>SRI LANKA</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Line */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className={`text-[10px] font-medium uppercase tracking-[0.4em] ${textColor}`}>
            © 2026 Fitora. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
             <p className={`text-[9px] font-bold uppercase tracking-[0.4em] ${textColor}`}>
               Made for the future of fashion.
             </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
