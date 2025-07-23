import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createSession } from '@/lib/adminSessions';

const prisma = new PrismaClient();

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);

    // Find admin user
    const admin = await prisma.managerAccount.findFirst({
      where: {
        username,
        isActive: true,
      },
    });

    console.log('Login attempt:', { username, foundAdmin: !!admin });

    if (!admin) {
      console.log('Admin not found for username:', username);
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }

    // Verify password
    console.log('Comparing password for user:', username);
    const isValidPassword = await bcrypt.compare(password, admin.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Password mismatch for user:', username);
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
      }, { status: 401 });
    }
    // Generate simple session token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 hours

    // Store session
    createSession(token, {
      adminId: admin.id,
      username: admin.username,
      status: admin.status,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin.id,
          username: admin.username,
          status: admin.status,
          isActive: admin.isActive,
        },
        token,
        expiresAt
      },
    });

  } catch (error) {
    console.error('Admin login error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: error.issues,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}