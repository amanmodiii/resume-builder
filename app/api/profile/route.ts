// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/app/lib/mongoose';
import Profile from '@/app/models/Profile';
import { ProfileInputSchema } from '@/app/lib/validators/profile';

async function getUserIdFromSession() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return null;
  return session.user.email as string;
}

export async function GET() {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await Profile.findOne({ userId }).lean();

    // Return empty object if no profile exists
    if (!profile) {
      return NextResponse.json({});
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json();
    const parse = ProfileInputSchema.safeParse(payload);

    if (!parse.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parse.error.format(),
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existing = await Profile.findOne({ userId });
    if (existing) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    const profile = await Profile.create({ userId, ...parse.data });
    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await request.json();
    const parse = ProfileInputSchema.safeParse(payload);

    if (!parse.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parse.error.format(),
        },
        { status: 400 }
      );
    }

    // Upsert: update if exists, create if not
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: { ...parse.data, userId } },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await connectDB();
    const userId = await getUserIdFromSession();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await Profile.findOneAndDelete({ userId });

    if (!result) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile deleted successfully',
    });
  } catch (error: any) {
    console.error('DELETE /api/profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
