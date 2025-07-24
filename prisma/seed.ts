import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Helper function to create Supabase auth user
async function createSupabaseAuthUser(email: string, password: string, username: string, role: string) {
    try {
        console.log(`   📧 Creating Supabase auth account for ${username}...`);
        
        const { data, error } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
                username: username,
                role: role,
                created_by_seed: true
            }
        });

        if (error) {
            console.error(`   ❌ Error creating Supabase auth for ${username}:`, error.message);
            return null;
        }

        console.log(`   ✅ Supabase auth account created for ${username} (${email})`);
        return data.user;
    } catch (error) {
        console.error(`   ❌ Failed to create Supabase auth for ${username}:`, error);
        return null;
    }
}

async function main() {
    console.log('🚀 Starting database seeding...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password', 10);
    const superAdminPassword = await bcrypt.hash('password', 10);

    console.log('\n🔐 Creating manager accounts and Supabase auth...');

    // Define admin users to create
    const adminUsers = [
        {
            username: 'superadmin',
            email: 'superadmin@beacon2025.com',
            password: 'password',
            status: 'SUPERADMIN' as const,
            hashedPassword: superAdminPassword
        },
        {
            username: 'admin',
            email: 'admin@beacon2025.com', 
            password: 'password',
            status: 'ADMIN' as const,
            hashedPassword: adminPassword
        },
        {
            username: 'testadmin',
            email: 'testadmin@beacon2025.com',
            password: 'testadmin123',
            status: 'ADMIN' as const,
            hashedPassword: await bcrypt.hash('testadmin123', 10)
        }
    ];

    const createdAccounts = [];

    for (const user of adminUsers) {
        console.log(`\n📝 Creating ${user.status} account: ${user.username}`);
        
        // Create Supabase auth account first
        const supabaseUser = await createSupabaseAuthUser(
            user.email,
            user.password,
            user.username,
            user.status
        );

        // Create database record
        const managerAccount = await prisma.managerAccount.upsert({
            where: { username: user.username },
            update: {},
            create: {
                username: user.username,
                password: user.hashedPassword,
                status: user.status,
                isActive: true,
            },
        });

        createdAccounts.push({
            manager: managerAccount,
            supabase: supabaseUser,
            credentials: { username: user.username, email: user.email, password: user.password }
        });

        console.log(`   ✅ Database record created for ${user.username} (ID: ${managerAccount.id})`);
    }

    console.log('\n✅ Manager accounts created successfully:');
    createdAccounts.forEach(account => {
        const { manager, supabase, credentials } = account;
        console.log(`   - ${manager.status}: ${manager.username} (DB ID: ${manager.id})`);
        if (supabase) {
            console.log(`     📧 Supabase Auth: ${credentials.email} (Auth ID: ${supabase.id})`);
        }
    });

    console.log('\n🔑 Login credentials:');
    createdAccounts.forEach(account => {
        const { credentials } = account;
        console.log(`   ${credentials.username.toUpperCase()} - Email: ${credentials.email}, Password: ${credentials.password}`);
    });

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

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📧 Admin Authentication:');
    console.log('   • Database authentication: Use username + password');
    console.log('   • Supabase authentication: Use email + password');
    console.log('   • Both systems are now synchronized');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('❌ Seeding failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });