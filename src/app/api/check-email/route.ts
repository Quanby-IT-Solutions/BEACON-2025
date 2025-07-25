import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        exists: false,
        message: "Email parameter is required"
      }, { status: 400 });
    }

    // Check if email exists in user_accounts
    const existingUser = await prisma.user_accounts.findUnique({
      where: {
        email: email
      }
    });

    return NextResponse.json({
      exists: !!existingUser,
      message: existingUser ? "Email already exists" : "Email is available"
    });

  } catch (error) {
    console.error('Email check error:', error);

    return NextResponse.json({
      exists: false,
      message: "Error checking email"
    }, { status: 500 });
  }
}