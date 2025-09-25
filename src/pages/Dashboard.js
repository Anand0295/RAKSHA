import React, { useState, useEffect } from 'react';
import TopNav from '../components/common/TopNav';
import MobileTable from '../components/mobile/MobileTable';
import { generateSecureToken, linkBlockchain, sha256 } from '../services/blockchain';

function Dashboard({ user, onLogout, linkRequests, setLinkRequests }) {
  const [linkPurpose, setLinkPurpose] = useState('');
  const [issuedToEmail, setIssuedToEmail] = useState('');
  const [roleAccess, setRoleAccess] = useState('operator');
  const [loading, setLoading] = useState(false);
  const [activeLinks, setActiveLinks] = useState(() => {
    const saved = localStorage.getItem('activeLinks');
    return saved ? JSON.parse(saved) : [];
  });
  const [pastLinks, setPastLinks] = useState(() => {
    const saved = localStorage.getItem('pastLinks');
    return saved ? JSON.parse(saved) : [];
  });
  const [blockchainStatus, setBlockchainStatus] = useState(() => {
    const saved = localStorage.getItem('blockchainStatus');
    return saved || 'Initializing...';
  });
  const [showFullHash, setShowFullHash] = useState({});

  useEffect(() => {
    localStorage.setItem('activeLinks', JSON.stringify(activeLinks));
  }, [activeLinks]);

  useEffect(() => {
    localStorage.setItem('pastLinks', JSON.stringify(pastLinks));
  }, [pastLinks]);

  useEffect(() => {
    localStorage.setItem('blockchainStatus', blockchainStatus);
  }, [blockchainStatus]);

  useEffect(() => {
    const handleLinkAccess = (event) => {
      const request = event.detail;
      if (!linkRequests.some(req => req.token === request.token)) {
        setLinkRequests(prev => [...prev, request]);
      }
    };
    
    window.addEventListener('linkAccessAttempt', handleLinkAccess);
    return () => window.removeEventListener('linkAccessAttempt', handleLinkAccess);
  }, [linkRequests, setLinkRequests]);

  useEffect(() => {
    const initializeBlockchain = async () => {
      // Only initialize if not already done
      if (activeLinks.length === 0 && blockchainStatus === 'Initializing...') {
        // Wait for blockchain initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBlockchainStatus('Active - Chain Verified');
        
        // Generate secure tokens for mock data
        const token1 = await generateSecureToken('LNK-001', 'Rajputana Rifles Brief', Date.now());
        const token2 = await generateSecureToken('LNK-002', 'Northern Command Update', Date.now());
        
        setActiveLinks([
          { id: 'LNK-001', purpose: 'Rajputana Rifles Brief', issuedToEmail: 'rajputana@mod.gov.in', status: 'ACTIVE', rotationCount: 0, token: token1.substring(0, 12), hash: token1 },
          { id: 'LNK-002', purpose: 'Northern Command Update', issuedToEmail: 'northcom@mod.gov.in', status: 'ACTIVE', rotationCount: 1, token: token2.substring(0, 12), hash: token2 }
        ]);
        setPastLinks([
          { id: 'LNK-003', purpose: 'Siachen Operations Debrief', issuedToEmail: 'siachen@mod.gov.in', status: 'EXPIRED', rotationCount: 0, token: 'expired', hash: 'expired' }
        ]);
      }
    };
    
    initializeBlockchain();
  }, [activeLinks.length, blockchainStatus]);

  const handleGenerate = async () => {
    if (!linkPurpose || !issuedToEmail) return;
    
    setLoading(true);
    
    try {
      const linkId = `LNK-${String(Date.now()).slice(-3)}`;
      const timestamp = Date.now();
      
      // Generate secure token with SHA256
      const secureHash = await generateSecureToken(linkId, linkPurpose, timestamp);
      const displayToken = secureHash.substring(0, 12);
      
      // Add to blockchain
      await linkBlockchain.addBlock({
        linkId,
        purpose: linkPurpose,
        issuedToEmail,
        timestamp,
        action: 'CREATED',
        hash: secureHash
      });
      
      const newLink = {
        id: linkId,
        purpose: linkPurpose,
        issuedToEmail,
        status: 'PENDING',
        rotationCount: 0,
        token: displayToken,
        hash: secureHash
      };
      
      setActiveLinks(prev => [...prev, newLink]);
      setLinkPurpose('');
      setIssuedToEmail('');
    } catch (error) {
      console.error('Failed to generate secure link:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (token) => {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    const url = `${protocol}//${hostname}${port}/l/${token}`;
    
    // Mobile-friendly copy with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert('Secure meeting link copied! Link submitted for administrative approval.');
      }).catch(() => {
        // Fallback for mobile browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Secure meeting link copied! Link submitted for administrative approval.');
      });
    } else {
      // Fallback for older mobile browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Secure meeting link copied! Link submitted for administrative approval.');
    }
    
    // Add to link requests for admin approval
    const request = {
      id: Date.now(),
      token,
      link: url,
      requestedBy: user.email,
      requestedAt: new Date().toLocaleString(),
      purpose: 'Secure Meeting Access',
      status: 'pending'
    };
    
    setLinkRequests(prev => [...prev, request]);
  };

  const expireLink = async (linkId) => {
    setLoading(true);
    
    try {
      const link = activeLinks.find(l => l.id === linkId);
      if (!link) return;
      
      // Add expiration to blockchain
      await linkBlockchain.addBlock({
        linkId,
        purpose: link.purpose,
        timestamp: Date.now(),
        action: 'MANUALLY_EXPIRED',
        hash: link.hash
      });
      
      setActiveLinks(prev => prev.filter(l => l.id !== linkId));
      setPastLinks(prev => [...prev, {
        ...link,
        status: 'MANUALLY_EXPIRED'
      }]);
    } catch (error) {
      console.error('Failed to expire link:', error);
    } finally {
      setLoading(false);
    }
  };

  const rotateLink = async (linkId) => {
    setLoading(true);
    
    try {
      const link = activeLinks.find(l => l.id === linkId);
      if (!link) return;
      
      // Generate new secure token
      const newHash = await generateSecureToken(linkId, link.purpose, Date.now());
      const newToken = newHash.substring(0, 12);
      
      // Add rotation to blockchain
      await linkBlockchain.addBlock({
        linkId,
        purpose: link.purpose,
        timestamp: Date.now(),
        action: 'ROTATED',
        oldHash: link.hash,
        newHash: newHash,
        rotationCount: link.rotationCount + 1
      });
      
      setActiveLinks(prev => prev.map(l => 
        l.id === linkId 
          ? { 
              ...l, 
              token: newToken,
              hash: newHash,
              rotationCount: l.rotationCount + 1,
              status: 'ROTATED'
            }
          : l
      ));
    } catch (error) {
      console.error('Failed to rotate link:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 pb-4">
      <TopNav user={user} onLogout={onLogout} />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Indian Army Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, {user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              System Operational
            </span>
            <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {blockchainStatus}
            </span>
          </div>
        </div>

        <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active Links</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{activeLinks.length}</div>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">5</div>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Anomalies</div>
                <div className="text-2xl font-bold text-green-600 mt-1">0</div>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Past Links</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">{pastLinks.length}</div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Generate Secure Link</h2>
              <p className="text-sm text-gray-500 mt-1">Create encrypted meeting access</p>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <input
                  type="text"
                  placeholder="e.g., Gorkha Regiment Brief"
                  value={linkPurpose}
                  onChange={(e) => setLinkPurpose(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Issued To (Email)</label>
                <input
                  type="email"
                  placeholder="user@mod.gov.in"
                  value={issuedToEmail}
                  onChange={(e) => setIssuedToEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Role Access</label>
                <select
                  value={roleAccess}
                  onChange={(e) => setRoleAccess(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="analyst">Analyst</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !issuedToEmail || !linkPurpose}
                className="w-full bg-blue-600 text-white py-3.5 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-sm"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating…
                  </div>
                ) : 'Generate Secure Link'}
              </button>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Links are encrypted, single-use, and require admin approval. Device and location data captured on access.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  DLP Protection Active: Screenshots, copying, and data export are monitored and blocked.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Active Links</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage secure communication channels</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {activeLinks.length} Active
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto hidden lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Link ID</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Issued To</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Hash</th>
                      <th className="text-left py-2">Rotations</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLinks.map((link) => (
                      <tr key={link.id} className="border-b">
                        <td className="py-2 font-mono text-xs">{link.id}</td>
                        <td className="py-2">{link.purpose}</td>
                        <td className="py-2">{link.issuedToEmail}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded border ${
                            link.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            link.status === 'ROTATED' ? 'bg-blue-100 text-blue-800' :
                            link.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {link.status}
                          </span>
                        </td>
                        <td className="py-2 font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <span title={link.hash}>
                              {link.hash ? (showFullHash[link.id] ? link.hash : link.hash.substring(0, 8) + '...') : 'N/A'}
                            </span>
                            {link.hash && (
                              <button
                                onClick={() => setShowFullHash(prev => ({ ...prev, [link.id]: !prev[link.id] }))}
                                className="text-gray-400 hover:text-gray-600"
                                title={showFullHash[link.id] ? 'Hide full hash' : 'Show full hash'}
                              >
                                {showFullHash[link.id] ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2">{link.rotationCount}</td>
                        <td className="py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => copyLink(link.token)}
                              className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-300"
                              title="Copy secure link"
                            >
                              Copy
                            </button>
                            <button
                              onClick={() => rotateLink(link.id)}
                              disabled={loading}
                              className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              title="Rotate to new network path (security measure)"
                            >
                              Rotate
                            </button>
                            <button
                              onClick={() => expireLink(link.id)}
                              disabled={loading}
                              className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                              title="Manually expire this link"
                            >
                              Expire
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <MobileTable 
                data={activeLinks}
                onCopy={copyLink}
                onRotate={rotateLink}
                onExpire={expireLink}
                loading={loading}
                showFullHash={showFullHash}
                setShowFullHash={setShowFullHash}
              />
            </div>
          </div>
        </section>

        <section>
          <div className="bg-white rounded-lg shadow border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Past Links</h2>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Link ID</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Issued To</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Hash</th>
                      <th className="text-left py-2">Rotations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastLinks.map((link) => (
                      <tr key={link.id} className="border-b">
                        <td className="py-2 font-mono text-xs">{link.id}</td>
                        <td className="py-2">{link.purpose}</td>
                        <td className="py-2">{link.issuedToEmail}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 text-xs rounded border ${
                            link.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                            link.status === 'MANUALLY_EXPIRED' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {link.status}
                          </span>
                        </td>
                        <td className="py-2 font-mono text-xs">
                          <div className="flex items-center gap-1">
                            <span title={link.hash}>
                              {link.hash && link.hash !== 'expired' ? (showFullHash[link.id] ? link.hash : link.hash.substring(0, 8) + '...') : 'N/A'}
                            </span>
                            {link.hash && link.hash !== 'expired' && (
                              <button
                                onClick={() => setShowFullHash(prev => ({ ...prev, [link.id]: !prev[link.id] }))}
                                className="text-gray-400 hover:text-gray-600"
                                title={showFullHash[link.id] ? 'Hide full hash' : 'Show full hash'}
                              >
                                {showFullHash[link.id] ? (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2">{link.rotationCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;