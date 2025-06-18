import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from '../utils/Supabase';
import Loader from "../components/Loader";
import NetworkError from "../components/NetWorkError";
import { logout } from "../utils/auth";
import { useAuth } from "../Context/authContext";

const PrivateRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const { session, setSession } = useAuth();
    const [isRegistered, setIsRegistered] = useState(null); // Start as null, not false
    const [retryCount, setRetryCount] = useState(0);
    const [error, setError] = useState(null);
    const MAX_RETRIES = 3;
    const location = useLocation();

    useEffect(() => {
        const getUserData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) throw new Error("No session returned");

                setSession(session);
                setError(null);

                const user = session.user;
                if (user) {
                    // Set isRegistered properly
                    const isReg = user.user_metadata?.isRegistered ?? false;
                    setIsRegistered(isReg);
                }

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
            } finally {
                setIsLoading(false)
            }
        };

        getUserData();
    }, [retryCount, setSession]);

    if (isLoading) {
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

    // If session not there, redirect to login/home
    if (!session) {
        return <Navigate to="/" replace />;
    }

    if (session && isRegistered === false) {
        logout(setSession); // this clears supabase + context
        return <Navigate to="/" replace />;
        // or if you want to collect user details:
        // return <Navigate to="/userdetails" replace />;
    }

    // All good
    if (session && isRegistered) {
        return children;
    }

    // Fallback: defensive (shouldn't reach here)
    return <Loader />;
};

export default PrivateRoute;
