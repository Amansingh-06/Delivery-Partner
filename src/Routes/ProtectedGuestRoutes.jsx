import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/Supabase";
import { useAuth } from "../Context/authContext";
import Loader from "../components/Loader";
import NetworkError from "../components/NetWorkError";

const ProtectedGuestRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { session, setSession } = useAuth();
    const [isRegistered, setIsRegistered] = useState(null);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;
    const location = useLocation();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    setSession(null);
                    setIsRegistered(false);
                    setIsLoading(false);
                    return;
                }

                setSession(session);

                const user = session.user;
                const isReg = user.user_metadata?.isRegistered ?? false;
                setIsRegistered(isReg);
                setError(null);
                setIsLoading(false);
            } catch (err) {
                const isNetworkError =
                    !navigator.onLine ||
                    err.message.includes("Failed to fetch") ||
                    err.message.includes("Network Error");

                if (isNetworkError && retryCount < MAX_RETRIES - 1) {
                    setTimeout(() => setRetryCount((c) => c + 1), 3000);
                    return;
                }

                setError(err);
                setIsLoading(false);
            }
        };

        getUserData();
    }, [retryCount, setSession]);

    if (isLoading || isRegistered === null) {
        return <Loader />;
    }

    if (
        error &&
        (!navigator.onLine ||
            error.message.includes("Failed to fetch") ||
            error.message.includes("Network Error"))
    ) {
        return <NetworkError />;
    }

    // Agar login ho chuka and registered hai toh home pe bhejo
    if (session && isRegistered) {
        return <Navigate to="/home" replace />;
    }

    // Agar login ho chuka lekin registered nahi hai, toh registration page pe rehne do
    if (session && !isRegistered) {
        if (location.pathname !== "/registration") {
            return <Navigate to="/registration" replace />;
        }
    }

    // Agar koi session nahi hai, toh yeh guest route hai, to children render kar do (login/register page)
    return children;
};

export default ProtectedGuestRoute;
