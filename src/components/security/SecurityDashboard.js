import React, { useState, useEffect } from 'react';

function SecurityDashboard({ user }) {
  const [alerts, setAlerts] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);

  useEffect(() => {
    loadSecurityData();
    const interval = setInterval(loadSecurityData, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadSecurityData = async () => {
    if (window.anomalyDetector) {
      const activeAlerts = window.anomalyDetector.getActiveAlerts();
      setAlerts(activeAlerts);
      
      const profile = window.anomalyDetector.getUserRiskProfile(user.email);
      setRiskScore(profile?.riskScore || 0);
    }

    if (window.deviceFingerprinter) {
      const info = window.deviceFingerprinter.getDeviceInfo();
      setDeviceInfo(info);
    }

    if (window.blockchainLedger) {
      const integrity = window.blockchainLedger.verifyIntegrity();
      setBlockchainStatus(integrity);
    }
  };

  const resolveAlert = (alertId) => {
    if (window.anomalyDetector) {
      window.anomalyDetector.resolveAlert(alertId);
      loadSecurityData();
    }
  };

  const getRiskColor = (score) => {
    if (score >= 0.8) return 'text-red-600 bg-red-100';
    if (score >= 0.6) return 'text-orange-600 bg-orange-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Risk Score</h3>
          <div className={`text-2xl font-bold px-2 py-1 rounded ${getRiskColor(riskScore)}`}>
            {Math.round(riskScore * 100)}%
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Active Alerts</h3>
          <div className="text-2xl font-bold text-red-600">
            {alerts.length}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Blockchain Status</h3>
          <div className={`text-sm font-medium ${blockchainStatus?.valid ? 'text-green-600' : 'text-red-600'}`}>
            {blockchainStatus?.valid ? 'SECURE' : 'COMPROMISED'}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">🚨 Security Alerts</h3>
          </div>
          <div className="divide-y">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-sm font-medium">{alert.type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {alert.anomalies.join(', ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => resolveAlert(alert.id)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Information */}
      {deviceInfo && (
        <div className="bg-white rounded-lg shadow border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">🔒 Device Security</h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Platform:</span> {deviceInfo.browser.platform}
              </div>
              <div>
                <span className="font-medium">Screen:</span> {deviceInfo.screen.width}x{deviceInfo.screen.height}
              </div>
              <div>
                <span className="font-medium">Timezone:</span> {deviceInfo.timezone.timezone}
              </div>
              <div>
                <span className="font-medium">Memory:</span> {deviceInfo.memory}GB
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDashboard;