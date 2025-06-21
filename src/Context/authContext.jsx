import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/Supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [dpProfile, setdpProfile] = useState(null);

    console.log("Session",session)
    // ✅ Reusable fetch function (no realtime)
    const fetchDPProfile = async () => {
        if (!session?.user?.id) return;

        const { data, error } = await supabase
            .from("delivery_partner")
            .select("*")
            .eq("u_id", session?.user?.id)
            .single();

        if (error) {
            console.error("❌ Error fetching delivery partner profile:", error.message);
        } else {
            console.log("✅ Fetched DP Profile:", data);
            setdpProfile(data);
        }
    };

    // ✅ Fetch on initial load or when session changes
    useEffect(() => {
        fetchDPProfile();
    }, [session?.user?.id]);

    return (
        <AuthContext.Provider
            value={{
                session,
                setSession,
                cameFromUserDetailsPage,
                setCameFromUserDetailsPage,
                proceedToUserDetails,
                setProceedToUserDetails,
                vendorData,
                setVendorData,
                dpProfile,
                setdpProfile,
                fetchDPProfile, // ✅ export this so you can call it manually
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
