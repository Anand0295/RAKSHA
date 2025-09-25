import React from 'react';

function MobileTable({ data, onCopy, onRotate, onExpire, loading, showFullHash, setShowFullHash }) {
  return (
    <div className="lg:hidden space-y-3">
      {data.map((link) => (
        <div key={link.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:bg-white hover:shadow-sm transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="font-mono text-xs text-gray-500 mb-1">{link.id}</div>
              <div className="font-semibold text-sm text-gray-900 leading-tight">{link.purpose}</div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ml-3 ${
              link.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
              link.status === 'ROTATED' ? 'bg-blue-100 text-blue-800' :
              link.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {link.status}
            </span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Issued To:</span>
                <span className="text-gray-900 font-mono text-xs">{link.issuedToEmail}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Hash:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {link.hash ? (showFullHash[link.id] ? link.hash : link.hash.substring(0, 8) + '...') : 'N/A'}
                  </span>
                  {link.hash && (
                    <button
                      onClick={() => setShowFullHash(prev => ({ ...prev, [link.id]: !prev[link.id] }))}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showFullHash[link.id] ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        )}
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Rotations:</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{link.rotationCount}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onCopy(link.token)}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors active:bg-gray-300 touch-manipulation"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={() => onRotate(link.id)}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-blue-800 touch-manipulation"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rotate
            </button>
            <button
              onClick={() => onExpire(link.id)}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:bg-red-800 touch-manipulation"
            >
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Expire
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MobileTable;