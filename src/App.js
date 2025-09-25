import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './components/auth/SignIn';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Logs from './pages/Logs';
import Links from './pages/Links';
import SecureMeeting from './components/meeting/SecureMeeting';
import LinkApproval from './components/meeting/LinkApproval';
import dlpManager from './utils/dlp';
import encryptionManager from './utils/encryption';
import blockchainLedger from './utils/blockchain';
import anomalyDetector from './utils/anomalyDetection';
import deviceFingerprinter from './utils/deviceFingerprinting';

function App() {
  const [user, setUser] = useState(null);
  const [linkRequests, setLinkRequests] = useState(() => {
    const saved = localStorage.getItem('linkRequests');
    return saved ? JSON.parse(saved) : [];
  });
  const [approvedLinks, setApprovedLinks] = useState(() => {
    const saved = localStorage.getItem('approvedLinks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem('linkRequests', JSON.stringify(linkRequests));
  }, [linkRequests]);

  useEffect(() => {
    localStorage.setItem('approvedLinks', JSON.stringify(Array.from(approvedLinks)));
  }, [approvedLinks]);

  useEffect(() => {
    // Initialize RAKSHA security systems
    dlpManager.initialize();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('RAKSHA: Service Worker registered'))
        .catch(err => console.log('RAKSHA: Service Worker registration failed'));
    }
    
    // Initialize device fingerprinting
    deviceFingerprinter.generateFingerprint().then(fingerprint => {
      console.log('RAKSHA: Device fingerprint generated');
      
      // Record device activity
      anomalyDetector.recordActivity('system', {
        type: 'DEVICE',
        fingerprint: fingerprint
      });
    });
    
    // Make systems globally available
    window.dlpManager = dlpManager;
    window.encryptionManager = encryptionManager;
    window.blockchainLedger = blockchainLedger;
    window.anomalyDetector = anomalyDetector;
    window.deviceFingerprinter = deviceFingerprinter;
    
    const session = localStorage.getItem('demo_session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        if (parsed.expires > Date.now()) {
          setUser(parsed.user);
          
          // Record login activity
          anomalyDetector.recordActivity(parsed.user.email, {
            type: 'LOGIN',
            timestamp: Date.now()
          });
        } else {
          localStorage.removeItem('demo_session');
        }
      } catch (e) {
        localStorage.removeItem('demo_session');
      }
    }
  }, []);

  const login = async (userData) => {
    setUser(userData);
    
    // Encrypt session data
    const sessionData = {
      user: userData,
      expires: Date.now() + 24 * 60 * 60 * 1000,
      fingerprint: await deviceFingerprinter.getFingerprint()
    };
    
    const encryptedSession = await encryptionManager.encrypt(sessionData);
    localStorage.setItem('demo_session', JSON.stringify(encryptedSession));
    
    // Log to blockchain
    await blockchainLedger.addTransaction('USER_LOGIN', {
      userId: userData.email,
      role: userData.role,
      timestamp: Date.now(),
      fingerprint: sessionData.fingerprint
    }, userData.email);
    
    // Record behavioral data
    anomalyDetector.recordActivity(userData.email, {
      type: 'LOGIN',
      timestamp: Date.now()
    });
    
    // Register device if new
    deviceFingerprinter.registerDevice();
  };

  const logout = async () => {
    if (user) {
      // Record logout activity
      anomalyDetector.recordActivity(user.email, {
        type: 'SESSION_END',
        timestamp: Date.now()
      });
      
      // Log to blockchain
      await blockchainLedger.addTransaction('USER_LOGOUT', {
        userId: user.email,
        timestamp: Date.now()
      }, user.email);
    }
    
    setUser(null);
    localStorage.removeItem('demo_session');
  };

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/sign-in" element={
          user ? <Navigate to="/dashboard" /> : <SignIn onLogin={login} />
        } />
        <Route path="/dashboard" element={
          user ? 
            <Dashboard 
              user={user} 
              onLogout={logout} 
              linkRequests={linkRequests}
              setLinkRequests={setLinkRequests}
            /> : 
            <Navigate to="/sign-in" />
        } />
        <Route path="/admin" element={
          user && user.role === 'Admin' ? 
            <Admin 
              user={user} 
              onLogout={logout} 
              linkRequests={linkRequests}
              setLinkRequests={setLinkRequests}
              approvedLinks={approvedLinks}
              setApprovedLinks={setApprovedLinks}
            /> : 
            <Navigate to="/dashboard" />
        } />
        <Route path="/logs" element={
          user ? <Logs user={user} onLogout={logout} /> : <Navigate to="/sign-in" />
        } />
        <Route path="/links" element={
          user ? 
            <Links 
              user={user} 
              onLogout={logout} 
              linkRequests={linkRequests}
              setLinkRequests={setLinkRequests}
              approvedLinks={approvedLinks}
              setApprovedLinks={setApprovedLinks}
            /> : 
            <Navigate to="/sign-in" />
        } />
        <Route path="/l/:token" element={<LinkApproval approvedLinks={approvedLinks} />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/sign-in"} />} />
      </Routes>
    </Router>
  );
}

export default App;