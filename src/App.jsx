// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Otp from './pages/Login/Otp';
import Login from './pages/Login/Login';
import ProtectedGuestRoute from './Routes/ProtectedGuestRoutes';
import Registration from './pages/Registration';
import PrivateRoute from './Routes/ProtectedRoutes';
import HomePage from './pages/Home';
import Dp_Profile from './pages/Dp_profilePage';
import InstallPrompt from './components/InstallPrompt';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtectedGuestRoute>
          <Login/>
        </ProtectedGuestRoute>} />
        <Route path="/otp" element={<ProtectedGuestRoute>
          <Otp/>
        </ProtectedGuestRoute>} />
        <Route path="/registration" element={<ProtectedGuestRoute>
          <Registration />
        </ProtectedGuestRoute>} />
        <Route path='/home' element={<PrivateRoute>
          <HomePage/>
        </PrivateRoute>} />
        <Route path='/profile' element={<PrivateRoute>
          <Dp_Profile/>
        </PrivateRoute>} />
        
        
      </Routes>
      <InstallPrompt />

    </Router>
  );
}

export default App;
