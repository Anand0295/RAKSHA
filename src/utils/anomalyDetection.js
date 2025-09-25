// AI-Powered Behavioral Analytics and Anomaly Detection
class AnomalyDetector {
  constructor() {
    this.userProfiles = new Map();
    this.anomalyThresholds = {
      loginFrequency: 0.3,
      sessionDuration: 0.4,
      actionPattern: 0.5,
      locationChange: 0.6,
      deviceChange: 0.8
    };
    this.loadProfiles();
  }

  loadProfiles() {
    const saved = localStorage.getItem('raksha_user_profiles');
    if (saved) {
      const profiles = JSON.parse(saved);
      this.userProfiles = new Map(Object.entries(profiles));
    }
  }

  saveProfiles() {
    const profiles = Object.fromEntries(this.userProfiles);
    localStorage.setItem('raksha_user_profiles', JSON.stringify(profiles));
  }

  initializeUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        loginTimes: [],
        sessionDurations: [],
        actionCounts: [],
        locations: [],
        devices: [],
        lastActivity: Date.now(),
        riskScore: 0,
        violations: []
      });
    }
  }

  recordActivity(userId, activity) {
    this.initializeUserProfile(userId);
    const profile = this.userProfiles.get(userId);
    
    const now = Date.now();
    const hour = new Date(now).getHours();
    
    switch (activity.type) {
      case 'LOGIN':
        profile.loginTimes.push(hour);
        if (profile.loginTimes.length > 50) profile.loginTimes.shift();
        break;
        
      case 'SESSION_END':
        const duration = now - profile.lastActivity;
        profile.sessionDurations.push(duration);
        if (profile.sessionDurations.length > 30) profile.sessionDurations.shift();
        break;
        
      case 'ACTION':
        profile.actionCounts.push({ type: activity.action, timestamp: now });
        profile.actionCounts = profile.actionCounts.filter(a => now - a.timestamp < 24 * 60 * 60 * 1000);
        break;
        
      case 'LOCATION':
        profile.locations.push({ ip: activity.ip, timestamp: now });
        if (profile.locations.length > 10) profile.locations.shift();
        break;
        
      case 'DEVICE':
        profile.devices.push({ fingerprint: activity.fingerprint, timestamp: now });
        if (profile.devices.length > 5) profile.devices.shift();
        break;
    }
    
    profile.lastActivity = now;
    this.saveProfiles();
    
    return this.analyzeAnomaly(userId, activity);
  }

  analyzeAnomaly(userId, activity) {
    const profile = this.userProfiles.get(userId);
    let anomalyScore = 0;
    const anomalies = [];

    // Login time anomaly
    if (activity.type === 'LOGIN') {
      const currentHour = new Date().getHours();
      const avgLoginHour = profile.loginTimes.reduce((a, b) => a + b, 0) / profile.loginTimes.length;
      const hourDiff = Math.abs(currentHour - avgLoginHour);
      
      if (hourDiff > 6) {
        anomalyScore += 0.3;
        anomalies.push('Unusual login time');
      }
    }

    // Rapid action anomaly
    if (activity.type === 'ACTION') {
      const recentActions = profile.actionCounts.filter(a => Date.now() - a.timestamp < 60000);
      if (recentActions.length > 10) {
        anomalyScore += 0.4;
        anomalies.push('Rapid action sequence detected');
      }
    }

    // Location change anomaly
    if (activity.type === 'LOCATION' && profile.locations.length > 1) {
      const lastLocation = profile.locations[profile.locations.length - 2];
      if (activity.ip !== lastLocation.ip && Date.now() - lastLocation.timestamp < 60000) {
        anomalyScore += 0.6;
        anomalies.push('Rapid location change');
      }
    }

    // Device change anomaly
    if (activity.type === 'DEVICE' && profile.devices.length > 0) {
      const knownDevices = profile.devices.map(d => d.fingerprint);
      if (!knownDevices.includes(activity.fingerprint)) {
        anomalyScore += 0.5;
        anomalies.push('New device detected');
      }
    }

    // Update risk score
    profile.riskScore = Math.min(1.0, profile.riskScore * 0.9 + anomalyScore * 0.1);

    const result = {
      userId,
      anomalyScore,
      riskScore: profile.riskScore,
      anomalies,
      severity: this.calculateSeverity(anomalyScore),
      timestamp: Date.now()
    };

    if (anomalyScore > 0.5) {
      this.triggerAlert(result);
    }

    return result;
  }

  calculateSeverity(score) {
    if (score >= 0.8) return 'CRITICAL';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MEDIUM';
    if (score >= 0.2) return 'LOW';
    return 'INFO';
  }

  triggerAlert(anomaly) {
    const alert = {
      id: Date.now().toString(),
      type: 'ANOMALY_DETECTED',
      userId: anomaly.userId,
      severity: anomaly.severity,
      anomalies: anomaly.anomalies,
      timestamp: anomaly.timestamp,
      status: 'ACTIVE'
    };

    // Store alert
    const alerts = JSON.parse(localStorage.getItem('raksha_alerts') || '[]');
    alerts.push(alert);
    localStorage.setItem('raksha_alerts', JSON.stringify(alerts));

    // Log to DLP system
    if (window.dlpManager) {
      window.dlpManager.logViolation(`Anomaly: ${anomaly.anomalies.join(', ')}`);
    }

    return alert;
  }

  getUserRiskProfile(userId) {
    return this.userProfiles.get(userId) || null;
  }

  getActiveAlerts() {
    const alerts = JSON.parse(localStorage.getItem('raksha_alerts') || '[]');
    return alerts.filter(alert => alert.status === 'ACTIVE');
  }

  resolveAlert(alertId) {
    const alerts = JSON.parse(localStorage.getItem('raksha_alerts') || '[]');
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = 'RESOLVED';
      alert.resolvedAt = Date.now();
      localStorage.setItem('raksha_alerts', JSON.stringify(alerts));
    }
  }
}

const anomalyDetector = new AnomalyDetector();
export default anomalyDetector;