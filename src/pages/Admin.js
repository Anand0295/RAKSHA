import React, { useState, useEffect } from 'react';
import TopNav from '../components/common/TopNav';
import MobileAdminCard from '../components/mobile/MobileAdminCard';
import SecurityDashboard from '../components/security/SecurityDashboard';
import dlpManager from '../utils/dlp';

function Admin({ user, onLogout, linkRequests, setLinkRequests, approvedLinks, setApprovedLinks }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dlpViolations, setDlpViolations] = useState([]);
  const [activeTab, setActiveTab] = useState('approvals');

  useEffect(() => {
    // Load DLP violations
    const violations = JSON.parse(localStorage.getItem('dlpViolations') || '[]');
    setDlpViolations(violations);
    
    // Mock approval requests
    setRequests([
      {
        id: 1,
        linkId: 'LNK-001',
        requester: { email: 'operator@mod.gov.in' },
        link: { purpose: 'Kashmir Sector Emergency Brief' },
        status: 'PENDING'
      },
      {
        id: 2,
        linkId: 'LNK-002',
        requester: { email: 'analyst@mod.gov.in' },
        link: { purpose: 'Border Intelligence Report' },
        status: 'PENDING'
      }
    ]);
  }, []);

  const handleAction = (id, action) => {
    setLoading(true);
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === id ? { ...req, status: action.toUpperCase() } : req
      ));
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">🛡️ RAKSHA Admin Control</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'approvals'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approvals ({linkRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('violations')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'violations'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            DLP Violations ({dlpViolations.length})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔒 RAKSHA Security
          </button>
        </div>
        
        {activeTab === 'approvals' && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Link Approval Queue</h2>
                <p className="text-sm text-gray-500 mt-1">Review and approve secure link requests</p>
              </div>
              <div className="p-4">
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Token</th>
                        <th className="text-left py-2">Requester</th>
                        <th className="text-left py-2">Purpose</th>
                        <th className="text-left py-2">Time</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkRequests.map((req) => (
                        <tr key={req.id} className="border-b">
                          <td className="py-2 font-mono text-xs">{req.token}</td>
                          <td className="py-2">{req.requestedBy}</td>
                          <td className="py-2">{req.purpose}</td>
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
                                    setLinkRequests(prev => prev.map(r => 
                                      r.id === req.id ? {...r, status: 'denied'} : r
                                    ));
                                  }}
                                  disabled={loading}
                                  className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 touch-manipulation"
                                >
                                  Deny
                                </button>
                                <button
                                  onClick={() => {
                                    setApprovedLinks(prev => new Set([...prev, req.token]));
                                    setLinkRequests(prev => prev.map(r => 
                                      r.id === req.id ? {...r, status: 'approved'} : r
                                    ));
                                  }}
                                  disabled={loading}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 touch-manipulation"
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
                          <td colSpan="6" className="py-8 text-center text-gray-500">
                            No link requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <MobileAdminCard 
                  requests={linkRequests}
                  onApprove={(id, token) => {
                    setApprovedLinks(prev => new Set([...prev, token]));
                    setLinkRequests(prev => prev.map(r => 
                      r.id === id ? {...r, status: 'approved'} : r
                    ));
                  }}
                  onDeny={(id) => {
                    setLinkRequests(prev => prev.map(r => 
                      r.id === id ? {...r, status: 'denied'} : r
                    ));
                  }}
                  loading={loading}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Approved Links</h2>
              </div>
              <div className="p-4">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Array.from(approvedLinks).map((token) => (
                    <div key={token} className="flex justify-between items-center p-2 border rounded">
                      <span className="font-mono text-xs">{token}</span>
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
          </>
        )}
        
        {activeTab === 'violations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">DLP Security Violations</h2>
              <p className="text-sm text-gray-500 mt-1">Data Loss Prevention monitoring and alerts</p>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto hidden sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">User Agent</th>
                      <th className="text-left py-2">URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dlpViolations.slice(-10).map((violation, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            {violation.type}
                          </span>
                        </td>
                        <td className="py-2 text-xs">{new Date(violation.timestamp).toLocaleString()}</td>
                        <td className="py-2 text-xs max-w-xs truncate">{violation.userAgent}</td>
                        <td className="py-2 text-xs">{violation.url}</td>
                      </tr>
                    ))}
                    {dlpViolations.length === 0 && (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            No security violations detected
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden space-y-3">
                {dlpViolations.slice(-5).map((violation, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                        {violation.type}
                      </span>
                      <span className="text-xs text-gray-500">{new Date(violation.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 break-all">{violation.userAgent}</div>
                  </div>
                ))}
                {dlpViolations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm">No security violations detected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'security' && (
          <SecurityDashboard user={user} />
        )}
      </main>
    </div>
  );
}

export default Admin;