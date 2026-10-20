import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';

/**
 * Seeds the admin user. Credentials come ONLY from the environment:
 * ADMIN_EMAIL (default: admin@dietandwell.com)
 * ADMIN_PASSWORD (REQUIRED — the seed fails with a clear error if unset)
 * No credentials are hardcoded anywhere. If the admin already exists, its
 * role is ensured to be admin and its password is left untouched.
 */
export async function seedAdminUser(dataSource: DataSource) {
 console.log(' Seeding admin user...');

 const adminEmail = process.env.ADMIN_EMAIL || 'admin@dietandwell.com';
 const adminPassword = process.env.ADMIN_PASSWORD;
 if (!adminPassword) {
 throw new Error(
 'ADMIN_PASSWORD environment variable is required to seed the admin user. ' +
 'Set it in the shell (e.g. ADMIN_PASSWORD=... npm run seed) — never commit it.',
 );
 }

 const userRepo = dataSource.getRepository(User);

 try {
 const existingAdmin = await userRepo.findOne({ where: { email: adminEmail } });

 if (existingAdmin) {
 console.log(' ⏭️ Admin user already exists');

 // Ensure role is admin (password is NOT reset)
 if (existingAdmin.role !== UserRole.ADMIN) {
 existingAdmin.role = UserRole.ADMIN;
 await userRepo.save(existingAdmin);
 console.log(' Updated existing user to Admin role');
 }
 return;
 }

 const salt = await bcrypt.genSalt();
 const hashedPassword = await bcrypt.hash(adminPassword, salt);

 const adminUser = userRepo.create({
 email: adminEmail,
 password: hashedPassword,
 firstName: 'System',
 lastName: 'Admin',
 role: UserRole.ADMIN,
 isActive: true,
 });

 await userRepo.save(adminUser);
 console.log(` Created admin user: ${adminEmail}`);
 } catch (error) {
 console.error(' Error seeding admin user:', error);
 throw error;
 }
}
