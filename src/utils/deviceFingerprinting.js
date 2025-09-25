// Device Fingerprinting and Hardware Identification
class DeviceFingerprinter {
  constructor() {
    this.fingerprint = null;
    this.deviceInfo = null;
    this.generateFingerprint();
  }

  async generateFingerprint() {
    const components = await this.collectDeviceInfo();
    const fingerprintString = JSON.stringify(components);
    
    // Generate hash of device characteristics
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    this.fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    this.deviceInfo = components;
    
    return this.fingerprint;
  }

  async collectDeviceInfo() {
    const info = {
      // Screen characteristics
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight
      },
      
      // Browser characteristics
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        maxTouchPoints: navigator.maxTouchPoints
      },
      
      // Timezone and locale
      timezone: {
        offset: new Date().getTimezoneOffset(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      
      // Canvas fingerprinting
      canvas: await this.getCanvasFingerprint(),
      
      // WebGL fingerprinting
      webgl: this.getWebGLFingerprint(),
      
      // Audio context fingerprinting
      audio: await this.getAudioFingerprint(),
      
      // Battery API (if available)
      battery: await this.getBatteryInfo(),
      
      // Network information
      network: this.getNetworkInfo(),
      
      // Device memory (if available)
      memory: navigator.deviceMemory || 'unknown',
      
      // Timestamp
      timestamp: Date.now()
    };

    return info;
  }

  async getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 200;
      canvas.height = 50;
      
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('RAKSHA Device ID', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Security Fingerprint', 4, 35);
      
      return canvas.toDataURL();
    } catch (e) {
      return 'canvas_error';
    }
  }

  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return 'no_webgl';
      
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        extensions: gl.getSupportedExtensions()
      };
    } catch (e) {
      return 'webgl_error';
    }
  }

  async getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      oscillator.stop(audioContext.currentTime + 0.1);
      
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      await audioContext.close();
      
      return Array.from(frequencyData).slice(0, 30).join(',');
    } catch (e) {
      return 'audio_error';
    }
  }

  async getBatteryInfo() {
    try {
      if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        return {
          charging: battery.charging,
          level: Math.round(battery.level * 100),
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime
        };
      }
      return 'no_battery_api';
    } catch (e) {
      return 'battery_error';
    }
  }

  getNetworkInfo() {
    try {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        return {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData
        };
      }
      return 'no_network_api';
    } catch (e) {
      return 'network_error';
    }
  }

  getFingerprint() {
    return this.fingerprint;
  }

  getDeviceInfo() {
    return this.deviceInfo;
  }

  isKnownDevice(fingerprint) {
    const knownDevices = JSON.parse(localStorage.getItem('raksha_known_devices') || '[]');
    return knownDevices.includes(fingerprint);
  }

  registerDevice(fingerprint = null) {
    const fp = fingerprint || this.fingerprint;
    const knownDevices = JSON.parse(localStorage.getItem('raksha_known_devices') || '[]');
    
    if (!knownDevices.includes(fp)) {
      knownDevices.push(fp);
      localStorage.setItem('raksha_known_devices', JSON.stringify(knownDevices));
    }
    
    // Store device registration in blockchain
    if (window.blockchainLedger) {
      window.blockchainLedger.addTransaction('DEVICE_REGISTER', {
        fingerprint: fp,
        deviceInfo: this.deviceInfo,
        timestamp: Date.now()
      }, 'system');
    }
  }

  getThreatLevel() {
    const info = this.deviceInfo;
    let threatLevel = 0;
    
    // Check for suspicious characteristics
    if (info.browser.userAgent.includes('HeadlessChrome')) threatLevel += 0.8;
    if (info.canvas === 'canvas_error') threatLevel += 0.3;
    if (info.webgl === 'webgl_error') threatLevel += 0.2;
    if (info.browser.languages.length === 0) threatLevel += 0.4;
    if (info.screen.width === 0 || info.screen.height === 0) threatLevel += 0.5;
    
    return Math.min(1.0, threatLevel);
  }
}

const deviceFingerprinter = new DeviceFingerprinter();
export default deviceFingerprinter;