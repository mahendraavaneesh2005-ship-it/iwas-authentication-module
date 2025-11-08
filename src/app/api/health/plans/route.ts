import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthPlans } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const plans = await db.select()
      .from(healthPlans)
      .orderBy(asc(healthPlans.id));

    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}