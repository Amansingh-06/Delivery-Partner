import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/Supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [dpProfile, setdpProfile] = useState(null);
    const [selectedDpId, setSelectedDpId] = useState(null);

    console.log("Session",session)
    // ✅ Reusable fetch function (no realtime)
    const fetchDPProfile = async () => {
        let queryField = null;
        let value = null;
    
        if (selectedDpId) {
            // Agar tum yahan delivery partner ka id kisi selectedVendorId se fetch karna chahte ho
            queryField = "dp_id"; // ya jo bhi delivery_partner table me foreign key hai
            value = selectedDpId;
        } else if (session?.user?.id) {
            queryField = "u_id"; // delivery_partner table ka user id field
            value = session?.user?.id;
        }
    
        // console.log("selectedVendorId", selectedVendorId);
    
        if (queryField && value) {
            const { data, error } = await supabase
                .from("delivery_partner")
                .select("*")
                .eq(queryField, value)
                .single();
    
            if (error) {
                console.error("❌ Error fetching delivery partner profile:", error.message);
            } else {
                console.log("✅ Fetched DP Profile:", data);
                setdpProfile(data);
            }
        } else {
            console.warn("⚠️ No valid delivery partner identifier found");
        }
    };
    

    // ✅ Fetch on initial load or when session changes
    useEffect(() => {
        fetchDPProfile();
    }, [session, selectedDpId]);

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
                fetchDPProfile,
                selectedDpId,
                setSelectedDpId// ✅ export this so you can call it manually
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
