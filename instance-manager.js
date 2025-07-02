const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class InstanceManager {
  constructor() {
    this.instanceId = null;
    this.instanceFilePath = path.join(__dirname, 'instance-id.json');
  }

  /**
   * Initialize the instance manager by loading or creating an instance ID
   */
  async initialize() {
    try {
      await this.loadInstanceId();
      console.log(`Application instance ID: ${this.instanceId}`);
    } catch (error) {
      console.error('Error initializing instance manager:', error);
      throw error;
    }
  }

  /**
   * Load existing instance ID from file or create a new one
   */
  async loadInstanceId() {
    try {
      // Try to read existing instance ID file
      const data = await fs.readFile(this.instanceFilePath, 'utf8');
      const instanceData = JSON.parse(data);
      
      if (instanceData.instanceId && this.isValidGuid(instanceData.instanceId)) {
        this.instanceId = instanceData.instanceId;
        console.log('Loaded existing instance ID from file');
      } else {
        throw new Error('Invalid instance ID in file');
      }
    } catch (error) {
      // File doesn't exist or is invalid, create new instance ID
      console.log('Creating new instance ID...');
      await this.createNewInstanceId();
    }
  }

  /**
   * Create a new GUID and save it to file
   */
  async createNewInstanceId() {
    try {
      // Generate a new GUID (UUID v4)
      this.instanceId = crypto.randomUUID();
      
      const instanceData = {
        instanceId: this.instanceId,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      await fs.writeFile(this.instanceFilePath, JSON.stringify(instanceData, null, 2));
      console.log(`New instance ID created and saved: ${this.instanceId}`);
    } catch (error) {
      console.error('Error creating new instance ID:', error);
      throw error;
    }
  }

  /**
   * Update the last used timestamp
   */
  async updateLastUsed() {
    try {
      const data = await fs.readFile(this.instanceFilePath, 'utf8');
      const instanceData = JSON.parse(data);
      instanceData.lastUsed = new Date().toISOString();
      
      await fs.writeFile(this.instanceFilePath, JSON.stringify(instanceData, null, 2));
    } catch (error) {
      console.error('Error updating last used timestamp:', error);
    }
  }

  /**
   * Get the current instance ID
   */
  getInstanceId() {
    return this.instanceId;
  }

  /**
   * Validate GUID format
   */
  isValidGuid(guid) {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }

  /**
   * Get instance information
   */
  async getInstanceInfo() {
    try {
      const data = await fs.readFile(this.instanceFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return {
        instanceId: this.instanceId,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };
    }
  }
}

module.exports = InstanceManager;
