import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('<1 Starting database seeding...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password', 10);
    const superAdminPassword = await bcrypt.hash('password', 10);

    console.log('= Creating manager accounts...');

    // Create SUPERADMIN user
    const superAdmin = await prisma.managerAccount.upsert({
        where: { username: 'superadmin' },
        update: {},
        create: {
            username: 'superadmin',
            password: superAdminPassword,
            status: 'SUPERADMIN',
            isActive: true,
        },
    });

    // Create ADMIN user
    const admin = await prisma.managerAccount.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            status: 'ADMIN',
            isActive: true,
        },
    });

    // Create additional test admin users
    const testAdminPassword = await bcrypt.hash('testadmin123', 10);

    const testAdmin = await prisma.managerAccount.upsert({
        where: { username: 'testadmin' },
        update: {},
        create: {
            username: 'testadmin',
            password: testAdminPassword,
            status: 'ADMIN',
            isActive: true,
        },
    });

    console.log(' Manager accounts created successfully:');
    console.log(`   - SUPERADMIN: ${superAdmin.username} (ID: ${superAdmin.id})`);
    console.log(`   - ADMIN: ${admin.username} (ID: ${admin.id})`);
    console.log(`   - TEST ADMIN: ${testAdmin.username} (ID: ${testAdmin.id})`);

    console.log('\n= Login credentials:');
    console.log('   SUPERADMIN - Username: superadmin, Password: password');
    console.log('   ADMIN - Username: admin, Password: password');
    console.log('   TEST ADMIN - Username: testadmin, Password: testadmin123');

    console.log('\n🎫 Creating test TML codes...');
    
    // Create test TML codes for testing
    const testCodes = [
        'TML001',
        'TML002', 
        'TML003',
        'BEACON001',
        'BEACON002',
        'TESTCODE1',
        'TESTCODE2',
    ];

    for (const code of testCodes) {
        await prisma.codeDistribution.upsert({
            where: { code },
            update: {},
            create: {
                code,
                isActive: true,
            },
        });
    }

    console.log(`   ✅ Created ${testCodes.length} test TML codes: ${testCodes.join(', ')}`);
    console.log('\n🎫 Test TML Codes for testing:');
    console.log(`   ${testCodes.join(', ')}`);

    console.log('\n<1 Database seeding completed!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('L Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });