import React from 'react';

function MobileLogCard({ logs }) {
  const getStatusColor = (type) => {
    return type === 'ANOMALY' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800';
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'LINK_ACCESS': return '🔗';
      case 'LOGIN': return '🔐';
      case 'ANOMALY': return '⚠️';
      default: return '📋';
    }
  };

  return (
    <div className="sm:hidden space-y-3">
      {logs.map((log) => (
        <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getEventIcon(log.type)}</span>
              <div>
                <div className="font-mono text-xs text-gray-500">EVT-{log.id}</div>
                <div className="font-semibold text-sm text-gray-900">{log.type}</div>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(log.type)}`}>
              {log.type === 'ANOMALY' ? 'Anomaly' : 'OK'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 font-medium block mb-1">Actor:</span>
                  <span className="text-gray-900 font-mono text-xs break-all">
                    {log.actorEmail || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block mb-1">IP Address:</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {log.ip || '—'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium block mb-1">Device:</span>
                  <span className="text-gray-700 text-xs break-all">
                    {log.userAgent || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block mb-1">Location:</span>
                  <span className="text-gray-700 text-xs">
                    {[log.locationCity, log.locationCountry].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No security events</p>
        </div>
      )}
    </div>
  );
}

export default MobileLogCard;