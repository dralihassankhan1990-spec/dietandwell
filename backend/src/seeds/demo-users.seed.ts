import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { createSeedDataSource } from './seed-connection';

const BCRYPT_ROUNDS = 10;

const DEMO_USERS: Array<{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}> = [
  { email: 'admin@dietandwell.com', password: 'root', firstName: 'Demo', lastName: 'Admin', role: UserRole.ADMIN },
  { email: 'editor@dietandwell.com', password: 'editor123', firstName: 'Demo', lastName: 'Editor', role: UserRole.EDITOR },
  { email: 'customer@test.com', password: 'customer123', firstName: 'Demo', lastName: 'Customer', role: UserRole.CUSTOMER },
  { email: 'visitor@test.com', password: 'visitor123', firstName: 'Demo', lastName: 'Visitor', role: UserRole.VISITOR },
];

/**
 * Demo users seed. Run ONLY via `npm run seed:users` — never on backend boot.
 *
 * TRUNCATEs the users table with CASCADE (orders, carts, digital orders and
 * anything else referencing users go too), then creates exactly the 4 demo
 * users above with bcrypt-hashed passwords (10 rounds).
 */
export async function seedDemoUsers(dataSource: DataSource) {
  const repo = dataSource.getRepository(User);

  console.log('Truncating users table (CASCADE)...');
  await repo.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, BCRYPT_ROUNDS);
    await repo.save(
      repo.create({
        email: u.email,
        password: hash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: true,
      }),
    );
    console.log(`  Created ${u.email} (${u.role})`);
  }

  // Verify every login: re-read each row and compare the password with bcrypt.
  console.log('Verifying logins with bcrypt.compare...');
  for (const u of DEMO_USERS) {
    const row = await repo.findOne({ where: { email: u.email } });
    if (!row) {
      throw new Error(`Verification failed: ${u.email} not found after seeding`);
    }
    const ok = await bcrypt.compare(u.password, row.password);
    if (!ok) {
      throw new Error(`Verification failed: password mismatch for ${u.email}`);
    }
    console.log(`  OK ${u.email}`);
  }
}

async function main() {
  const dataSource = createSeedDataSource();
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Database connected.\n');
    await seedDemoUsers(dataSource);
    console.log('\nDemo users seeded. Credentials:');
    console.log('+--------------------------+-------------+----------+');
    console.log('| email                    | password    | role     |');
    console.log('+--------------------------+-------------+----------+');
    for (const u of DEMO_USERS) {
      console.log(
        `| ${u.email.padEnd(24)} | ${u.password.padEnd(11)} | ${u.role.padEnd(8)} |`,
      );
    }
    console.log('+--------------------------+-------------+----------+');
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Only runs when invoked directly: `ts-node src/seeds/demo-users.seed.ts`.
// Importing this module (e.g. from a test) never seeds anything.
if (require.main === module) {
  main().catch((error) => {
    console.error('seed:users failed:', error);
    process.exit(1);
  });
}
