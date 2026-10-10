import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedAdminUser(dataSource: DataSource) {
    console.log('👤 Seeding admin user...');

    const userRepo = dataSource.getRepository(User);
    const adminEmail = 'admin@dietandwell.com';

    try {
        const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });

        if (existingAdmin) {
            console.log('  ⏭️  Admin user already exists');

            // Ensure role is admin
            if (existingAdmin.role !== UserRole.ADMIN) {
                existingAdmin.role = UserRole.ADMIN;
                await userRepo.save(existingAdmin);
                console.log('  ✅ Updated existing user to Admin role');
            }
            return;
        }

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('Admin123!', salt);

        const adminUser = userRepo.create({
            email: adminEmail,
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Admin',
            role: UserRole.ADMIN,
            isActive: true,
        });

        await userRepo.save(adminUser);
        console.log('  ✅ Created admin user: admin@dietandwell.com / Admin123!');

    } catch (error) {
        console.error('❌ Error seeding admin user:', error);
        throw error;
    }
}
