// Blockchain Ledger Simulation with Smart Contracts
import encryptionManager from './encryption.js';

class BlockchainLedger {
  constructor() {
    this.chain = this.loadChain();
    this.pendingTransactions = [];
    this.smartContracts = new Map();
    this.initializeSmartContracts();
  }

  loadChain() {
    const saved = localStorage.getItem('raksha_blockchain');
    if (saved) {
      return JSON.parse(saved);
    }
    return [this.createGenesisBlock()];
  }

  saveChain() {
    localStorage.setItem('raksha_blockchain', JSON.stringify(this.chain));
  }

  createGenesisBlock() {
    return {
      index: 0,
      timestamp: Date.now(),
      data: { type: 'GENESIS', message: 'RAKSHA Blockchain Initialized' },
      previousHash: '0',
      hash: 'genesis_hash_raksha_2024',
      nonce: 0
    };
  }

  async createBlock(data) {
    const previousBlock = this.chain[this.chain.length - 1];
    const block = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      data,
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0
    };

    block.hash = await encryptionManager.sha256Hash({
      index: block.index,
      timestamp: block.timestamp,
      data: block.data,
      previousHash: block.previousHash,
      nonce: block.nonce
    });

    this.chain.push(block);
    this.saveChain();
    return block;
  }

  async addTransaction(type, data, userId) {
    const transaction = {
      id: encryptionManager.generateSecureToken(),
      type,
      data,
      userId,
      timestamp: Date.now(),
      hash: await encryptionManager.sha256Hash({ type, data, userId, timestamp: Date.now() })
    };

    // Execute smart contract if applicable
    if (this.smartContracts.has(type)) {
      const contract = this.smartContracts.get(type);
      const result = contract.execute(transaction);
      if (!result.valid) {
        throw new Error(`Smart contract violation: ${result.reason}`);
      }
    }

    await this.createBlock(transaction);
    return transaction;
  }

  initializeSmartContracts() {
    // Group membership contract
    this.smartContracts.set('GROUP_JOIN', {
      execute: (tx) => {
        const { role, clearanceLevel } = tx.data;
        if (!['Admin', 'Analyst', 'Operator'].includes(role)) {
          return { valid: false, reason: 'Invalid role' };
        }
        if (clearanceLevel < 1 || clearanceLevel > 5) {
          return { valid: false, reason: 'Invalid clearance level' };
        }
        return { valid: true };
      }
    });

    // Link generation contract
    this.smartContracts.set('LINK_CREATE', {
      execute: (tx) => {
        const { securityLevel, duration } = tx.data;
        if (duration > 24 * 60 * 60 * 1000) {
          return { valid: false, reason: 'Link duration exceeds 24 hours' };
        }
        if (securityLevel > 3 && tx.userId !== 'admin@mod.gov.in') {
          return { valid: false, reason: 'Insufficient clearance for security level' };
        }
        return { valid: true };
      }
    });

    // Communication contract
    this.smartContracts.set('MESSAGE_SEND', {
      execute: (tx) => {
        const { recipient, classification } = tx.data;
        if (classification === 'SECRET' && !tx.userId.includes('@mod.gov.in')) {
          return { valid: false, reason: 'Unauthorized for SECRET classification' };
        }
        return { valid: true };
      }
    });
  }

  getAuditTrail(userId = null, type = null) {
    return this.chain
      .filter(block => block.data && block.data.type !== 'GENESIS')
      .filter(block => !userId || block.data.userId === userId)
      .filter(block => !type || block.data.type === type)
      .map(block => ({
        timestamp: block.timestamp,
        type: block.data.type,
        userId: block.data.userId,
        data: block.data.data,
        hash: block.hash
      }));
  }

  verifyIntegrity() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];
      
      if (currentBlock.previousHash !== previousBlock.hash) {
        return { valid: false, error: `Block ${i} integrity compromised` };
      }
    }
    return { valid: true };
  }
}

const blockchainLedger = new BlockchainLedger();
export default blockchainLedger;