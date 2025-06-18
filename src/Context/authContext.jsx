import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../utils/Supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [cameFromUserDetailsPage, setCameFromUserDetailsPage] = useState(false);
    const [proceedToUserDetails, setProceedToUserDetails] = useState(false);
    const [vendorData, setVendorData] = useState(null);
    const [dpProfile, setdpProfile] = useState(null);

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchDPProfile = async () => {
            const { data, error } = await supabase
                .from("delivery_partner")
                .select("*")
                .eq("u_id", session.user.id)
                .single();

            if (error) {
                console.error("❌ Error fetching delivery partner profile:", error.message);
            } else {
                console.log("✅ Fetched DP Profile:", data);
                setdpProfile(data);
            }
        };

        fetchDPProfile();

        // ✅ Setup realtime listener only once when session.user.id is available
        const channel = supabase
            .channel('dp-profile-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'delivery_partner',
                    filter: `u_id=eq.${session.user.id}`
                },
                (payload) => {
                    console.log("📡 Realtime DP profile change:", payload);
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        setdpProfile(payload.new);
                    }
                    if (payload.eventType === 'DELETE') {
                        setdpProfile(null);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session?.user?.id]); // ✅ more specific than [session]
    

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
                setdpProfile
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
