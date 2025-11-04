/**
 * DashboardPage – Atomic, flat, minimal React dashboard for military secure links.
 * Fully presentational, responsive, and composed from stateless subcomponents.
 */
import React, { useState, useEffect } from "react";
import { HiOutlineShieldCheck, HiOutlineFingerPrint, HiOutlineLink, HiOutlineExclamationCircle, HiOutlinePlus } from "react-icons/hi2";

// --- Stateless UI Subcomponents ---

function Card({ children, className = "" }) {
  return <div className={`rounded-xl shadow-sm border border-gray-100 bg-white p-6 mb-4 ${className}`}>{children}</div>;
}

function Skeleton({ rows = 1 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
      ))}
    </div>
  );
}

function Toast({ message, show, onClose }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2200);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed top-7 right-7 bg-gray-900/90 text-white shadow rounded-xl px-5 py-3 text-sm z-40 animate-fadein-slim">
      {message}
    </div>
  );
}

function EmptyState({ icon: Icon, message, actionLabel, action }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <Icon className="w-12 h-12 text-gray-300" />
      <p className="text-base text-gray-500 mb-2">{message}</p>
      {action && (
        <button className="text-blue-600 hover:underline text-sm font-semibold" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * SecureLinksTable – List active or expired links in atomic, borderless table format.
 */
function SecureLinksTable({
  links,
  type,
  onCopy,
  onRotate,
  onExpire,
  loading,
  showFullHash,
  setShowFullHash,
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Link ID</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Purpose</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Issued To</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Status</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Hash</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Rotation</th>
          {type === "active" && (
            <th className="font-bold text-right py-2 px-4 text-gray-800">Actions</th>
          )}
        </tr>
      </thead>
      {!links && (
        <tbody>
          {[...Array(5)].map((_, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td colSpan={type === "active" ? 7 : 6} className="py-3 px-4">
                <Skeleton rows={1} />
              </td>
            </tr>
          ))}
        </tbody>
      )}
      {links && links.length === 0 && (
        <tbody>
          <tr>
            <td colSpan={type === "active" ? 7 : 6} className="py-8">
              <EmptyState
                icon={HiOutlineLink}
                message={type === "active" ? "No active secure links." : "No past links yet."}
                actionLabel={type === "active" ? "Create Link" : undefined}
                action={type === "active" ? () => window.scrollTo(0, 0) : undefined}
              />
            </td>
          </tr>
        </tbody>
      )}
      {links && links.length > 0 && (
        <tbody>
          {links.map((link, idx) => (
            <tr key={link.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="py-3 px-4 font-mono text-xs text-gray-600">{link.id}</td>
              <td className="py-3 px-4">{link.purpose}</td>
              <td className="py-3 px-4">{link.issuedToEmail}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    link.status === "ACTIVE"
                      ? "bg-green-50 text-green-600"
                      : link.status === "ROTATED"
                      ? "bg-blue-50 text-blue-600"
                      : link.status === "PENDING"
                      ? "bg-yellow-50 text-yellow-700"
                      : link.status === "EXPIRED"
                      ? "bg-red-50 text-red-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {link.status}
                </span>
              </td>
              <td className="py-3 px-4 font-mono text-xs">
                <span title={link.hash}>
                  {link.hash
                    ? showFullHash[link.id]
                      ? link.hash
                      : link.hash.substring(0, 8) + "..."
                    : "N/A"}
                </span>
                {link.hash && (
                  <button
                    className="text-gray-400 hover:text-blue-600 ml-2"
                    title={showFullHash[link.id] ? "Hide full hash" : "Show full hash"}
                    onClick={() => setShowFullHash(prev => ({ ...prev, [link.id]: !prev[link.id] }))}
                  >
                    {showFullHash[link.id] ? "Hide" : "Show"}
                  </button>
                )}
              </td>
              <td className="py-3 px-4">{link.rotationCount}</td>
              {type === "active" && (
                <td className="py-3 px-4 text-right">
                  <button
                    className="text-blue-600 hover:underline text-xs font-medium mr-2"
                    onClick={() => onCopy(link.token)}
                    disabled={loading}
                  >
                    Copy
                  </button>
                  <button
                    className="text-gray-600 hover:underline text-xs font-medium mr-2"
                    onClick={() => onRotate(link.id)}
                    disabled={loading}
                  >
                    Rotate
                  </button>
                  <button
                    className="text-red-600 hover:underline text-xs font-medium"
                    onClick={() => onExpire(link.id)}
                    disabled={loading}
                  >
                    Expire
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      )}
    </table>
  );
}

// --- Main Dashboard Page ---

function Dashboard({ user }) {
  // States
  const [linkPurpose, setLinkPurpose] = useState('');
  const [issuedToEmail, setIssuedToEmail] = useState('');
  const [roleAccess, setRoleAccess] = useState('operator');
  const [loading, setLoading] = useState(false);
  const [activeLinks, setActiveLinks] = useState(null); // null at init means loading
  const [pastLinks, setPastLinks] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState("Initializing...");
  const [showFullHash, setShowFullHash] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  // Simulate data fetch for links
  useEffect(() => {
    setTimeout(() => {
      setActiveLinks([
        {
          id: 'LNK-001',
          purpose: 'Rajputana Rifles Brief',
          issuedToEmail: 'rajputana@mod.gov.in',
          status: 'ACTIVE',
          rotationCount: 0,
          token: 'abcdef123456',
          hash: 'abcdef1234567890abcdef1234567890',
        },
        {
          id: 'LNK-002',
          purpose: 'Northern Command Update',
          issuedToEmail: 'northcom@mod.gov.in',
          status: 'ACTIVE',
          rotationCount: 1,
          token: 'bcdefa654321',
          hash: 'bcdefa6543210987bcdefa6543210987',
        }
      ]);
      setPastLinks([
        {
          id: 'LNK-003',
          purpose: 'Siachen Operations Debrief',
          issuedToEmail: 'siachen@mod.gov.in',
          status: 'EXPIRED',
          rotationCount: 0,
          token: 'expired',
          hash: 'expired',
        }
      ]);
      setBlockchainStatus('Active - Chain Verified');
    }, 1100);
  }, []);

  // Generate new link (simulated)
  const handleGenerate = async () => {
    if (!linkPurpose || !issuedToEmail) return;
    setLoading(true);
    setTimeout(() => {
      const linkId = `LNK-${String(Date.now()).slice(-3)}`;
      const newLink = {
        id: linkId,
        purpose: linkPurpose,
        issuedToEmail,
        status: 'PENDING',
        rotationCount: 0,
        token: 'zzzzzzzzzzzz',
        hash: 'zzzzzzzzzzzz1111zzzzzzzzzzzz2222',
      };
      setActiveLinks(prev => prev ? [...prev, newLink] : [newLink]);
      setToastMsg('Secure link created and submitted for approval');
      setLinkPurpose('');
      setIssuedToEmail('');
      setLoading(false);
    }, 1000);
  };

  // Link actions
  const copyLink = (token) => {
    setToastMsg('Secure meeting link copied!');
  };

  const expireLink = (linkId) => {
    setLoading(true);
    setTimeout(() => {
      if (!activeLinks) return;
      const link = activeLinks.find(l => l.id === linkId);
      setActiveLinks(prev => prev.filter(l => l.id !== linkId));
      setPastLinks(prev => prev ? [...prev, { ...link, status: 'EXPIRED' }] : [{ ...link, status: 'EXPIRED' }]);
      setToastMsg('Link expired');
      setLoading(false);
    }, 600);
  };

  const rotateLink = (linkId) => {
    setLoading(true);
    setTimeout(() => {
      setActiveLinks(prev =>
        prev
          ? prev.map(l => l.id === linkId ? { ...l, rotationCount: l.rotationCount + 1, status: 'ROTATED' } : l)
          : []
      );
      setToastMsg('Link rotated');
      setLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 flex gap-2 items-center mb-2">
        <HiOutlineShieldCheck className="h-7 w-7 text-blue-600" />
        Indian Army Dashboard
      </h1>
      <div className="mb-6 text-gray-500">
        Welcome back, <span className="font-medium text-gray-700">{user?.email || "user"}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <HiOutlineFingerPrint className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">System Operational</span>
          </div>
          <div className="text-sm text-gray-700">{blockchainStatus}</div>
        </Card>
        <Card>
          <div className="flex flex-col gap-3">
            <span className="text-sm text-gray-500">Active Links</span>
            <span className="text-2xl font-bold text-gray-900">{activeLinks ? activeLinks.length : <Skeleton />}</span>
          </div>
        </Card>
      </div>
      {/* Generate Secure Link */}
      <Card>
        <div className="flex items-center mb-5 gap-2">
          <HiOutlinePlus className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">Generate Secure Link</span>
        </div>
        <div className="grid gap-4 mb-2 md:grid-cols-3">
          <input
            type="text"
            placeholder="Purpose (e.g., Gorkha Regiment Brief)"
            value={linkPurpose}
            onChange={e => setLinkPurpose(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <input
            type="email"
            placeholder="Issued To (user@mod.gov.in)"
            value={issuedToEmail}
            onChange={e => setIssuedToEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <select
            value={roleAccess}
            onChange={e => setRoleAccess(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
          >
            <option value="admin">Admin</option>
            <option value="analyst">Analyst</option>
            <option value="operator">Operator</option>
          </select>
        </div>
        <button
          onClick={handleGenerate}
          className="mt-2 bg-blue-600 text-white rounded-full px-6 py-2 font-semibold shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
          disabled={loading || !linkPurpose || !issuedToEmail}
        >
          {loading ? <Skeleton /> : "Create Link"}
        </button>
        <div className="mt-4 text-xs text-gray-500">
          Links are encrypted, single-use, and require admin approval. Device/location data are tracked.
        </div>
      </Card>
      {/* Active Links */}
      <Card>
        <div className="flex items-center mb-4 gap-2">
          <HiOutlineLink className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-semibold text-gray-900">Active Links</span>
          <span className="ml-3 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
            {activeLinks ? activeLinks.length : 0} Active
          </span>
        </div>
        <div className="overflow-x-auto">
          <SecureLinksTable
            links={activeLinks}
            type="active"
            onCopy={copyLink}
            onRotate={rotateLink}
            onExpire={expireLink}
            loading={loading}
            showFullHash={showFullHash}
            setShowFullHash={setShowFullHash}
          />
        </div>
      </Card>
      {/* Past Links */}
      <Card>
        <div className="flex items-center mb-4 gap-2">
          <HiOutlineExclamationCircle className="h-5 w-5 text-gray-400" />
          <span className="text-lg font-semibold text-gray-900">Past Links</span>
          <span className="ml-3 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            {pastLinks ? pastLinks.length : 0}
          </span>
        </div>
        <div className="overflow-x-auto">
          <SecureLinksTable
            links={pastLinks}
            type="past"
            showFullHash={showFullHash}
            setShowFullHash={setShowFullHash}
          />
        </div>
      </Card>
      <Toast message={toastMsg} show={!!toastMsg} onClose={() => setToastMsg('')} />
    </div>
  );
}

export default Dashboard;
