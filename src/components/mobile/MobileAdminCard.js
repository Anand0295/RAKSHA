import React from 'react';

function MobileAdminCard({ requests, onApprove, onDeny, loading }) {
  return (
    <div className="sm:hidden space-y-3">
      {requests.map((req) => (
        <div key={req.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="font-mono text-xs text-gray-500 mb-1">{req.token}</div>
              <div className="font-semibold text-sm text-gray-900">{req.purpose}</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ml-3 ${
              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              req.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {req.status.toUpperCase()}
            </span>
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Requested By:</span>
                <span className="text-gray-900 font-mono text-xs">{req.requestedBy}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Time:</span>
                <span className="text-gray-700 text-xs">{req.requestedAt}</span>
              </div>
            </div>
          </div>
          
          {req.status === 'pending' && (
            <div className="flex gap-2">
              <button
                onClick={() => onDeny(req.id)}
                disabled={loading}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Deny
              </button>
              <button
                onClick={() => onApprove(req.id, req.token)}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
            </div>
          )}
        </div>
      ))}
      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No link requests</p>
        </div>
      )}
    </div>
  );
}

export default MobileAdminCard;