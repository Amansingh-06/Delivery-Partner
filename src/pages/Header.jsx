import React, { useState } from 'react';
import { MdOutlineMessage, MdOutlineFastfood } from "react-icons/md";
import { GiChickenOven, GiFrenchFries, GiFullPizza } from 'react-icons/gi';
import { FaIceCream } from 'react-icons/fa';
import { PiBowlFood } from 'react-icons/pi';

const Header = ({ title = "Registration" }) => {
    const [switchOn, setSwitchOn] = useState(false);

    return (
        <div className='w-full top-0 z-20 backdrop-blur-sm rounded-b-lg overflow-hidden bg-gradient-to-br from-orange via-yellow to-orange'>

            {/* Floating Food Icons */}
            <div>
                <GiFullPizza className="absolute text-red opacity-30 text-2xl lg:text-4xl top-2 right-8 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-red opacity-30 text-2xl lg:text-4xl bottom-10 left-8 animate-float pointer-events-none" />
                <GiChickenOven className="absolute text-red opacity-30 text-2xl lg:text-4xl top-4 lg:top-1/3 right-44 animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl bottom-6 right-12 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-pink opacity-30 text-2xl lg:text-4xl bottom-0 lg:bottom-12 left-40 animate-bounce-slow pointer-events-none" />
                <GiFullPizza className="absolute text-red opacity-30 text-2xl lg:text-4xl top-6 left-80 animate-float pointer-events-none" />
                <PiBowlFood className="absolute text-red opacity-30 text-2xl lg:text-4xl top-8 right-80 animate-bounce-slow pointer-events-none" />
                <GiChickenOven className="absolute text-red opacity-30 text-2xl lg:text-4xl top-12 right-[470px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-10 left-60 lg:left-1/2 animate-bounce-slow pointer-events-none" />
                <GiFrenchFries className="absolute text-pink opacity-30 text-2xl lg:text-4xl top-16 left-1/3 animate-bounce-slow pointer-events-none" />
                <MdOutlineFastfood className="absolute text-red opacity-30 text-2xl lg:text-4xl top-2 left-20 lg:left-[600px] animate-float pointer-events-none" />
                <FaIceCream className="absolute text-pink opacity-15 text-2xl lg:text-4xl top-1 right-[550px] animate-bounce-slow pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center p-5">
                <h1 className="text-3xl font-bold md:text-left text-center text-white">
                    {title}
                </h1>
            </div>
        </div>
    );
};

export default Header;
