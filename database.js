const fs = require('fs').promises;
const path = require('path');

class DatabaseManager {
  constructor(instanceId) {
    this.instanceId = instanceId;
    
    // Try to use a writable directory for the database
    let dbDir = __dirname;
    
    // In portable apps, try to use the executable directory
    if (process.env.PORTABLE_EXECUTABLE_DIR) {
      dbDir = process.env.PORTABLE_EXECUTABLE_DIR;
    } else if (process.resourcesPath && process.resourcesPath !== process.cwd()) {
      // In packaged apps, try to use a writable location
      const os = require('os');
      dbDir = path.join(os.homedir(), '.electron-led-app');
    }
    
    this.dbDir = dbDir;
    this.dbPath = path.join(dbDir, 'database.json');
    this.lockFile = path.join(dbDir, 'database.lock');
  }

  async initialize() {
    try {
      // Ensure database directory exists
      await this.ensureDirectoryExists();
      
      // Do all database setup in one operation
      await this.initializeDatabase();
      
      console.log('JSON database initialized successfully');
    } catch (error) {
      console.error('Error initializing JSON database:', error);
      throw error;
    }
  }

  async ensureDirectoryExists() {
    try {
      await fs.mkdir(this.dbDir, { recursive: true });
      console.log(`Database directory ensured: ${this.dbDir}`);
    } catch (error) {
      console.error('Error creating database directory:', error);
      throw error;
    }
  }

  async ensureDatabaseExists() {
    try {
      await fs.access(this.dbPath);
    } catch (error) {
      // File doesn't exist, create it with empty structure
      const initialData = {
        instances: {}
      };
      await this.writeDatabase(initialData);
      console.log('Created new database.json file');
    }
  }

