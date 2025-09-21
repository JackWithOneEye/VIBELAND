import { Database } from "bun:sqlite";
import { readdir } from "fs/promises";
import path from "path";

export async function runMigrations(dbPath = "vibeland.db") {
  const db = new Database(dbPath, { create: true });
  
  // Ensure migrations table exists
  db.run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Get executed migrations
  const executedMigrations = new Set(
    db.prepare("SELECT name FROM migrations").all().map(row => row.name)
  );
  
  // Get all migration files
  const migrationDir = path.join(process.cwd(), 'migration');
  const files = await readdir(migrationDir);
  const migrationFiles = files
    .filter(file => file.endsWith('.js') && file !== 'migrate.js')
    .sort();
  
  // Run pending migrations
  for (const file of migrationFiles) {
    const migrationName = path.basename(file, '.js');
    
    if (executedMigrations.has(migrationName)) {
      console.log(`Migration ${migrationName} already executed, skipping`);
      continue;
    }
    
    console.log(`Running migration: ${migrationName}`);
    
    try {
      const migrationPath = path.join(migrationDir, file);
      const migration = await import(migrationPath);
      
      if (typeof migration.up === 'function') {
        migration.up(db);
        
        // Record migration as executed
        db.prepare("INSERT INTO migrations (name) VALUES (?)").run(migrationName);
        
        console.log(`✓ Migration ${migrationName} completed successfully`);
      } else {
        console.error(`Migration ${migrationName} missing 'up' function`);
      }
    } catch (error) {
      console.error(`Failed to run migration ${migrationName}:`, error);
      throw error;
    }
  }
  
  return db;
}
