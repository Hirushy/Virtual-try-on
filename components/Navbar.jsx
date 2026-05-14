import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { User, LogOut, ChevronDown, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, logout, loginWithGoogle } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [openAuth, setOpenAuth] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const popupRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const pinRefs = [useRef(), useRef(), useRef(), useRef()];
  const [newPin, setNewPin] = useState(["", "", "", ""]);
  const newPinRefs = [useRef(), useRef(), useRef(), useRef()];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const resetAll = () => {
    setOpenAuth(false); setAuthMode(null); setEmail(""); setPassword("");
    setPin(["", "", "", ""]); setNewPin(["", "", "", ""]);
    setError(""); setSuccessMsg("");
  };

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (!loading) resetAll();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [loading]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Favorites", path: "/favorites" },
    { name: "My Looks", path: "/saved-looks" },
    { name: "Privacy", path: "/privacy" },
    { name: "How It Works", path: "/how-it-works" },
  ];

  const handlePinChange = (value, idx, isNew = false) => {
    if (!/^[0-9]?$/.test(value)) return;
    const copy = isNew ? [...newPin] : [...pin];
    copy[idx] = value;
    isNew ? setNewPin(copy) : setPin(copy);
    if (value && idx < 3) {
      if (isNew) {
        if (newPinRefs[idx + 1].current) newPinRefs[idx + 1].current.focus();
      } else {
        if (pinRefs[idx + 1].current) pinRefs[idx + 1].current.focus();
      }
    }
  };

  const handlePinKeyDown = (e, idx, isNew = false) => {
    if (e.key === "Backspace" && !(isNew ? newPin[idx] : pin[idx]) && idx > 0) {
      if (isNew) {
        if (newPinRefs[idx - 1].current) newPinRefs[idx - 1].current.focus();
      } else {
        if (pinRefs[idx - 1].current) pinRefs[idx - 1].current.focus();
      }
    }
  };

  const getPinString = () => pin.join("");
  const getNewPinString = () => newPin.join("");

  const handleSignIn = async () => {
    setError(""); setSuccessMsg("");
    if (!email || !password || getPinString().length < 4) {
      return setError("Complete all fields (Email, Password, 4-digit PIN).");
    }
    setLoading(true);
    const result = await register(email.trim(), password);
    if (result.success) {
      try {
        await setDoc(doc(db, "userConfigs", email.trim().toLowerCase()), { pin: getPinString() });
        setSuccessMsg("Welcome! Account Created.");
        setTimeout(() => resetAll(), 1500);
      } catch {
        setError("Failed to save security PIN.");
      }
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handlePinLogin = async () => {
    setError(""); setSuccessMsg("");
    if (!email || !password || getPinString().length < 4) {
      return setError("Enter your email, password, and 4-digit PIN.");
    }
    setLoading(true);
    try {
      const docRef = doc(db, "userConfigs", email.trim().toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().pin === getPinString()) {
        const result = await login(email.trim(), password);
        if (result.success) {
          setSuccessMsg("Logged in successfully.");
          setTimeout(() => resetAll(), 1200);
        } else {
          setError(result.error || "Login failed. Check your password.");
        }
      } else {
        setError("Invalid email or PIN.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPin = async () => {
    setError(""); setSuccessMsg("");
    if (!email || getNewPinString().length < 4) {
      return setError("Enter email and a new 4-digit PIN.");
    }
    setLoading(true);
    try {
      await setDoc(doc(db, "userConfigs", email.trim().toLowerCase()), { pin: getNewPinString() }, { merge: true });
      setSuccessMsg("PIN reset successfully!");
      setTimeout(() => setAuthMode("login"), 1500);
    } catch {
      setError("PIN reset failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(""); setSuccessMsg("");
    setLoading(true);
    const res = await loginWithGoogle();
    if (res.success) {
      setSuccessMsg("Logged in with Google!");
      setTimeout(() => resetAll(), 1500);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const isLightPage = ["/choose", "/body-details"].includes(location.pathname);

  // ── Shared input field style ──
  const inputClass = "w-full flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-white focus-within:border-purple-400 transition-all";
  const inputInner = "flex-1 bg-transparent text-[13px] text-gray-700 placeholder-gray-300 focus:outline-none";
  const iconClass = "w-4 h-4 flex-shrink-0 text-gray-300";

  // ── SVG icons ──
  const EmailIcon = () => (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
    </svg>
  );
  const LockIcon = () => (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
      <rect x="3" y="11" width="18" height="11" rx="2" /><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const PersonIcon = ({ size = 22 }) => (
    <svg width={size} height={size} fill="none" stroke="white" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-12 z-[60] cursor-ns-resize"
        onMouseEnter={() => setIsHovered(true)}
      />

      <Motion.nav
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ y: "-100%" }}
        animate={{ y: (isHovered || openAuth) ? 0 : "-100%" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 z-50 flex items-center justify-between w-full px-10 py-6 bg-transparent border-b ${isLightPage ? "border-black/5" : "border-white/5"}`}
      >
        {/* Logo */}
        <div className="flex justify-start">
          <Link to="/" onClick={resetAll}>
            <h1 className={`text-3xl font-serif-premium font-light tracking-tighter ${isLightPage ? "text-black hover:text-gray-600" : "text-white hover:text-gray-400"} transition-colors`}>
              <span>Fitora</span>
            </h1>
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex justify-center flex-1">
          <ul className="hidden md:flex space-x-12">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`text-[12px] md:text-[13px] font-serif-premium font-medium uppercase tracking-[0.4em] transition-all duration-500 ${
                      isLightPage 
                        ? (isActive ? "text-black" : "text-gray-400 hover:text-black") 
                        : (isActive ? "text-white" : "text-[#a397b1] hover:text-white")
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Auth Button */}
        <div className="flex justify-end space-x-12">
          <div className="relative">
            {user ? (
              <button
                onClick={() => setOpenAuth(!openAuth)}
                className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all group ${isLightPage ? "bg-black/5 border border-black/10 hover:bg-black/10" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${isLightPage ? "bg-black/10 text-black group-hover:bg-black group-hover:text-white" : "bg-white/20 text-white group-hover:bg-white group-hover:text-black"}`}>
                  {user?.photoURL
                    ? <img src={user.photoURL} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    : (user?.email?.charAt(0).toUpperCase() || "U")}
                </div>
                <span className={`text-[12px] font-['Times_New_Roman',serif] font-black uppercase tracking-[0.2em] max-w-[120px] truncate ${isLightPage ? "text-black" : "text-white"}`}>
                  {user?.displayName || user?.email || "Account"}
                </span>
                <ChevronDown size={14} className={`${isLightPage ? "text-black/40" : "text-gray-500"} transition-transform duration-300 ${openAuth ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <button
                onClick={() => setOpenAuth(!openAuth)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all shadow-lg active:scale-95 ${isLightPage ? "bg-black text-white hover:bg-gray-800" : "bg-white text-black hover:bg-gray-200"}`}
              >
                <User size={16} />
                <span className="text-[12px] font-['Times_New_Roman',serif] font-black uppercase tracking-widest">LOGIN</span>
              </button>
            )}

            <AnimatePresence>
              {openAuth && (
                <Motion.div
                  ref={popupRef}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-16 right-0 w-80 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-[70] overflow-hidden p-7"
                >
                  {user ? (
                    /* ── Logged-in dropdown ── */
                    <div className="space-y-5">
                      <div className="flex items-center gap-3 pb-5 border-b border-gray-100">
                        <div className="w-11 h-11 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #a78bfa, #ec4899)" }}>
                          {user?.photoURL
                            ? <img src={user.photoURL} alt="avatar" className="w-11 h-11 rounded-full object-cover" />
                            : <PersonIcon size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Signed in</p>
                          <p className="text-sm font-bold text-gray-800 truncate">{user?.displayName || user?.email}</p>
                        </div>
                      </div>
                      <button className="w-full py-3 bg-gray-50 text-gray-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
                        Settings
                      </button>
                      <button
                        onClick={() => { logout(); resetAll(); }}
                        className="w-full py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-red-100 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white hover:border-red-500"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>

                  ) : !authMode ? (
                    /* ── Auth mode selector ── */
                    <div className="space-y-4">
                      <div className="text-center mb-5">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)" }}>
                          <PersonIcon size={28} />
                        </div>
                        <h3 className="text-[22px] font-black text-gray-900 tracking-tight">Welcome</h3>
                        <p className="text-[11px] text-gray-400 mt-1">Sign in or create your account</p>
                      </div>

                      <button
                        onClick={() => setAuthMode("login")}
                        className="w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                      >
                        Log In
                      </button>

                      <button
                        onClick={() => setAuthMode("signin")}
                        className="w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                      >
                        Sign Up
                      </button>

                      <div className="flex items-center gap-3 py-1">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>

                      <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-gray-50 transition-all disabled:opacity-40"
                      >
                        <GoogleIcon /> Continue with Google
                      </button>

                      {error && <p className="text-[10px] text-red-500 font-semibold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                      {successMsg && <p className="text-[10px] text-green-600 font-semibold bg-green-50 p-3 rounded-xl border border-green-100">{successMsg}</p>}
                    </div>

                  ) : (
                    /* ── Email / Password / PIN form ── */
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => setAuthMode(null)}
                          className="text-[10px] text-gray-400 hover:text-gray-700 font-bold uppercase tracking-widest transition-colors"
                        >
                          ← Back
                        </button>
                      </div>

                      <div className="text-center mb-2">
                        <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ background: authMode === "signin" ? "linear-gradient(135deg, #ec4899, #f43f5e)" : "linear-gradient(135deg, #818cf8, #a78bfa)" }}>
                          <PersonIcon size={24} />
                        </div>
                        <h3 className="text-[18px] font-black text-gray-900 tracking-tight">
                          {authMode === "login" ? "Log In" : authMode === "signin" ? "Sign Up" : "Reset PIN"}
                        </h3>
                      </div>

                      {/* Fields */}
                      <div className="space-y-3">
                        {/* Email */}
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1.5">Email</label>
                          <div className={inputClass}>
                            <EmailIcon />
                            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} className={inputInner} />
                          </div>
                        </div>

                        {/* Password */}
                        {(authMode === "signin" || authMode === "login") && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Password</label>
                              {authMode === "login" && (
                                <button onClick={() => setAuthMode("forgot")} className="text-[10px] font-bold text-purple-500 hover:text-purple-700 transition-colors">
                                  Forgot PIN?
                                </button>
                              )}
                            </div>
                            <div className={inputClass}>
                              <LockIcon />
                              <input type="password" placeholder={authMode === "signin" ? "Create a password" : "Enter your password"} value={password} onChange={e => setPassword(e.target.value)} className={inputInner} />
                            </div>
                          </div>
                        )}

                        {/* PIN */}
                        <div>
                          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-2">
                            {authMode === "forgot" ? "New 4-digit PIN" : "Security PIN"}
                          </label>
                          <div className="flex justify-between gap-2">
                            {(authMode === "forgot" ? newPin : pin).map((d, i) => (
                              <input
                                key={i}
                                ref={(authMode === "forgot" ? newPinRefs : pinRefs)[i]}
                                maxLength={1}
                                value={d}
                                onChange={e => handlePinChange(e.target.value, i, authMode === "forgot")}
                                onKeyDown={e => handlePinKeyDown(e, i, authMode === "forgot")}
                                className="w-14 h-14 text-xl font-black text-center bg-white border border-gray-200 rounded-2xl text-gray-800 focus:border-purple-400 focus:outline-none transition-all"
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {error && <p className="text-[10px] text-red-500 font-semibold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                      {successMsg && <p className="text-[10px] text-green-600 font-semibold bg-green-50 p-3 rounded-xl border border-green-100">{successMsg}</p>}

                      <button
                        onClick={authMode === "login" ? handlePinLogin : authMode === "signin" ? handleSignIn : handleForgotPin}
                        disabled={loading}
                        className="w-full py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:opacity-40"
                        style={{ background: authMode === "signin" ? "linear-gradient(135deg, #ec4899, #f43f5e)" : "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                      >
                        {loading ? "..." : authMode === "login" ? "Log In" : authMode === "signin" ? "Sign Up" : "Update PIN"}
                      </button>

                      <p className="text-center text-[11px] text-gray-400">
                        {authMode === "login" ? "Not registered? " : "Have an account? "}
                        <button
                          onClick={() => setAuthMode(authMode === "login" ? "signin" : "login")}
                          className="font-bold"
                          style={{ color: authMode === "login" ? "#6366f1" : "#ec4899" }}
                        >
                          {authMode === "login" ? "Sign Up ›" : "Log In ›"}
                        </button>
                      </p>
                    </div>
                  )}
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Motion.nav>
    </>
  );
};

export default Navbar;