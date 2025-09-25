import React, { useState, useEffect } from 'react';
import TopNav from '../components/common/TopNav';
import MobileLogCard from '../components/mobile/MobileLogCard';

function Logs({ user, onLogout }) {
  const [logs, setLogs] = useState([]);

  const downloadCSV = () => {
    const headers = ['Event ID', 'Type', 'Actor', 'IP', 'Device', 'Location', 'Status'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        `EVT-${log.id}`,
        log.type,
        log.actorEmail || '',
        log.ip || '',
        `"${log.userAgent || ''}"`,
        `"${[log.locationCity, log.locationCountry].filter(Boolean).join(', ')}"`,
        log.type === 'ANOMALY' ? 'Anomaly' : 'OK'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-logs-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    // Mock log data
    setLogs([
      {
        id: 1,
        type: 'LINK_ACCESS',
        actorEmail: 'rajputana@mod.gov.in',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        locationCity: 'New Delhi',
        locationCountry: 'India'
      },
      {
        id: 2,
        type: 'LOGIN',
        actorEmail: 'admin@mod.gov.in',
        ip: '10.0.0.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)',
        locationCity: 'Mumbai',
        locationCountry: 'India'
      },
      {
        id: 3,
        type: 'ANOMALY',
        actorEmail: 'suspicious@external.com',
        ip: '203.0.113.1',
        userAgent: 'curl/7.68.0',
        locationCity: 'Lahore',
        locationCountry: 'Pakistan'
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onLogout={onLogout} />
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Logs & Reports</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Event Stream</h2>
              <p className="text-sm text-gray-500 mt-1">Security monitoring and audit trail</p>
            </div>
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Event</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Actor</th>
                    <th className="text-left py-2">IP</th>
                    <th className="text-left py-2">Device</th>
                    <th className="text-left py-2">Location</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-2 font-mono text-xs">EVT-{log.id}</td>
                      <td className="py-2">{log.type}</td>
                      <td className="py-2">{log.actorEmail || '—'}</td>
                      <td className="py-2">{log.ip || '—'}</td>
                      <td className="py-2 max-w-xs truncate">{log.userAgent || '—'}</td>
                      <td className="py-2">
                        {[log.locationCity, log.locationCountry].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 text-xs rounded border ${
                          log.type === 'ANOMALY' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {log.type === 'ANOMALY' ? 'Anomaly' : 'OK'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <MobileLogCard logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default Logs;