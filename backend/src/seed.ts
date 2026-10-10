import { DataSource } from 'typeorm';
import { seedDemoContent } from './seeds/demo-content.seed';
import { seedAdminUser } from './seeds/admin-user.seed';

async function runSeeds() {
    // Create data source
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'root',
        database: process.env.DATABASE_NAME || 'dietandwell',
        entities: ['src/entities/*.entity.ts'],
        synchronize: false,
    });

    try {
        console.log('🔌 Connecting to database...');
        await dataSource.initialize();
        console.log('✅ Database connected!\n');

        await seedAdminUser(dataSource);
        await seedDemoContent(dataSource);

        console.log('\n🎉 All seeds completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        await dataSource.destroy();
        console.log('\n👋 Database connection closed');
    }
}

runSeeds();
