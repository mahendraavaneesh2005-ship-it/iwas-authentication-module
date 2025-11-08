import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const claim = await db
      .select()
      .from(claims)
      .where(eq(claims.id, parseInt(id)))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(claim[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { params } = context;
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields = [
      'status',
      'reviewedAt',
      'reviewedBy',
      'approvedAmount',
      'rejectionReason',
      'adminNotes'
    ];

    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields provided for update', code: 'NO_FIELDS' },
        { status: 400 }
      );
    }

    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    const existingClaim = await db
      .select()
      .from(claims)
      .where(eq(claims.id, parseInt(id)))
      .limit(1);

    if (existingClaim.length === 0) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    const reviewStatuses = ['under_review', 'approved', 'rejected', 'paid'];
    if (
      updates.status &&
      reviewStatuses.includes(updates.status) &&
      !existingClaim[0].reviewedAt &&
      !updates.reviewedAt
    ) {
      updates.reviewedAt = new Date().toISOString();
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(claims)
      .set(updates)
      .where(eq(claims.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update claim' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}