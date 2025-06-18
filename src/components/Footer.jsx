import { useNavigate, useLocation } from "react-router-dom";
import { FiClipboard, FiShoppingCart, FiUser } from "react-icons/fi";
import { PiMoneyWavyDuotone } from "react-icons/pi";

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 🔍 Get current route path

    const navItems = [
        { id: "Home", icon: FiClipboard, label: "Home", path: "/home" },
        // { id: "Manage Items", icon: FiShoppingCart, label: "Manage Items", path: "/manage-items" },
        { id: "Earning", icon: PiMoneyWavyDuotone, label: "Earning", path: "/earning" },
        { id: "Profile", icon: FiUser, label: "Profile", path: "/profile" }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-2xl flex justify-around items-center max-w-2xl mx-auto h-[70px] z-50">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path; // ✅ Match current path

                return (
                    <div
                        key={item.id}
                        onClick={() => navigate(item.path)}
                        className={`relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out
              px-3 py-1 rounded-2xl min-w-[60px]
              ${isActive ? 'transform -translate-y-1' : 'hover:transform hover:-translate-y-0.5'}`}
                    >
                        {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl shadow-lg opacity-20"></div>
                        )}
                        <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300
              ${isActive ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                            <Icon className={`text-lg transition-all duration-300 ${isActive ? 'scale-105' : ''}`} />
                        </div>
                        <span className={`text-xs mt-0.5 font-medium transition-all duration-300
              ${isActive ? 'text-yellow-600 font-semibold' : 'text-gray-500 hover:text-yellow-500'}`}>
                            {item.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default BottomNav;
