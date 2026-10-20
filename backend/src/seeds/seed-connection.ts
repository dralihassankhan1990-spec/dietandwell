import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load backend/.env (same layout as seed.ts / data-source.ts) so
// DATABASE_URL or the DATABASE_* parts are available to standalone
// ts-node seed scripts.
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

/**
 * DataSource for standalone seed scripts. Dev-only: synchronize is on so a
 * fresh scratch database gets its tables created automatically.
 */
export function createSeedDataSource(): DataSource {
  const databaseUrl = process.env.DATABASE_URL;
  return new DataSource({
    type: 'postgres',
    ...(databaseUrl
      ? {
          url: databaseUrl,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
        }
      : {
          host: process.env.DATABASE_HOST || 'localhost',
          port: parseInt(process.env.DATABASE_PORT || '5432', 10),
          username: process.env.DATABASE_USERNAME || 'postgres',
          password: process.env.DATABASE_PASSWORD || '',
          database: process.env.DATABASE_NAME || 'dietandwell',
        }),
    entities: [path.join(__dirname, '..', 'entities', '*.entity.{ts,js}')],
    synchronize: true,
  });
}
