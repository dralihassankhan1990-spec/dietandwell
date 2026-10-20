import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { seedDemoContent } from './seeds/demo-content.seed';
import { seedAdminUser } from './seeds/admin-user.seed';
import { seedDefaultSettings } from './seeds/default-settings.seed';

// Load backend/.env (same dir layout as data-source.ts) so ADMIN_* and
// DATABASE_* are available when running `npm run seed` from backend/.
config({ path: path.resolve(__dirname, '../.env') });
config({ path: path.resolve(__dirname, '../../.env') });

async function runSeeds() {
 const databaseUrl = process.env.DATABASE_URL;
 // Create data source
 const dataSource = new DataSource({
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
 entities: [path.join(__dirname, 'entities', '*.entity.{ts,js}')],
 // Dev-only seed script: create missing tables so a fresh DB can be seeded.
 synchronize: true,
 });

 try {
 console.log(' Connecting to database...');
 await dataSource.initialize();
 console.log(' Database connected!\n');

 await seedAdminUser(dataSource);
 await seedDemoContent(dataSource);
 await seedDefaultSettings(dataSource);

 console.log('\n All seeds completed successfully!');
 } catch (error) {
 console.error(' Seeding failed:', error);
 process.exit(1);
 } finally {
 if (dataSource.isInitialized) {
 await dataSource.destroy();
 console.log('\n Database connection closed');
 }
 }
}

runSeeds();
