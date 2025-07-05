import React from 'react';
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
