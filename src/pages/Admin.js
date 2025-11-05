/**
 * AdminPage – Flat, minimal, atomic UI for secure link approvals and DLP violations.
 * Stateless composed subcomponents, responsive, and highly professional.
 */
import React, { useState, useEffect } from "react";
import { HiOutlineShieldCheck, HiOutlineExclamationTriangle } from "react-icons/hi";
// --- Stateless Subcomponents ---
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-xl shadow-sm border border-gray-100 bg-white p-6 mb-4 ${className}`}>{children}</div>
  );
}
function TabButton({ label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-white text-blue-600 shadow border border-gray-200"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {label} {count !== undefined && <span className="ml-1 text-xs text-gray-400">({count})</span>}
    </button>
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
 * ApprovalQueueTable – Flat atomic table for approval requests.
 */
function ApprovalQueueTable({ requests, loading, onApprove, onDeny }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Token</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Requester</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Purpose</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Time</th>
          <th className="font-bold text-left py-2 px-4 text-gray-800">Status</th>
          <th className="font-bold text-right py-2 px-4 text-gray-800">Actions</th>
        </tr>
      </thead>
      <tbody>
        {(!requests || requests.length === 0) && (
          <tr>
            <td colSpan={6} className="py-8">
              <EmptyState icon={HiOutlineShieldCheck} message="No link requests." />
            </td>
          </tr>
        )}
        {requests &&
          requests.length > 0 &&
          requests.map((req, idx) => (
            <tr key={req.id} className={idx % 2 === 0 ? "" : ""}>
              <td className="py-2 px-4 font-mono text-xs">{req.token}</td>
              <td className="py-2 px-4">{req.requestedBy}</td>
              <td className="py-2 px-4">{req.purpose}</td>
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
                  {req.status.toUpperCase()}
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
 * DLPViolationsTable – Atomic table for DLP security violations.
 */
function DLPViolationsTable({ violations }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="font-bold text-left py-2 px-3 text-gray-800">Type</th>
          <th className="font-bold text-left py-2 px-3 text-gray-800">Timestamp</th>
          <th className="font-bold text-left py-2 px-3 text-gray-800">User Agent</th>
          <th className="font-bold text-left py-2 px-3 text-gray-800">URL</th>
        </tr>
      </thead>
      <tbody>
        {(!violations || violations.length === 0) && (
          <tr>
            <td colSpan={4} className="py-8">
              <EmptyState icon={HiOutlineExclamationTriangle} message="No security violations detected." />
            </td>
          </tr>
        )}
        {violations &&
          violations.length > 0 &&
          violations.slice(-10).map((violation, index) => (
            <tr key={index} className={index % 2 === 0 ? "" : ""}>
              <td className="py-2 px-3">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                  {violation.type}
                </span>
              </td>
              <td className="py-2 px-3 text-xs">{new Date(violation.timestamp).toLocaleString()}</td>
              <td className="py-2 px-3 text-xs max-w-xs truncate">{violation.userAgent}</td>
              <td className="py-2 px-3 text-xs">{violation.url}</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
}
// --- Main Admin Page ---
function Admin({ user }) {
  const [linkRequests, setLinkRequests] = useState(null); // null means loading
  const [approvedLinks, setApprovedLinks] = useState(new Set());
  const [dlpViolations, setDlpViolations] = useState(null);
  const [activeTab, setActiveTab] = useState("approvals");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setLinkRequests([
        {
          id: 1,
          token: "tkn123456",
          requestedBy: "operator@mod.gov.in",
          purpose: "Kashmir Sector Emergency Brief",
          requestedAt: "2025-11-03 10:31",
          status: "pending",
        },
        {
          id: 2,
          token: "tkn654321",
          requestedBy: "analyst@mod.gov.in",
          purpose: "Border Intelligence Report",
          requestedAt: "2025-11-03 12:14",
          status: "pending",
        },
      ]);
      setDlpViolations([
        {
          type: "Screenshot Blocked",
          timestamp: Date.now() - 20000,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          url: "https://dashboard.example.com",
        },
        {
          type: "Copy Detection",
          timestamp: Date.now() - 120000,
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
          url: "https://dashboard.example.com",
        },
      ]);
    }, 800);
  }, []);
  const approveRequest = (id, token) => {
    setLoading(true);
    setTimeout(() => {
      setLinkRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: "approved" } : req))
      );
      setApprovedLinks(prev => new Set([...prev, token]));
      setLoading(false);
    }, 600);
  };
  const denyRequest = id => {
    setLoading(true);
    setTimeout(() => {
      setLinkRequests(prev =>
        prev.map(req => (req.id === id ? { ...req, status: "denied" } : req))
      );
      setLoading(false);
    }, 600);
  };
  const revokeLink = token => {
    setApprovedLinks(prev => {
      const newSet = new Set(prev);
      newSet.delete(token);
      return newSet;
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 flex gap-2 items-center mb-4">
          <HiOutlineShieldCheck className="h-7 w-7 text-blue-600" />
          RAKSHA Admin Control
        </h1>
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-2 rounded-xl mb-5">
          <TabButton
            label="Approvals"
            count={linkRequests ? linkRequests.length : 0}
            active={activeTab === "approvals"}
            onClick={() => setActiveTab("approvals")}
          />
          <TabButton
            label="DLP Violations"
            count={dlpViolations ? dlpViolations.length : 0}
            active={activeTab === "violations"}
            onClick={() => setActiveTab("violations")}
          />
        </div>
        {/* Approval Queue */}
        {activeTab === "approvals" && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Link Approval Queue</h2>
            <p className="text-sm text-gray-500 mb-4">Review and approve secure link requests.</p>
            {!linkRequests && <Skeleton rows={5} />}
            {linkRequests && (
              <ApprovalQueueTable
                requests={linkRequests}
                loading={loading}
                onApprove={approveRequest}
                onDeny={denyRequest}
              />
            )}
            <div className="mt-6">
              <h3 className="text-md font-semibold text-gray-900 mb-1">Approved Links</h3>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {approvedLinks.size === 0 && (
                  <EmptyState icon={HiOutlineShieldCheck} message="No approved links." />
                )}
                {Array.from(approvedLinks).map(token => (
                  <div
                    key={token}
                    className="flex justify-between items-center p-2 border rounded bg-gray-50"
                  >
                    <span className="font-mono text-xs">{token}</span>
                    <button
                      onClick={() => revokeLink(token)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
        {/* DLP Violations */}
        {activeTab === "violations" && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">DLP Security Violations</h2>
            <p className="text-sm text-gray-500 mb-4">
              Data Loss Prevention monitoring and alerts
            </p>
            {!dlpViolations && <Skeleton rows={5} />}
            {dlpViolations && <DLPViolationsTable violations={dlpViolations} />}
          </Card>
        )}
      </div>
    </div>
  );
}
export default Admin;
