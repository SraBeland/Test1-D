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
      
      // Create database file if it doesn't exist
      await this.ensureDatabaseExists();
      
      // Ensure default settings exist for this instance
      await this.ensureDefaultSettings();
      
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

  async ensureDefaultSettings() {
    try {
      const db = await this.readDatabase();
      
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          url: '',
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
        // Ensure existing instances have the URL field
        let needsUpdate = false;
        if (db.instances[this.instanceId].url === undefined) {
          db.instances[this.instanceId].url = '';
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await this.writeDatabase(db);
          console.log(`Updated existing instance ${this.instanceId} with URL field`);
        }
      }
    } catch (error) {
      console.error('Error ensuring default settings:', error);
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

  async saveWindowSettings(x, y, width, height) {
    try {
      const db = await this.readDatabase();
      
      // Ensure instance exists
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          windowSettings: {}
        };
      }
      
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
      
      // Ensure instance exists
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          windowSettings: {
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            updatedAt: new Date().toISOString()
          }
        };
      }
      
      // Update system name
      db.instances[this.instanceId].systemName = systemName;
      
      // Update timestamp if window settings exist
      if (db.instances[this.instanceId].windowSettings) {
        db.instances[this.instanceId].windowSettings.updatedAt = new Date().toISOString();
      }
      
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
      
      // Ensure instance exists
      if (!db.instances[this.instanceId]) {
        db.instances[this.instanceId] = {
          systemName: 'Unnamed',
          url: '',
          windowSettings: {
            x: 100,
            y: 100,
            width: 800,
            height: 600,
            updatedAt: new Date().toISOString()
          }
        };
      }
      
      // Update URL
      db.instances[this.instanceId].url = url;
      
      // Update timestamp if window settings exist
      if (db.instances[this.instanceId].windowSettings) {
        db.instances[this.instanceId].windowSettings.updatedAt = new Date().toISOString();
      }
      
      await this.writeDatabase(db);
      console.log(`URL saved for instance ${this.instanceId}: ${url}`);
    } catch (error) {
      console.error('Error saving URL:', error);
    }
  }

  async close() {
    // No cleanup needed for JSON file storage
    console.log('JSON database connection closed');
  }
}

module.exports = DatabaseManager;
