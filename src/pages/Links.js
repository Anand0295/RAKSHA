/**
 * LinksPage – Minimal atomic UI for monitoring link access and approvals.
 * Stateless, responsive, professional; follows Silicon Valley UX standards.
 */
import React, { useState, useEffect } from "react";
import {
  HiOutlineLink,
  HiOutlineDeviceMobile,
  HiOutlineGlobeAlt,
  HiOutlineCheckBadge,
} from "react-icons/hi";

// --- Stateless UI Subcomponents ---

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 bg-white p-6 mb-4 ${className}`}>{children}</div>
  );
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

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10">
      <Icon className="w-12 h-12 text-gray-300" />
      <p className="text-base text-gray-500 mb-2">{message}</p>
    </div>
  );
}

/**
 * ApprovalRequestsTable – Flat, borderless, atomic table for access requests.
 */
function ApprovalRequestsTable({ requests, loading, onApprove, onDeny, getDeviceType, getBrowser }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Token</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">IP Address</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Device</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Browser</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Time</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Status</th>
          <th className="font-bold text-right py-2 px-4 text-gray-800">Actions</th>
        </tr>
      </thead>
      <tbody>
        {(!requests || requests.length === 0) && (
          <tr>
            <td colSpan={7} className="py-8">
              <EmptyState icon={HiOutlineLink} message="No link access requests found." />
            </td>
          </tr>
        )}
        {requests && requests.length > 0 && (
          requests.map((req) => (
            <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4 text-gray-700 font-mono text-xs">
                {req.token.slice(0, 8)}...{req.token.slice(-4)}
              </td>
              <td className="py-3 px-4 text-gray-700">{req.ipAddress}</td>
              <td className="py-3 px-4 text-gray-700">
                <span className="flex items-center gap-1">
                  <HiOutlineDeviceMobile className="w-4 h-4 text-gray-400" />
                  {getDeviceType(req.userAgent)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-700">
                <span className="flex items-center gap-1">
                  <HiOutlineGlobeAlt className="w-4 h-4 text-gray-400" />
                  {getBrowser(req.userAgent)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600 text-xs">{new Date(req.timestamp).toLocaleString()}</td>
              <td className="py-3 px-4">
                {req.status === "approved" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                    <HiOutlineCheckBadge className="w-4 h-4" />
                    Approved
                  </span>
                )}
                {req.status === "denied" && (
                  <span className="px-2 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium">
                    Denied
                  </span>
                )}
                {req.status === "pending" && (
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
                    Pending
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                {req.status === "pending" && (
                  <>
                    <button
                      disabled={loading}
                      onClick={() => onApprove(req.id, req.token)}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => onDeny(req.id)}
                      className="px-3 py-1 text-xs font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

/**
 * ApprovedLinksList – Atomic list of approved link tokens with revoke capability.
 */
function ApprovedLinksList({ links, onRevoke }) {
  return (
    <div>
      {(!links || links.length === 0) && (
        <EmptyState icon={HiOutlineCheckBadge} message="No approved links yet." />
      )}
      {links && links.length > 0 && (
        <ul className="space-y-2">
          {links.map((token, idx) => (
            <li key={idx} className="flex items-center justify-between py-2 px-3 border border-gray-200 rounded-lg bg-gray-50">
              <span className="text-sm text-gray-700 font-mono">
                {token.slice(0, 8)}...{token.slice(-4)}
              </span>
              <button
                onClick={() => onRevoke(token)}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * LinksPage – Main component.
 * Purely atomic, minimal logic, stateful for dynamic device requests.
 */
function Links() {
  // State
  const [linkRequests, setLinkRequests] = useState(null);
  const [approvedLinks, setApprovedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load mock data on mount (in production, replace with real API calls)
  useEffect(() => {
    setTimeout(() => {
      setLinkRequests([
        {
          id: 1,
          token: "a1b2c3d4e5f6g7h8i9j0",
          ipAddress: "192.168.1.10",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
          timestamp: Date.now() - 120000,
          status: "pending",
        },
        {
          id: 2,
          token: "z9y8x7w6v5u4t3s2r1q0",
          ipAddress: "192.168.1.11",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          timestamp: Date.now() - 300000,
          status: "approved",
        },
        {
          id: 3,
          token: "m1n2o3p4q5r6s7t8u9v0",
          ipAddress: "192.168.1.12",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          timestamp: Date.now() - 600000,
          status: "denied",
        },
      ]);
    }, 800);
  }, []);

  // Minimal device / browser helpers (atomic)
  const getDeviceType = (ua) => {
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) return "Mobile";
    if (/Tablet|iPad/i.test(ua)) return "Tablet";
    return "Desktop";
  };
  const getBrowser = (ua) => {
    if (/Chrome/i.test(ua)) return "Chrome";
    if (/Firefox/i.test(ua)) return "Firefox";
    if (/Safari/i.test(ua)) return "Safari";
    if (/Edge/i.test(ua)) return "Edge";
    return "Other";
  };

  // Actions
  const approveRequest = (id, token) => {
    setLoading(true);
    setTimeout(() => {
      setLinkRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status: "approved" } : req
        )
      );
      setApprovedLinks(prev => [...prev, token]);
      setLoading(false);
    }, 600);
  };

  const denyRequest = id => {
    setLoading(true);
    setTimeout(() => {
      setLinkRequests(prev =>
        prev.map(req =>
          req.id === id ? { ...req, status: "denied" } : req
        )
      );
      setLoading(false);
    }, 600);
  };

  const revokeLink = token => {
    setApprovedLinks(prev => prev.filter(t => t !== token));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 flex gap-2 items-center mb-2">
          <HiOutlineLink className="h-7 w-7 text-blue-600" />
          Link Management
        </h1>
        <div className="mb-6 text-gray-500">Monitor device access and security events.</div>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Link Access Requests</h2>
          <p className="text-sm text-gray-500 mb-4">Track and manage device-specific events and approvals.</p>
          {!linkRequests && <Skeleton rows={5} />}
          {linkRequests && (
            <ApprovalRequestsTable
              requests={linkRequests}
              loading={loading}
              getDeviceType={getDeviceType}
              getBrowser={getBrowser}
              onApprove={approveRequest}
              onDeny={denyRequest}
            />
          )}
        </Card>

        <Card>
          <h3 className="text-md font-semibold text-gray-900 mb-2">Approved Links</h3>
          <ApprovedLinksList links={approvedLinks} onRevoke={revokeLink} />
        </Card>
      </div>
    </div>
  );
}

export default Links;
