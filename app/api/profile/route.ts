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
  // prefer user.id if available, else email
  return (session.user.email as string);
}

export async function GET() {
  await connectDB();
  const userId = await getUserIdFromSession();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const profile = await Profile.findOne({ userId }).lean();
  return NextResponse.json(profile ?? {});
}

export async function POST(request: Request) {
  await connectDB();
  const userId = await getUserIdFromSession();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await request.json();
  const parse = ProfileInputSchema.safeParse(payload);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });

  // prevent duplicate creation
  const existing = await Profile.findOne({ userId });
  if (existing)
    return NextResponse.json(
      { error: 'Profile already exists' },
      { status: 400 }
    );

  const profile = await Profile.create({ userId, ...parse.data });
  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  await connectDB();
  const userId = await getUserIdFromSession();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = await request.json();
  const parse = ProfileInputSchema.safeParse(payload);
  if (!parse.success)
    return NextResponse.json({ error: parse.error.format() }, { status: 400 });

  // Upsert: update if exists else create
  const profile = await Profile.findOneAndUpdate(
    { userId },
    { $set: parse.data },
    { new: true, upsert: true }
  );
  return NextResponse.json(profile);
}

export async function DELETE() {
  await connectDB();
  const userId = await getUserIdFromSession();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await Profile.findOneAndDelete({ userId });
  return NextResponse.json({ success: true });
}
