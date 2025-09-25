import React from 'react';
import TopNav from '../components/common/TopNav';
import MobileLinkCard from '../components/mobile/MobileLinkCard';

function Links({ user, onLogout, linkRequests, setLinkRequests, approvedLinks, setApprovedLinks }) {
  const getDeviceType = (deviceInfo) => {
    if (!deviceInfo) return 'Unknown';
    const ua = deviceInfo.userAgent;
    const platform = deviceInfo.platform;
    
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows NT 10/.test(ua)) return 'Windows 10';
    if (/Windows NT/.test(ua)) return 'Windows PC';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Linux/.test(ua)) return 'Linux';
    if (platform) return platform;
    return 'Unknown';
  };

  const getBrowser = (userAgent) => {
    if (!userAgent) return 'Unknown';
    if (/Edg/.test(userAgent)) return 'Edge';
    if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) return 'Chrome';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    if (/Opera/.test(userAgent)) return 'Opera';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Link Management</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Link Access Requests</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor device access and security events</p>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Token</th>
                    <th className="text-left py-2">IP Address</th>
                    <th className="text-left py-2">Device</th>
                    <th className="text-left py-2">Browser</th>
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {linkRequests.map((req) => (
                    <tr key={req.id} className="border-b">
                      <td className="py-2 font-mono text-xs">{req.token}</td>
                      <td className="py-2">{req.ipAddress || 'N/A'}</td>
                      <td className="py-2">{getDeviceType(req.deviceInfo)}</td>
                      <td className="py-2">{getBrowser(req.deviceInfo?.userAgent)}</td>
                      <td className="py-2">{req.requestedAt}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded border ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {req.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                const updatedRequests = linkRequests.map(r => 
                                  r.id === req.id ? {...r, status: 'denied'} : r
                                );
                                setLinkRequests(updatedRequests);
                                localStorage.setItem('linkRequests', JSON.stringify(updatedRequests));
                              }}
                              className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 active:bg-red-800 touch-manipulation"
                            >
                              Deny
                            </button>
                            <button
                              onClick={() => {
                                setApprovedLinks(prev => new Set([...prev, req.token]));
                                const updatedRequests = linkRequests.map(r => 
                                  r.id === req.id ? {...r, status: 'approved'} : r
                                );
                                setLinkRequests(updatedRequests);
                                localStorage.setItem('linkRequests', JSON.stringify(updatedRequests));
                              }}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 active:bg-green-800 touch-manipulation"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {linkRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">
                        No link requests
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <MobileLinkCard 
              requests={linkRequests}
              onApprove={(id, token) => {
                setApprovedLinks(prev => new Set([...prev, token]));
                const updatedRequests = linkRequests.map(r => 
                  r.id === id ? {...r, status: 'approved'} : r
                );
                setLinkRequests(updatedRequests);
                localStorage.setItem('linkRequests', JSON.stringify(updatedRequests));
              }}
              onDeny={(id) => {
                const updatedRequests = linkRequests.map(r => 
                  r.id === id ? {...r, status: 'denied'} : r
                );
                setLinkRequests(updatedRequests);
                localStorage.setItem('linkRequests', JSON.stringify(updatedRequests));
              }}
              getDeviceType={getDeviceType}
              getBrowser={getBrowser}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Approved Links</h2>
          </div>
          <div className="p-4">
            <div className="grid gap-2">
              {Array.from(approvedLinks).map((token) => (
                <div key={token} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <span className="font-mono text-sm">{token}</span>
                    <span className="ml-2 text-xs text-green-600">● Active</span>
                  </div>
                  <button
                    onClick={() => {
                      setApprovedLinks(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(token);
                        return newSet;
                      });
                    }}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Revoke
                  </button>
                </div>
              ))}
              {approvedLinks.size === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No approved links
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Links;