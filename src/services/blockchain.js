// Blockchain and SHA256 utilities for secure link management

// Simple SHA256 implementation
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Block structure for blockchain
class Block {
  constructor(index, timestamp, data, previousHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = '';
  }

  async calculateHash() {
    const blockString = this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce;
    return await sha256(blockString);
  }

  async mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = await this.calculateHash();
    }
  }
}

// Blockchain for secure link tracking
class SecureLinkBlockchain {
  constructor() {
    this.chain = [];
    this.difficulty = 2;
    this.initializeChain();
  }

  async initializeChain() {
    const genesisBlock = new Block(0, Date.now(), 'Genesis Block - Indian Army HQ', '0');
    await genesisBlock.mineBlock(this.difficulty);
    this.chain = [genesisBlock];
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(data) {
    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      previousBlock.hash
    );
    await newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  async isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== await currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockByLinkId(linkId) {
    return this.chain.find(block => 
      block.data && block.data.linkId === linkId
    );
  }
}

// Generate secure token with SHA256
async function generateSecureToken(linkId, purpose, timestamp) {
  const data = `${linkId}-${purpose}-${timestamp}-${Math.random()}`;
  return await sha256(data);
}

// Create blockchain instance
const linkBlockchain = new SecureLinkBlockchain();

export {
  sha256,
  Block,
  SecureLinkBlockchain,
  generateSecureToken,
  linkBlockchain
};