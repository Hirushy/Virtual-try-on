import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";


const Navbar = () => {
  const location = useLocation();
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState(null); // null | 'signin' | 'login' | 'forgot'
  const popupRef = useRef(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const newPinRefs = [useRef(), useRef(), useRef(), useRef()];

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Close popup when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        resetAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Privacy", path: "/privacy" },
    { name: "How It Works", path: "/how-it-works" },
  ];

  // PIN helpers
  const handlePinChange = (value, idx, isNew = false) => {
    if (!/^[0-9]?$/.test(value)) return;
    const copy = isNew ? [...newPin] : [...pin];
    copy[idx] = value;
    isNew ? setNewPin(copy) : setPin(copy);
    if (value && idx < 3) (isNew ? newPinRefs[idx + 1] : pinRefs[idx + 1]).current.focus();
  };

  const handlePinKeyDown = (e, idx, isNew = false) => {
    if (e.key === "Backspace") {
      const arr = isNew ? newPin : pin;
      if (!arr[idx] && idx > 0) (isNew ? newPinRefs[idx - 1] : pinRefs[idx - 1]).current.focus();
    }
  };

  const getPinString = () => pin.join("");
  const getNewPinString = () => newPin.join("");

  // Validation helpers
  const signInValid = () => email.trim() && password.trim() && /^\d{4}$/.test(getPinString());
  const pinLoginValid = () => email.trim() && /^\d{4}$/.test(getPinString());
  const forgotPinValid = () => email.trim() && /^\d{4}$/.test(getNewPinString());

  // API calls
  const handleSignIn = async () => {
    setError(""); setSuccessMsg("");
    if (!signInValid()) return setError("Enter email, password, and 4-digit PIN.");

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/register`, {
        email: email.trim(),
        password,
        pin: getPinString(),
      });
      localStorage.setItem("token", res.data.token);
      setSuccessMsg("Registered and logged in!");
      setTimeout(() => resetAll(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  const handlePinLogin = async () => {
    setError(""); setSuccessMsg("");
    if (!pinLoginValid()) return setError("Enter email and 4-digit PIN.");

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/pin-login`, {
        email: email.trim(),
        pin: getPinString(),
      });
      localStorage.setItem("token", res.data.token);
      setSuccessMsg("Logged in!");
      setTimeout(() => resetAll(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "PIN login failed");
    } finally { setLoading(false); }
  };

  const handleForgotPin = async () => {
    setError(""); setSuccessMsg("");
    if (!forgotPinValid()) return setError("Enter email and new 4-digit PIN.");

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/forgot-pin`, {
        email: email.trim(),
        newPin: getNewPinString(),
      });
      setSuccessMsg("PIN reset successfully!");
      setTimeout(() => resetAll(), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally { setLoading(false); }
  };

  const resetAll = () => {
    setOpenAuth(false); setAuthMode(null); setEmail(""); setPassword("");
    setPin(["", "", "", ""]); setNewPin(["", "", "", ""]); setError(""); setSuccessMsg("");
  };

  return (
    <>
      {/* Navbar */}
      <Motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-10 py-6 bg-black border-b border-gray-700 shadow-lg"
      >
        <Link to="/">
          <h1 className="text-3xl font-['Didact_Gothic',sans-serif] text-white hover:scale-105 transition">
            AI | <span className="text-gray-400"> Try-On</span>
          </h1>
        </Link>

        <div className="flex items-center space-x-14">
          <ul className="flex space-x-10 text-base font-['Didact_Gothic',sans-serif]">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Motion.li key={item.path} whileHover={{ scale: 1.05 }}>
                  <Link
                    to={item.path}
                    className={`relative ${isActive ? "text-gray-400" : "text-white hover:text-gray-300"}`}
                  >
                    {item.name}
                    {isActive && (
                      <Motion.span
                        layoutId="activeLink"
                        className="absolute bottom-[-6px] left-0 w-full h-[2px] bg-gray-400 rounded-full"
                      />
                    )}
                  </Link>
                </Motion.li>
              );
            })}
          </ul>

          {/* Sign-in Icon */}
          <button
            onClick={() => setOpenAuth(!openAuth)}
            className="text-white hover:text-gray-300"
          >
            <User size={32} />
          </button>
        </div>
      </Motion.nav>

      {/* Auth Popup */}
      {openAuth && (
        <Motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-10 w-80 bg-[#0d0d0d] text-white p-6 rounded-2xl shadow-2xl border border-gray-700 z-[60]"
        >
          {/* Mode selection */}
          {!authMode && (
            <div className="space-y-4">
              <button onClick={() => setAuthMode("signin")} className="w-full py-2 font-semibold text-black bg-white rounded-xl hover:bg-gray-200">Sign In</button>
              <button onClick={() => setAuthMode("login")} className="w-full py-2 bg-gray-800 border border-gray-600 rounded-xl hover:bg-gray-700">Log In</button>
              <button onClick={() => setAuthMode("forgot")} className="w-full py-2 bg-gray-800 border border-gray-600 rounded-xl hover:bg-gray-700">Forgot PIN</button>
            </div>
          )}

          {/* Sign In */}
          {authMode === "signin" && (
            <div className="space-y-3">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-black border border-gray-700 rounded-lg"/>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-black border border-gray-700 rounded-lg"/>
              <div className="flex justify-between my-1">
                {pin.map((d,i) => (
                  <input key={i} ref={pinRefs[i]} maxLength={1} value={d} onChange={e => handlePinChange(e.target.value,i)} onKeyDown={e=>handlePinKeyDown(e,i)} inputMode="numeric" pattern="[0-9]*" className="w-12 h-12 text-xl text-center bg-black border border-gray-700 rounded-xl"/>
                ))}
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              {successMsg && <div className="text-sm text-green-400">{successMsg}</div>}
              <button disabled={loading || !signInValid()} onClick={handleSignIn} className={`w-full py-2 font-semibold rounded-xl ${loading||!signInValid()?"bg-gray-600 text-gray-300":"bg-white text-black hover:bg-gray-200"}`}>
                {loading ? "Processing..." : "Continue"}
              </button>

              {/* Google Sign-In button styled */}
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const res = await axios.post(`${API_BASE}/google-login`, { tokenId: credentialResponse.credential });
                    localStorage.setItem("token", res.data.token);
                    setSuccessMsg("Logged in with Google!");
                    setTimeout(() => resetAll(), 1000);
                  } catch (err) {
                    setError(err.response?.data?.message || "Google login failed");
                  }
                }}
                onError={() => setError("Google login failed")}
                render={(renderProps) => (
                  <button onClick={renderProps.onClick} disabled={renderProps.disabled} className="flex items-center justify-center w-full gap-3 py-2 text-black bg-gray-100 rounded-xl hover:bg-gray-200">
                    <FcGoogle size={22}/> Continue with Google
                  </button>
                )}
              />
            </div>
          )}

          {/* Login */}
          {authMode === "login" && (
            <div className="space-y-3">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 bg-black border border-gray-700 rounded-lg"/>
              <div className="flex justify-between my-1">
                {pin.map((d,i)=>(
                  <input key={i} ref={pinRefs[i]} maxLength={1} value={d} onChange={e=>handlePinChange(e,i)} onKeyDown={e=>handlePinKeyDown(e,i)} inputMode="numeric" pattern="[0-9]*" className="w-12 h-12 text-xl text-center bg-black border border-gray-700 rounded-xl"/>
                ))}
              </div>
              <div className="flex items-center justify-between mt-1">
                <button onClick={() => setAuthMode("forgot")} className="text-sm text-gray-400 underline hover:text-gray-200">Forgot PIN?</button>
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              {successMsg && <div className="text-sm text-green-400">{successMsg}</div>}
              <button disabled={loading || !pinLoginValid()} onClick={handlePinLogin} className={`w-full py-2 font-semibold rounded-xl ${loading||!pinLoginValid()?"bg-gray-600 text-gray-300":"bg-white text-black hover:bg-gray-200"}`}>
                {loading ? "Checking..." : "Continue"}
              </button>
            </div>
          )}

          {/* Forgot PIN */}
          {authMode === "forgot" && (
            <div className="space-y-3">
              <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 bg-black border border-gray-700 rounded-lg"/>
              <div className="flex justify-between my-1">
                {newPin.map((d,i)=>(
                  <input key={i} ref={newPinRefs[i]} maxLength={1} value={d} onChange={e=>handlePinChange(e,i,true)} onKeyDown={e=>handlePinKeyDown(e,i,true)} inputMode="numeric" pattern="[0-9]*" className="w-12 h-12 text-xl text-center bg-black border border-gray-700 rounded-xl"/>
                ))}
              </div>
              {error && <div className="text-sm text-red-400">{error}</div>}
              {successMsg && <div className="text-sm text-green-400">{successMsg}</div>}
              <button disabled={loading || !forgotPinValid()} onClick={handleForgotPin} className={`w-full py-2 font-semibold rounded-xl ${loading||!forgotPinValid()?"bg-gray-600 text-gray-300":"bg-white text-black hover:bg-gray-200"}`}>
                {loading ? "Resetting..." : "Reset PIN"}
              </button>
            </div>
          )}
        </Motion.div>
      )}
    </>
  );
};

export default Navbar;
