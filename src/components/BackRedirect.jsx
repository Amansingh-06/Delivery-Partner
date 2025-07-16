import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BackRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handlePopState = () => {
      console.log("🔙 Back pressed, redirecting to /home");
      navigate("/home", { replace: true });
    };

    window.history.pushState(null, "", location.pathname); // replace current state
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location.pathname, navigate]);

  return null;
};

export default BackRedirect;
