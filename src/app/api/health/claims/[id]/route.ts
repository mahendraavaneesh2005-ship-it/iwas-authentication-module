import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthClaims } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const claimId = parseInt(id);

    const claim = await db
      .select()
      .from(healthClaims)
      .where(eq(healthClaims.id, claimId))
      .limit(1);

    if (claim.length === 0) {
      return NextResponse.json(
        { error: 'Health claim not found', code: 'CLAIM_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(claim[0], { status: 200 });
  } catch (error) {
    console.error('GET health claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const claimId = parseInt(id);

    const body = await request.json();

    const allowedFields = [
      'status',
      'reviewedAt',
      'reviewedBy',
      'approvedAmount',
      'rejectionReason',
      'adminNotes',
    ];

    const providedFields = Object.keys(body).filter((key) =>
      allowedFields.includes(key)
    );

    if (providedFields.length === 0) {
      return NextResponse.json(
        {
          error: 'At least one valid field must be provided for update',
          code: 'NO_VALID_FIELDS',
        },
        { status: 400 }
      );
    }

    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const existingClaim = await db
      .select()
      .from(healthClaims)
      .where(eq(healthClaims.id, claimId))
      .limit(1);

    if (existingClaim.length === 0) {
      return NextResponse.json(
        { error: 'Health claim not found', code: 'CLAIM_NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: Record<string, any> = {};

    if (body.status !== undefined) updates.status = body.status;
    if (body.reviewedAt !== undefined) updates.reviewedAt = body.reviewedAt;
    if (body.reviewedBy !== undefined) updates.reviewedBy = body.reviewedBy;
    if (body.approvedAmount !== undefined) updates.approvedAmount = body.approvedAmount;
    if (body.rejectionReason !== undefined) updates.rejectionReason = body.rejectionReason;
    if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;

    const reviewStatuses = ['under_review', 'approved', 'rejected', 'paid'];
    if (
      body.status &&
      reviewStatuses.includes(body.status) &&
      !existingClaim[0].reviewedAt &&
      !body.reviewedAt
    ) {
      updates.reviewedAt = new Date().toISOString();
    }

    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(healthClaims)
      .set(updates)
      .where(eq(healthClaims.id, claimId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update health claim', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PATCH health claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}