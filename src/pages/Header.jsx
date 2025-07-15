import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { useAuth } from "../Context/authContext";
import Loader from "../components/Loader";
import {
  GiFullPizza,
  GiFrenchFries,
  GiChickenOven,
} from "react-icons/gi";
import { FaIceCream } from "react-icons/fa";
import { MdOutlineFastfood } from "react-icons/md";
import { PiBowlFood } from "react-icons/pi";
import { CiLogout } from "react-icons/ci";

const floatingIcons = [
  { Icon: GiFullPizza, position: "top-2 right-8", animation: "animate-bounce-slow" },
  { Icon: GiFrenchFries, position: "top-1 left-8", animation: "animate-float" },
  { Icon: GiChickenOven, position: "top-4 lg:top-1/3 right-44", animation: "animate-float" },
  { Icon: FaIceCream, position: "top-6 left-40", animation: "animate-bounce-slow" },
  { Icon: GiFullPizza, position: "top-6 left-80", animation: "animate-float" },
  { Icon: PiBowlFood, position: "top-8 right-80", animation: "animate-bounce-slow" },
  { Icon: GiChickenOven, position: "top-2 right-[470px]", animation: "animate-float" },
  { Icon: FaIceCream, position: "top-5 left-60 lg:left-1/2", animation: "animate-bounce-slow" },
  { Icon: GiFrenchFries, position: "top-6 left-1/3", animation: "animate-bounce-slow" },
  { Icon: MdOutlineFastfood, position: "top-2 left-20 lg:left-[600px]", animation: "animate-float" },
  { Icon: FaIceCream, position: "top-1 right-[550px]", animation: "animate-bounce-slow" },
];

const Header = ({ title = "Registration", hideOnScroll = false, children }) => {
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { setSession } = useAuth();
  const navigate = useNavigate();

  // Mount
  useEffect(() => setHasMounted(true), []);

  // Hide on scroll
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY < lastScrollY || currentScrollY < 10);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, hideOnScroll]);

  return (
    <>
<div className={`fixed top-0 left-1/2 transform -translate-x-1/2 max-w-2xl  flex justify-center w-full z-50
${hasMounted ? 'transition-transform duration-300' : ''} 
        ${showNavbar ? 'translate-y-0' : '-translate-y-full'}`}>

        {/* WAVE BACKGROUND */}
        <div className="absolute inset-0 rotate-180 rounded-t-xl overflow-hidden">
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e67110" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#e67110" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="waveGradient4" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#e67110" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#e67110" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
              </linearGradient>
            </defs>
            <path d="M0,0 L1200,0 L1200,200 L0,200 Z" fill="url(#waveGradient3)" />
            <path d="M0,20 C200,260 400,35 600,24 C800,5 1000,19 1200,90 L1200,200 L0,200 Z" fill="url(#waveGradient4)" />
            <path d="M0,40 C400,305 800,35 1200,140 L1200,200 L0,200 Z" fill="rgba(147, 197, 253, 0.1)" />
          </svg>
        </div>

        {/* FLOATING ICONS */}
        {floatingIcons.map(({ Icon, position, animation }, idx) => (
          <div key={idx} className={`absolute text-white z-40 opacity-20 text-2xl lg:text-4xl ${position} ${animation} pointer-events-none`}>
            <Icon />
          </div>
        ))}

        {/* HEADER CONTENT */}
        <div className={`relative z-10 flex items-center p-4 w-full max-w-2xl mx-auto 
          ${title === "Profile" ? "justify-between" : "justify-center"}`}>
          <h1 className={`text-2xl font-semibold text-white`}>
            {title}
          </h1>

          {title === "Profile" && (
            <button
              onClick={() => logout(setSession, setLoggingOut)}
              disabled={loggingOut}
              className="button-gradientBG cursor-pointer text-white flex items-center px-3 lg:px-4 py-1 lg:py-2 rounded-md text-lg lg:text-sm hover:bg-orange transition"
            >
              <CiLogout className="inline-block mr-1 text-lg" />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          )}
        </div>

        {/* Optional children content inside header (e.g., navbar) */}
        {children && (
          <div className="relative z-10">
            {children}
          </div>
        )}
      </div>

      {loggingOut && <Loader />}
    </>
  );
};

export default Header;
