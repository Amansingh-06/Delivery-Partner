import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../utils/Supabase";
import { useAuth } from "../Context/authContext";
import Loader from "../components/Loader";

export default function AdminProtectedRoute({ children, fallback = null }) {
    // const { vendorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const dpId = new URLSearchParams(location.search).get("dpId");
    const token = new URLSearchParams(location.search).get("token");
    const refreshToken = new URLSearchParams(location.search).get("refresh");

    const { setSelectedDpId } = useAuth();
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        const verifyAdmin = async () => {
            // ✅ If no token in URL → fallback route (vendor style access)
            if (!token || !refreshToken) {
                if (fallback) {
                    setIsAllowed(false); // Vendor
                } else {
                    console.warn("⛔ No token and no fallback. Redirecting.");
                    navigate("/");
                }
                return;
            }

            // ✅ Admin login via token in URL
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: token,
                refresh_token: refreshToken,
            });

            if (sessionError) {
                console.error("❌ Failed to set session:", sessionError);
                navigate("/");
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();
            console.log("user",user)
            if (!user || userError) {
                
                console.error("❌ Failed to fetch user:", userError?.message);
                navigate("/");
                return;
            }

            const { data: profile, error } = await supabase
                .from("user")
                .select("role")
                .eq("user_id", user?.id)
                .single();

            if (error || !profile || profile.role !== "Admin") {
                console.warn("⛔ Not an admin");
                navigate("/");
                return;
            }

            // ✅ Admin verified
            setSelectedDpId(dpId);

            setIsAllowed(true);
        };

        verifyAdmin();
    }, [token, refreshToken, dpId]);

    if (isAllowed === null) return <Loader/>;

    if (isAllowed === true) return children;

    if (isAllowed === false && fallback) return fallback;

    return <div className="text-center text-red-500">Access denied</div>;
}