  async readDatabase() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      // Return default structure if file is corrupted or missing
      return { instances: {} };
    }
  }

  async writeDatabase(data) {
    try {
      // Write to temporary file first, then rename for atomic operation
      const tempPath = this.dbPath + '.tmp';
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
      await fs.rename(tempPath, this.dbPath);
    } catch (error) {
      console.error('Error writing database:', error);
      throw error;
    }
  }

  async initializeDatabase() {
    try {
      let db;
      let needsWrite = false;
      
      // Try to read existing database
      try {
        await fs.access(this.dbPath);
        const data = await fs.readFile(this.dbPath, 'utf8');
        db = JSON.parse(data);
      } catch (error) {
        // File doesn't exist or is corrupted, create new one
        db = { instances: {} };
        needsWrite = true;
        console.log('Created new database structure');
      }
      
      // Ensure instance exists with all required fields
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          url: '',
          refreshInterval: 0,
          windowSettings: {
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            updatedAt: new Date().toISOString()
          }
        };
        needsWrite = true;
        console.log(`Default settings created for instance ${this.instanceId}`);
      } else {
        // Ensure existing instances have all required fields
        if (db.instances[this.instanceId].url === undefined) {
          db.instances[this.instanceId].url = '';
          needsWrite = true;
        }
        if (db.instances[this.instanceId].refreshInterval === undefined) {
          db.instances[this.instanceId].refreshInterval = 0;
          needsWrite = true;
        }
      }
      
      // Write database only if changes were made
      if (needsWrite) {
        await this.writeDatabase(db);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async ensureDefaultSettings() {
    try {
      const db = await this.readDatabase();
      
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          url: '',
          refreshInterval: 0,
          windowSettings: {
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            updatedAt: new Date().toISOString()
          }
        };
        
        await this.writeDatabase(db);
        console.log(`Default settings created for instance ${this.instanceId}`);
      } else {
        // Ensure existing instances have all required fields
        let needsUpdate = false;
        if (db.instances[this.instanceId].url === undefined) {
          db.instances[this.instanceId].url = '';
          needsUpdate = true;
        }
        if (db.instances[this.instanceId].refreshInterval === undefined) {
          db.instances[this.instanceId].refreshInterval = 0;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await this.writeDatabase(db);
          console.log(`Updated existing instance ${this.instanceId} with missing fields`);
        }
      }
    } catch (error) {
      console.error('Error ensuring default settings:', error);
    }
  }

  // Get all startup data in one operation
  async getStartupData() {
    try {
      const db = await this.readDatabase();
      const instance = db.instances[this.instanceId];
      
      if (instance) {
        return {
          windowSettings: instance.windowSettings || { x: 100, y: 100, width: 800, height: 600 },
          url: instance.url || '',
          refreshInterval: instance.refreshInterval || 0,
          systemName: instance.systemName || 'Unnamed'
        };
      } else {
        // Return defaults if instance doesn't exist
        return {
          windowSettings: { x: 100, y: 100, width: 800, height: 600 },
          url: '',
          refreshInterval: 0,
          systemName: 'Unnamed'
        };
      }
    } catch (error) {
      console.error('Error getting startup data:', error);
      // Return defaults on error
      return {
        windowSettings: { x: 100, y: 100, width: 800, height: 600 },
        url: '',
        refreshInterval: 0,
        systemName: 'Unnamed'
      };
    }
  }

  async getWindowSettings() {
    try {
      const db = await this.readDatabase();
      const instance = db.instances[this.instanceId];
      
      if (instance && instance.windowSettings) {
        const { x, y, width, height } = instance.windowSettings;
        return { x, y, width, height };
      } else {
        // Return default values if no settings found
        return { x: 100, y: 100, width: 800, height: 600 };
      }
    } catch (error) {
      console.error('Error getting window settings:', error);
      // Return default values on error
      return { x: 100, y: 100, width: 800, height: 600 };
    }
  }

  // Helper method to ensure instance exists with default values
  ensureInstanceExists(db) {
    if (!db.instances[this.instanceId]) {
      db.instances[this.instanceId] = {
        systemName: 'Unnamed',
        url: '',
        refreshInterval: 0,
        windowSettings: {
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          updatedAt: new Date().toISOString()
        }
      };
    }
  }

  // Helper method to update timestamp
  updateTimestamp(db) {
    if (db.instances[this.instanceId].windowSettings) {
      db.instances[this.instanceId].windowSettings.updatedAt = new Date().toISOString();
    }
  }

  async saveWindowSettings(x, y, width, height) {
    try {
      const db = await this.readDatabase();
      this.ensureInstanceExists(db);
      
      // Update window settings
      db.instances[this.instanceId].windowSettings = {
        x,
        y,
        width,
        height,
        updatedAt: new Date().toISOString()
      };
      
      await this.writeDatabase(db);
      console.log(`Window settings saved for instance ${this.instanceId}: x=${x}, y=${y}, width=${width}, height=${height}`);
    } catch (error) {
      console.error('Error saving window settings:', error);
    }
  }

  async getSystemName() {
    try {
      const db = await this.readDatabase();
      const instance = db.instances[this.instanceId];
      
      if (instance && instance.systemName) {
        return instance.systemName;
      } else {
        // Return default value if no system name found
        return 'Unnamed';
      }
    } catch (error) {
      console.error('Error getting system name:', error);
      // Return default value on error
      return 'Unnamed';
    }
  }

  async saveSystemName(systemName) {
    try {
      const db = await this.readDatabase();
      this.ensureInstanceExists(db);
      
      db.instances[this.instanceId].systemName = systemName;
      this.updateTimestamp(db);
      
      await this.writeDatabase(db);
      console.log(`System name saved for instance ${this.instanceId}: ${systemName}`);
    } catch (error) {
      console.error('Error saving system name:', error);
    }
  }

  async getUrl() {
    try {
      const db = await this.readDatabase();
      const instance = db.instances[this.instanceId];
      
      if (instance && instance.url) {
        return instance.url;
      } else {
        // Return empty string if no URL found
        return '';
      }
    } catch (error) {
      console.error('Error getting URL:', error);
      // Return empty string on error
      return '';
    }
  }

  async saveUrl(url) {
    try {
      const db = await this.readDatabase();
      this.ensureInstanceExists(db);
      
      db.instances[this.instanceId].url = url;
      this.updateTimestamp(db);
      
      await this.writeDatabase(db);
      console.log(`URL saved for instance ${this.instanceId}: ${url}`);
    } catch (error) {
      console.error('Error saving URL:', error);
    }
  }

  async getRefreshInterval() {
    try {
      const db = await this.readDatabase();
      const instance = db.instances[this.instanceId];
      
      if (instance && instance.refreshInterval !== undefined) {
        return instance.refreshInterval;
      } else {
        // Return 0 (disabled) if no refresh interval found
        return 0;
      }
    } catch (error) {
      console.error('Error getting refresh interval:', error);
      // Return 0 (disabled) on error
      return 0;
    }
  }

  async saveRefreshInterval(refreshInterval) {
    try {
      const db = await this.readDatabase();
      this.ensureInstanceExists(db);
      
      db.instances[this.instanceId].refreshInterval = refreshInterval;
      this.updateTimestamp(db);
      
      await this.writeDatabase(db);
      console.log(`Refresh interval saved for instance ${this.instanceId}: ${refreshInterval} seconds`);
    } catch (error) {
      console.error('Error saving refresh interval:', error);
    }
  }

  async close() {
    // No cleanup needed for JSON file storage
    console.log('JSON database connection closed');
  }
}

module.exports = DatabaseManager;
