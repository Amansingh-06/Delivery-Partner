import React,{useState,useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Otp from './pages/Login/Otp';
import Login from './pages/Login/Login';
import ProtectedGuestRoute from './Routes/ProtectedGuestRoutes';
import Registration from './pages/Registration';
import PrivateRoute from './Routes/ProtectedRoutes';
import HomePage from './pages/Home';
import Dp_Profile from './pages/Dp_profilePage';
import InstallPrompt from './components/InstallPrompt';
import Earnings from './pages/Earnings';
// import Layout from './Layout/Layout'; // 🟡 Import your Layout
import Layout from './pages/Layout';
import AdminProtectedRoute from './Routes/AdminAccess';
import ScrollToTop from './components/ScrolltoTop';

function App() {

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log("✅ You are online");
      setIsOnline(true);
    };
    const handleOffline = () => {
      console.warn("📴 You are offline");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (!navigator.onLine) {
      console.warn("📴 You are offline at first load");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // ❌ Don't render anything when offline
  if (!isOnline) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
        <h1>📴 You are offline</h1>
        <p>Please check your internet connection.</p>
      </div>
    );
  }

  return (
    <div className='font-family-poppins bg-gradient-to-br from-white via-gray-50 to-gray-100'>
      {/* <ScrollToTop /> */}
      <Router>
        <Routes>
          {/* 🔐 Guest Routes */}
          <Route
            path="/"
            element={
              <ProtectedGuestRoute>
                <Login />
              </ProtectedGuestRoute>
            }
          />
          <Route
            path="/otp"
            element={
              <ProtectedGuestRoute>
                <Otp />
              </ProtectedGuestRoute>
            }
          />
          <Route
            path="/registration"
            element={
              <ProtectedGuestRoute>
                <Registration />
              </ProtectedGuestRoute>
            }
          />

          {/* 🔐 Protected Routes with Layout */}
          <Route
            element={
              <AdminProtectedRoute fallback={<PrivateRoute><Layout/></PrivateRoute>}>
                <Layout/>
              </AdminProtectedRoute>
            
            }
          >
            <Route path="/home" element={<HomePage />} />
            <Route path="/profile" element={<Dp_Profile />} />
            <Route path="/earning" element={<Earnings />} />
            {/* You can add more private routes here */}
          </Route>
        </Routes>

        <InstallPrompt />
      </Router>
    </div>
  );
}

export default App;
