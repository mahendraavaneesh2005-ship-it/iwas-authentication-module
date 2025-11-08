import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ 
        error: "userId parameter is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select().from(claims).where(eq(claims.userId, userId));

    if (search) {
      query = query.where(
        or(
          like(claims.claimNumber, `%${search}%`),
          like(claims.incidentDescription, `%${search}%`),
          like(claims.incidentLocation, `%${search}%`)
        )
      );
    }

    const results = await query
      .orderBy(desc(claims.submittedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      policyId, 
      incidentDate, 
      incidentDescription, 
      incidentLocation, 
      damageDescription, 
      estimatedCost,
      documents,
      photos
    } = body;

    if (!userId) {
      return NextResponse.json({ 
        error: "userId is required",
        code: "MISSING_USER_ID" 
      }, { status: 400 });
    }

    if (!policyId) {
      return NextResponse.json({ 
        error: "policyId is required",
        code: "MISSING_POLICY_ID" 
      }, { status: 400 });
    }

    if (!incidentDate) {
      return NextResponse.json({ 
        error: "incidentDate is required",
        code: "MISSING_INCIDENT_DATE" 
      }, { status: 400 });
    }

    if (!incidentDescription) {
      return NextResponse.json({ 
        error: "incidentDescription is required",
        code: "MISSING_INCIDENT_DESCRIPTION" 
      }, { status: 400 });
    }

    if (!incidentLocation) {
      return NextResponse.json({ 
        error: "incidentLocation is required",
        code: "MISSING_INCIDENT_LOCATION" 
      }, { status: 400 });
    }

    if (!damageDescription) {
      return NextResponse.json({ 
        error: "damageDescription is required",
        code: "MISSING_DAMAGE_DESCRIPTION" 
      }, { status: 400 });
    }

    if (estimatedCost === undefined || estimatedCost === null) {
      return NextResponse.json({ 
        error: "estimatedCost is required",
        code: "MISSING_ESTIMATED_COST" 
      }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const yearPrefix = `CLM-${currentYear}-`;

    const existingClaims = await db.select()
      .from(claims)
      .where(like(claims.claimNumber, `${yearPrefix}%`))
      .orderBy(desc(claims.claimNumber))
      .limit(1);

    let sequenceNumber = 1;
    if (existingClaims.length > 0) {
      const lastClaimNumber = existingClaims[0].claimNumber;
      const lastSequence = parseInt(lastClaimNumber.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }

    const claimNumber = `${yearPrefix}${sequenceNumber.toString().padStart(3, '0')}`;
    const currentTimestamp = new Date().toISOString();

    const newClaim = await db.insert(claims)
      .values({
        userId: userId.trim(),
        policyId: policyId.trim(),
        claimNumber,
        incidentDate: incidentDate.trim(),
        incidentDescription: incidentDescription.trim(),
        incidentLocation: incidentLocation.trim(),
        damageDescription: damageDescription.trim(),
        estimatedCost: parseFloat(estimatedCost),
        documents: documents || null,
        photos: photos || null,
        status: 'submitted',
        submittedAt: currentTimestamp,
        createdAt: currentTimestamp,
        updatedAt: currentTimestamp
      })
      .returning();

    return NextResponse.json(newClaim[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}