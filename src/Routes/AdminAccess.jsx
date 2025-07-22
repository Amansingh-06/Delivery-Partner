import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../utils/Supabase";
import { useAuth } from "../Context/authContext";
import Loader from "../components/Loader";

export default function AdminProtectedRoute({ children, fallback = null }) {
    // const { vendorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const urlVendorId = new URLSearchParams(location.search).get("dpId");
    const urlToken = new URLSearchParams(location.search).get("token");
    const urlRefreshToken = new URLSearchParams(location.search).get("refresh");

    const { setSelectedDpId } = useAuth();
    const [isAllowed, setIsAllowed] = useState(null);
 useEffect(() => {
    const verifyAdmin = async () => {
      console.log("🔐 Verifying Admin Access...");

      // ✅ Always prefer URL tokens when present
      const token = urlToken ?? localStorage.getItem("admin_token");
      const refreshToken = urlRefreshToken ?? localStorage.getItem("admin_refresh_token");
      const vendorId = urlVendorId ?? localStorage.getItem("admin_vendor_id");

      console.log("🧾 Token:", token);
      console.log("🔁 Refresh Token:", refreshToken);
      console.log("🏪 Vendor ID:", vendorId);

      // ❌ Validate tokens
      if (
        !token ||
        !refreshToken ||
        token === "undefined" ||
        refreshToken === "undefined"
      ) {
        console.warn("🚫 Invalid or missing token/refreshToken");
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_vendor_id");

        fallback ? setIsAllowed(false) : navigate("/");
        return;
      }

      // ✅ If tokens are from URL, save them
      if (urlToken && urlRefreshToken && urlVendorId) {
        console.log("💾 Saving tokens from URL to localStorage");
        localStorage.setItem("admin_token", urlToken);
        localStorage.setItem("admin_refresh_token", urlRefreshToken);
        localStorage.setItem("admin_vendor_id", urlVendorId);
      }

      // ✅ Set Supabase session
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error("❌ Supabase Session Error:", sessionError.message);
        localStorage.clear();
        fallback ? setIsAllowed(false) : navigate("/");
        return;
      }

      // ✅ Get user info
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (!user || userError) {
        console.error("❌ Failed to get user:", userError?.message);
        localStorage.clear();
        fallback ? setIsAllowed(false) : navigate("/");
        return;
      }

      console.log("👤 Logged in User:", user.id);

      // ✅ Get role from 'user' table
      const { data: profile, error } = await supabase
        .from("user")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error || !profile) {
        console.error("❌ Error fetching profile:", error?.message);
        fallback ? setIsAllowed(false) : navigate("/");
        return;
      }

      console.log("🛡️ User Role:", profile.role);

      if (profile.role !== "Admin") {
        console.warn("🚫 Not an admin user");
        fallback ? setIsAllowed(false) : navigate("/");
        return;
      }

            // ✅ Admin verified
            setSelectedDpId(dpId);

            setIsAllowed(true);
        };

        verifyAdmin();
    }, []);

    if (isAllowed === null) return <Loader/>;

    if (isAllowed === true) return children;

    if (isAllowed === false && fallback) return fallback;

    return <div className="text-center text-red-500">Access denied</div>;
}
