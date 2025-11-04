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
} from "react-icons/hi2";

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
        {requests &&
          requests.length > 0 &&
          requests.map((req, idx) => (
            <tr key={req.id || idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="py-2 px-4 font-mono text-xs">{req.token}</td>
              <td className="py-2 px-4">{req.ipAddress || "N/A"}</td>
              <td className="py-2 px-4 flex items-center gap-2">
                <HiOutlineDeviceMobile className="h-4 w-4 text-gray-400" />
                {getDeviceType && getDeviceType(req.deviceInfo)}
              </td>
              <td className="py-2 px-4">
                <HiOutlineGlobeAlt className="h-4 w-4 text-gray-400 inline mr-1" />
                {getBrowser && getBrowser(req.deviceInfo?.userAgent)}
              </td>
              <td className="py-2 px-4">{req.requestedAt}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === "pending"
                      ? "bg-yellow-50 text-yellow-800"
                      : req.status === "approved"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {req.status?.toUpperCase()}
                </span>
              </td>
              <td className="py-2 px-4 text-right">
                {req.status === "pending" && (
                  <div className="flex gap-2 justify-end">
                    <button
                      className="text-red-600 hover:underline text-xs font-medium"
                      onClick={() => onDeny(req.id)}
                      disabled={loading}
                    >
                      Deny
                    </button>
                    <button
                      className="text-green-600 hover:underline text-xs font-medium"
                      onClick={() => onApprove(req.id, req.token)}
                      disabled={loading}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}

/**
 * ApprovedLinksList – Flat atomic container for approved links.
 */
function ApprovedLinksList({ links, onRevoke }) {
  return (
    <div className="space-y-2 max-h-36 overflow-y-auto">
      {(!links || links.length === 0) && (
        <EmptyState icon={HiOutlineCheckBadge} message="No approved links." />
      )}
      {links &&
        links.length > 0 &&
        links.map(token => (
          <div key={token} className="flex justify-between items-center p-2 border rounded bg-gray-50">
            <span className="font-mono text-xs">{token}</span>
            <button
              onClick={() => onRevoke(token)}
              className="text-red-600 hover:text-red-800 text-xs"
            >
              Revoke
            </button>
          </div>
        ))}
    </div>
  );
}

// --- Main Links Page ---

function Links({ user }) {
  const [linkRequests, setLinkRequests] = useState(null);
  const [approvedLinks, setApprovedLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setLinkRequests([
        {
          id: 1,
          token: "tkn999111",
          ipAddress: "172.16.1.15",
          deviceInfo: {
            userAgent: "Mozilla/5.0 (Windows NT 10.0)",
            platform: "Windows",
          },
          requestedAt: "2025-11-04 13:14",
          status: "pending",
        },
        {
          id: 2,
          token: "tkn888222",
          ipAddress: "10.10.10.10",
          deviceInfo: {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
            platform: "Mac",
          },
          requestedAt: "2025-11-04 14:22",
          status: "approved",
        },
      ]);
      setApprovedLinks(["tkn888222"]);
    }, 700);
  }, []);

  // Device types
  const getDeviceType = deviceInfo => {
    if (!deviceInfo) return "Unknown";
    const ua = deviceInfo.userAgent;
    const platform = deviceInfo.platform;
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android";
    if (/Windows NT 10/.test(ua)) return "Windows 10";
    if (/Windows NT/.test(ua)) return "Windows PC";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Linux/.test(ua)) return "Linux";
    if (platform) return platform;
    return "Unknown";
  };
  const getBrowser = userAgent => {
    if (!userAgent) return "Unknown";
    if (/Edg/.test(userAgent)) return "Edge";
    if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) return "Chrome";
    if (/Firefox/.test(userAgent)) return "Firefox";
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return "Safari";
    if (/Opera/.test(userAgent)) return "Opera";
    return "Unknown";
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
