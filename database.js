const { Pool } = require('pg');
require('dotenv').config();

class DatabaseManager {
  constructor(instanceId) {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    this.instanceId = instanceId;
  }

  async initialize() {
    try {
      // Create table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS window_settings (
          id SERIAL PRIMARY KEY,
          instance_id VARCHAR(36),
          system_name VARCHAR(255) DEFAULT 'Unnamed',
          x INTEGER NOT NULL,
          y INTEGER NOT NULL,
          width INTEGER NOT NULL,
          height INTEGER NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Add instance_id column if it doesn't exist (for existing databases)
      await this.pool.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'window_settings' AND column_name = 'instance_id'
          ) THEN
            ALTER TABLE window_settings ADD COLUMN instance_id VARCHAR(36);
          END IF;
        END $$;
      `);
      
      // Add system_name column if it doesn't exist (for existing databases)
      await this.pool.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'window_settings' AND column_name = 'system_name'
          ) THEN
            ALTER TABLE window_settings ADD COLUMN system_name VARCHAR(255) DEFAULT 'Unnamed';
          END IF;
        END $$;
      `);
      
      // Create index on instance_id for better performance
      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS idx_window_settings_instance_id 
        ON window_settings(instance_id)
      `);
      
      // Ensure default values exist
      await this.ensureDefaultSettings();
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async ensureDefaultSettings() {
    try {
      const result = await this.pool.query(
        'SELECT COUNT(*) FROM window_settings WHERE instance_id = $1',
        [this.instanceId]
      );
      if (parseInt(result.rows[0].count) === 0) {
        await this.pool.query(`
          INSERT INTO window_settings (instance_id, x, y, width, height) 
          VALUES ($1, $2, $3, $4, $5)
        `, [this.instanceId, 100, 100, 800, 600]);
        console.log(`Default window settings inserted for instance ${this.instanceId}`);
      }
    } catch (error) {
      console.error('Error ensuring default settings:', error);
    }
  }

  async getWindowSettings() {
    try {
      const result = await this.pool.query(`
        SELECT x, y, width, height 
        FROM window_settings 
        WHERE instance_id = $1
        ORDER BY updated_at DESC 
        LIMIT 1
      `, [this.instanceId]);
      
      if (result.rows.length > 0) {
        return result.rows[0];
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
      // First, try to update existing record for this instance
      const updateResult = await this.pool.query(`
        UPDATE window_settings 
        SET x = $1, y = $2, width = $3, height = $4, updated_at = CURRENT_TIMESTAMP
        WHERE instance_id = $5 AND id = (
          SELECT id FROM window_settings 
          WHERE instance_id = $5 
          ORDER BY updated_at DESC 
          LIMIT 1
        )
      `, [x, y, width, height, this.instanceId]);
      
      // If no rows were updated, insert a new record
      if (updateResult.rowCount === 0) {
        await this.pool.query(`
          INSERT INTO window_settings (instance_id, x, y, width, height) 
          VALUES ($1, $2, $3, $4, $5)
        `, [this.instanceId, x, y, width, height]);
        console.log(`New window settings inserted for instance ${this.instanceId}: x=${x}, y=${y}, width=${width}, height=${height}`);
      } else {
        console.log(`Window settings updated for instance ${this.instanceId}: x=${x}, y=${y}, width=${width}, height=${height}`);
      }
    } catch (error) {
      console.error('Error saving window settings:', error);
    }
  }

  async getSystemName() {
    try {
      const result = await this.pool.query(`
        SELECT system_name 
        FROM window_settings 
        WHERE instance_id = $1
        ORDER BY updated_at DESC 
        LIMIT 1
      `, [this.instanceId]);
      
      if (result.rows.length > 0 && result.rows[0].system_name) {
        return result.rows[0].system_name;
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
      // First, try to update existing record for this instance
      const updateResult = await this.pool.query(`
        UPDATE window_settings 
        SET system_name = $1, updated_at = CURRENT_TIMESTAMP
        WHERE instance_id = $2 AND id = (
          SELECT id FROM window_settings 
          WHERE instance_id = $2 
          ORDER BY updated_at DESC 
          LIMIT 1
        )
      `, [systemName, this.instanceId]);
      
      // If no rows were updated, insert a new record
      if (updateResult.rowCount === 0) {
        await this.pool.query(`
          INSERT INTO window_settings (instance_id, system_name, x, y, width, height) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [this.instanceId, systemName, 100, 100, 800, 600]);
        console.log(`New window settings with system name inserted for instance ${this.instanceId}: ${systemName}`);
      } else {
        console.log(`System name updated for instance ${this.instanceId}: ${systemName}`);
      }
    } catch (error) {
      console.error('Error saving system name:', error);
    }
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = DatabaseManager;
