/**
 * LogsPage – Modern, flat-UI logs and audit screen with minimal atomic design.
 * Pure presentational structure with testable props subcomponents.
 */
import React, { useState, useEffect } from "react";
import { HiOutlineDocumentSearch, HiCheckBadge, HiOutlineArrowDownTray } from "react-icons/hi2"; // Heroicons

// --- Stateless Atomic UI Subcomponents ---

/**
 * TableSkeleton – Shows a loading skeleton for table rows.
 */
function TableSkeleton({ rows = 6, cols = 7 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, ridx) => (
        <tr key={ridx}>
          {Array.from({ length: cols }).map((_, cidx) => (
            <td key={cidx} className="py-3 px-4">
              <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * Toast – Shows feedback after CSV download or other actions (dismisses automatically).
 */
function Toast({ message, show, onClose }) {
  React.useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 2200);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed top-6 right-6 bg-gray-900/90 text-white shadow rounded-xl px-5 py-3 text-sm z-40 animate-fadein-slim">
      {message}
    </div>
  );
}

/**
 * EmptyState – Shows empty icon, message, and a text-action.
 */
function EmptyState({ icon: Icon, message, actionLabel, action }) {
  return (
    <tr>
      <td colSpan={7} className="py-14 px-4 text-center">
        <div className="flex flex-col items-center gap-2">
          <Icon className="w-10 h-10 text-gray-300 mb-1" />
          <p className="text-sm text-gray-500">{message}</p>
          {action && (
            <button
              className="text-blue-600 hover:underline text-sm font-semibold mt-2"
              onClick={action}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * LogsTableRow – Stateless presentational row for logs.
 */
function LogsTableRow({ log, idx }) {
  const status =
    log.type === "ANOMALY"
      ? "bg-red-50 text-red-700"
      : "bg-gray-100 text-gray-700";
  return (
    <tr className={idx % 2 === 0 ? "bg-gray-50" : ""}>
      <td className="py-3 px-4 font-mono text-xs text-gray-600">
        EVT-{log.id}
      </td>
      <td className="py-3 px-4 capitalize">{log.type.replace("_", " ").toLowerCase()}</td>
      <td className="py-3 px-4">{log.actorEmail || "—"}</td>
      <td className="py-3 px-4">{log.ip || "—"}</td>
      <td className="py-3 px-4 font-mono text-xs">{log.userAgent || "—"}</td>
      <td className="py-3 px-4">{[log.locationCity, log.locationCountry].filter(Boolean).join(", ") || "—"}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status}`}>
          {log.type === "ANOMALY" ? "Anomaly" : "OK"}
        </span>
      </td>
    </tr>
  );
}

// --- Main Page Component ---

function Logs({ user }) {
  const [logs, setLogs] = useState(null); // null = loading, [] = loaded empty
  const [toast, setToast] = useState(false);

  // Simulate fetch on mount
  useEffect(() => {
    setTimeout(() => {
      setLogs([
        {
          id: 1,
          type: "LINK_ACCESS",
          actorEmail: "rajputana@mod.gov.in",
          ip: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          locationCity: "New Delhi",
          locationCountry: "India",
        },
        {
          id: 2,
          type: "LOGIN",
          actorEmail: "admin@mod.gov.in",
          ip: "10.0.0.50",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X)",
          locationCity: "Mumbai",
          locationCountry: "India",
        },
        {
          id: 3,
          type: "ANOMALY",
          actorEmail: "suspicious@external.com",
          ip: "203.0.113.1",
          userAgent: "curl/7.68.0",
          locationCity: "Lahore",
          locationCountry: "Pakistan",
        },
      ]);
    }, 900);
  }, []);

  // CSV Export
  const downloadCSV = () => {
    if (!logs || logs.length === 0) return;
    const headers = [
      "Event ID",
      "Type",
      "Actor",
      "IP",
      "Device",
      "Location",
      "Status",
    ];
    const csvContent = [
      headers.join(","),
      ...logs.map((log) =>
        [
          `EVT-${log.id}`,
          log.type,
          log.actorEmail || "",
          log.ip || "",
          `"${log.userAgent || ""}"`,
          `"${[log.locationCity, log.locationCountry]
            .filter(Boolean)
            .join(", ")}"`,
          log.type === "ANOMALY" ? "Anomaly" : "OK",
        ].join(",")
      ),
    ].join("\n");
    const blob = new window.Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-logs-report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    setToast(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold mb-1 text-gray-900 flex items-center gap-2">
        <HiOutlineDocumentSearch className="h-6 w-6 text-blue-600" />
        Logs & Reports
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        Security monitoring and audit trail for your organization.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-0 md:px-2 py-1.5 md:py-3">
        <div className="flex flex-wrap items-center justify-between px-4 py-3">
          <span className="text-lg text-gray-900 font-semibold">Event Stream</span>
          <button
            type="button"
            className="flex items-center gap-1 text-green-800 hover:underline text-sm font-medium"
            onClick={downloadCSV}
            aria-label="Export logs to CSV"
          >
            <HiOutlineArrowDownTray className="h-4 w-4" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left font-bold p-3 text-gray-800">Event</th>
                <th className="text-left font-bold p-3 text-gray-800">Type</th>
                <th className="text-left font-bold p-3 text-gray-800">Actor</th>
                <th className="text-left font-bold p-3 text-gray-800">IP</th>
                <th className="text-left font-bold p-3 text-gray-800">Device</th>
                <th className="text-left font-bold p-3 text-gray-800">Location</th>
                <th className="text-left font-bold p-3 text-gray-800">Status</th>
              </tr>
            </thead>
            {!logs && <TableSkeleton rows={6} cols={7} />}
            {logs && logs.length === 0 && (
              <tbody>
                <EmptyState
                  icon={HiCheckBadge}
                  message="No security events have been recorded yet."
                  actionLabel="View Policy"
                  action={() => window.open("https://your-security-policy-url", "_blank")}
                />
              </tbody>
            )}
            {logs && logs.length > 0 && (
              <tbody>
                {logs.map((log, idx) => (
                  <LogsTableRow key={log.id} log={log} idx={idx} />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
      <Toast
        message="CSV exported"
        show={toast}
        onClose={() => setToast(false)}
      />
    </div>
  );
}

export default Logs;
