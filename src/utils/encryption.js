// AES-256 Encryption and SHA-256 Hashing Implementation
class EncryptionManager {
  constructor() {
    this.key = null;
    this.initializeKey();
  }

  async initializeKey() {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode('RAKSHA_DEFENSE_KEY_2024_SECURE'),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    this.key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode('INDIAN_ARMY_SALT'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(data) {
    if (!this.key) await this.initializeKey();
    
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.key,
      encodedData
    );

    return {
      data: Array.from(new Uint8Array(encrypted)),
      iv: Array.from(iv),
      timestamp: Date.now()
    };
  }

  async decrypt(encryptedObj) {
    if (!this.key) await this.initializeKey();
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(encryptedObj.iv) },
      this.key,
      new Uint8Array(encryptedObj.data)
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  }

  async sha256Hash(data) {
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  generateSecureToken() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
}

const encryptionManager = new EncryptionManager();
export default encryptionManager;