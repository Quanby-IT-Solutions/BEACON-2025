import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for temporary registration data
// In production, use Redis or database for this
const tempRegistrationData = new Map();

// Store temporary registration data
export async function POST(request: NextRequest) {
  try {
    const { registrationRef, formData, selectedEvents } = await request.json();

    if (!registrationRef || !formData || !selectedEvents) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Store with 1 hour expiration
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    tempRegistrationData.set(registrationRef, {
      formData,
      selectedEvents,
      expiresAt,
      createdAt: Date.now()
    });

    console.log(`Stored temporary registration data for ref: ${registrationRef}`);

    return NextResponse.json({
      success: true,
      message: 'Registration data stored temporarily'
    });

  } catch (error) {
    console.error('Error storing temp registration data:', error);
    return NextResponse.json(
      { error: 'Failed to store registration data' },
      { status: 500 }
    );
  }
}

// Retrieve temporary registration data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationRef = searchParams.get('registrationRef');

    if (!registrationRef) {
      return NextResponse.json(
        { error: 'Registration reference is required' },
        { status: 400 }
      );
    }

    const data = tempRegistrationData.get(registrationRef);

    if (!data) {
      return NextResponse.json(
        { error: 'Registration data not found or expired' },
        { status: 404 }
      );
    }

    // Check if expired
    if (Date.now() > data.expiresAt) {
      tempRegistrationData.delete(registrationRef);
      return NextResponse.json(
        { error: 'Registration data expired' },
        { status: 404 }
      );
    }

    console.log(`Retrieved temporary registration data for ref: ${registrationRef}`);

    return NextResponse.json({
      success: true,
      data: {
        formData: data.formData,
        selectedEvents: data.selectedEvents
      }
    });

  } catch (error) {
    console.error('Error retrieving temp registration data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve registration data' },
      { status: 500 }
    );
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tempRegistrationData.entries()) {
    if (now > value.expiresAt) {
      tempRegistrationData.delete(key);
      console.log(`Cleaned up expired registration data: ${key}`);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes