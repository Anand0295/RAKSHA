import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// Discord Color Palette
const discord = {
  blurple: '#5865F2',
  dark: '#36393F',
  lighterDark: '#2F3136',
  green: '#57F287',
  yellow: '#FEE75C',
  red: '#ED4245',
  white: '#FFFFFF',
  grey: '#B9BBBE',
};

// BANNER TYPES
const Banner = ({ type, message }) => {
  const colors = {
    info: discord.blurple,
    success: discord.green,
    warning: discord.yellow,
    error: discord.red,
  };
  return (
    <div className={`w-full px-4 py-3 rounded-md mb-2 flex items-center`} style={{ background: colors[type] }}>
      <span className="font-bold mr-2">{type.toUpperCase()}</span>
      <span className="text-sm">{message}</span>
    </div>
  );
};

// DISCORD BUBBLE
const Bubble = ({ children }) => (
  <div className="rounded-lg px-4 py-2 mb-2 bg-[#40444B] text-white shadow-md border border-[#23272A]">
    {children}
  </div>
);

export default function LinkApproval({ approvedLinks }) {
  // [location] Approval business logic, device, and DLP events
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'approved', 'denied', 'expired'
  const [timeLeft, setTimeLeft] = useState(60); // timer for popup
  const [deviceAnalytics, setDeviceAnalytics] = useState(null); // military device data
  const [dlpStatus, setDlpStatus] = useState('checking'); // DLP status

  // [security-event] Timer expiry triggers denial
  useEffect(() => {
    let overallTimeout = setTimeout(() => {
      setStatus('expired');
    }, 300000); // 5 minutes
    // Already approved
    if (approvedLinks?.has(token)) {
      setStatus('approved');
      clearTimeout(overallTimeout);
    } else {
      // Popup timer logic
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStatus('denied');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      // Gather device analytics (military grade)
      (async () => {
        const info = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
        };
        let realIP = 'Unknown';
        try {
          const data = await fetch('https://api.ipify.org?format=json').then(r => r.json());
          realIP = data.ip;
        } catch {}
        setDeviceAnalytics({ ...info, realIP });
        // [security-event] DLP Scan
        setTimeout(() => {
          // fake DLP logic: "Safe" for most, "Blocked" if IP ends in '1'
          setDlpStatus(String(realIP).endsWith('1') ? 'blocked' : 'safe');
        }, 1750);
      })();
    }
    return () => {
      clearTimeout(overallTimeout);
    };
  }, [token, approvedLinks]);

  // [location] UI section: Discord popup layout
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#36393F] p-5">
      <div className="w-full max-w-lg bg-[#2F3136] rounded-xl shadow-lg border border-[#23272A] py-6 px-5">
        <Banner type="info" message="This is a system popup managed by Discord—styled approval workflow." />
        <Bubble>
          <div className="flex items-center">
            <span className="font-semibold text-lg mr-2">Device Approval Request</span>
            <span className="ml-auto px-2 py-1 rounded bg-[#5865F2] text-white text-xs">{status.toUpperCase()}</span>
          </div>
        </Bubble>
        {status === 'loading' && (
          <Banner type="warning" message={`You have ${timeLeft}s to approve this military meeting link.`} />
        )}
        {deviceAnalytics && (
          <Bubble>
            <div className="font-bold text-blurple mb-1">Device Analytics</div>
            <div className="text-xs text-grey">
              UserAgent: {deviceAnalytics.userAgent}<br />
              IP: {deviceAnalytics.realIP}<br />
              Platform: {deviceAnalytics.platform}<br />
              Language: {deviceAnalytics.language}<br />
              Screen: {deviceAnalytics.screen}<br />
              Timezone: {deviceAnalytics.timezone}<br />
              Cookie Enabled: {String(deviceAnalytics.cookieEnabled)}<br />
              Online: {String(deviceAnalytics.onLine)}
            </div>
          </Bubble>
        )}
        {dlpStatus !== 'checking' && (
          <Banner type={dlpStatus === 'safe' ? 'success' : 'error'} message={`DLP: ${dlpStatus === 'safe' ? 'No leak detected.' : 'Potential data leak risk.'}`} />
        )}
        <div className="flex items-center gap-2 mt-6">
          {status === 'loading' && (
            <button className="bg-[#5865F2] text-white rounded-lg px-5 py-2 font-semibold tracking-wide hover:bg-[#4752C4] transition" onClick={() => setStatus('approved')}>
              Approve Now
            </button>
          )}
          <button className="bg-[#ED4245] text-white rounded-lg px-4 py-2 font-semibold hover:bg-red-600 transition" onClick={() => setStatus('denied')}>
            Deny
          </button>
        </div>
        {status === 'approved' && (
          <Banner type="success" message="Meeting link approved! Business event logged." />
        )}
        {status === 'denied' && (
          <Banner type="error" message="Approval denied. Security event logged." />
        )}
        {status === 'expired' && (
          <Banner type="warning" message="Session expired. Please request a fresh approval link." />
        )}
      </div>
      <div className="mt-6 text-xs text-grey text-center">
        &copy; {new Date().getFullYear()} Military Meeting Security | Discord UI powered by TailwindCSS
      </div>
    </div>
  );
}
