# Electron App with Neon Database Integration

This Electron application connects to a Neon PostgreSQL database to store and retrieve window position and size settings. Each application instance is uniquely identified by a GUID, allowing multiple instances to run simultaneously without conflicts.

## Features

- Always-on-top window behavior
- Automatic window position and size persistence
- Database-backed settings storage using Neon
- **Unique instance identification with GUID**
- **Multi-instance support** - multiple copies can run on different computers
- Automatic database schema migration for existing installations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Neon Database

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new database project
3. Copy your connection string from the Neon dashboard
4. Update the `.env` file with your actual database connection string:

```env
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require
```

### 3. Run the Application

```bash
npm start
```

## How It Works

### Instance Management
- On first run, the app generates a unique GUID (UUID v4) and saves it to `instance-id.json`
- Each subsequent run loads the same GUID, ensuring consistent instance identification
- Multiple installations on different computers will have different GUIDs

### Database Operations
- On first run, the app creates a `window_settings` table in your Neon database
- The window position and size are loaded from the database filtered by the instance GUID
- Any changes to window position or size are automatically saved to the database with the instance GUID
- Each instance maintains its own separate window settings in the shared database

## Database Schema

The app creates a table with the following structure:

```sql
CREATE TABLE window_settings (
  id SERIAL PRIMARY KEY,
  instance_id VARCHAR(36),           -- New: GUID to identify each app instance
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for better performance when filtering by instance_id
CREATE INDEX idx_window_settings_instance_id ON window_settings(instance_id);
```

## Multi-Instance Support

This application now supports multiple instances running simultaneously:

- **Same Computer**: You can run multiple copies of the app, each with its own window settings
- **Different Computers**: Each installation gets a unique GUID, so settings don't conflict
- **Shared Database**: All instances can use the same Neon database while maintaining separate settings
- **Automatic Migration**: Existing installations will automatically get the new instance_id column added

## Files Created

- `instance-id.json` - Contains the unique GUID for this installation (do not delete this file)

## Troubleshooting

- If the database connection fails, the app will fall back to default window settings
- Check the console for any database connection errors
- Ensure your Neon database is active and the connection string is correct
