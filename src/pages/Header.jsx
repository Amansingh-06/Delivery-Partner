import React,{useState} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import { useAuth } from '../Context/authContext';
import { MdOutlineFastfood } from "react-icons/md";
import { GiChickenOven, GiFrenchFries, GiFullPizza } from 'react-icons/gi';
import { FaIceCream } from 'react-icons/fa';
import { PiBowlFood } from 'react-icons/pi';
import Loader from '../components/Loader';

const Header = ({ title = "Registration" }) => {
    const [loggingOut, setLoggingOut] = useState(false);

    const location = useLocation();
    const { setSession } = useAuth();
    const navigate = useNavigate();

    return (
        <>
<div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-20  w-full max-w-2xl backdrop-blur-sm rounded-b-lg font-family-poppins">
<div className="absolute inset-0 rotate-180 overflow-hidden">
                <svg
                    className="absolute top-0 left-0 w-full h-full"
                    viewBox="0 0 1200 200"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient
                            id="waveGradient3"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#e67110" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#e67110" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient
                            id="waveGradient4"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop offset="0%" stopColor="#e67110" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#e67110" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="#e67110" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>

                    {/* First wave layer - covers full background */}
                    <path
                        d="M0,0 L1200,0 L1200,200 L0,200 Z"
                        fill="url(#waveGradient3)"
                    />

                    {/* Second wave layer */}
                    <path
                        d="M0,20 C200,260 400,35 600,24 C800,5 1000,19 1200,90 L1200,200 L0,200 Z"
                        fill="url(#waveGradient4)"
                    />

                    {/* Third wave layer */}
                    <path
                        d="M0,40 C400,305 800,35 1200,140 L1200,200 L0,200 Z"
                        fill="rgba(147, 197, 253, 0.1)"
                    />
                </svg>
            </div>
            {/* Floating Icons */}
            <div>
                <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-2 right-8 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl bottom-5 left-3 animate-float pointer-events-none" />
                <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-4 lg:top-1/3 right-44 animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl bottom-2 right-18 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-35 animate-bounce-slow pointer-events-none" />
                <GiFullPizza className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-1 left-70 animate-float pointer-events-none" />
                <PiBowlFood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-1 right-60 animate-bounce-slow pointer-events-none" />
                <GiChickenOven className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-12 right-[470px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-10 left-60 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-16 left-1/3 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-white z-40 opacity-30 text-2xl lg:text-4xl top-2 left-20 lg:left-[530px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-white z-40 opacity-15 text-2xl lg:text-4xl top-1 right-[570px] animate-bounce-slow pointer-events-none" />
            </div>

            {/* Title and Logout */}
            <div className="relative z-10 flex items-center justify-center p-5">
                <h1 className="text-2xl font-bold md:text-left text-center text-white">
                    {title}
                </h1>

                {location.pathname === "/profile" && (
                    <button
  aria-label="Logout"
  onClick={() => logout(setSession, setLoggingOut)}
  disabled={loggingOut}
  className={`absolute top-6 right-4 px-4 py-2 text-sm font-medium rounded-md shadow-md transition-all duration-300
    ${
      loggingOut
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-green-500 text-white hover:bg-orange-600 hover:shadow-lg"
    }`}
>
  {loggingOut ? "Logging out..." : "Logout"}
</button>
                )}
                

            </div>
            </div>
            {loggingOut && <Loader/>}

            </>
    );
};

export default Header;
