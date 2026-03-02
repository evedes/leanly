import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function runMigrations() {
  const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;

  const sslConfig =
    process.env.POSTGRES_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false;

  const migrationClient = postgres(connectionString, {
    max: 1,
    ssl: sslConfig,
  });
  const db = drizzle(migrationClient);

  try {
    console.log('Starting migrations...');
    await migrate(db, { migrationsFolder: './drizzle' });
    const result =
      await migrationClient`SELECT COUNT(*) as count FROM drizzle.__drizzle_migrations`;
    console.log(`Migrations completed. Total applied: ${result[0].count}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await migrationClient.end();
  }
}

if (require.main === module) {
  void runMigrations();
}

export { runMigrations };
