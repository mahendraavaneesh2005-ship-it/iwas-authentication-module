import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthClaims } from '@/db/schema';
import { eq, like, or, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      userId,
      policyId,
      treatmentDate,
      hospitalName,
      doctorName,
      diagnosis,
      treatmentDescription,
      claimAmount,
      documents
    } = body;

    // Validate required fields
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    if (!policyId || typeof policyId !== 'string' || policyId.trim() === '') {
      return NextResponse.json({
        error: 'Policy ID is required',
        code: 'MISSING_POLICY_ID'
      }, { status: 400 });
    }

    if (!treatmentDate || typeof treatmentDate !== 'string' || treatmentDate.trim() === '') {
      return NextResponse.json({
        error: 'Treatment date is required',
        code: 'MISSING_TREATMENT_DATE'
      }, { status: 400 });
    }

    if (!hospitalName || typeof hospitalName !== 'string' || hospitalName.trim() === '') {
      return NextResponse.json({
        error: 'Hospital name is required',
        code: 'MISSING_HOSPITAL_NAME'
      }, { status: 400 });
    }

    if (!doctorName || typeof doctorName !== 'string' || doctorName.trim() === '') {
      return NextResponse.json({
        error: 'Doctor name is required',
        code: 'MISSING_DOCTOR_NAME'
      }, { status: 400 });
    }

    if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim() === '') {
      return NextResponse.json({
        error: 'Diagnosis is required',
        code: 'MISSING_DIAGNOSIS'
      }, { status: 400 });
    }

    if (!treatmentDescription || typeof treatmentDescription !== 'string' || treatmentDescription.trim() === '') {
      return NextResponse.json({
        error: 'Treatment description is required',
        code: 'MISSING_TREATMENT_DESCRIPTION'
      }, { status: 400 });
    }

    if (claimAmount === undefined || claimAmount === null || typeof claimAmount !== 'number') {
      return NextResponse.json({
        error: 'Claim amount is required',
        code: 'MISSING_CLAIM_AMOUNT'
      }, { status: 400 });
    }

    if (claimAmount <= 0) {
      return NextResponse.json({
        error: 'Claim amount must be a positive number',
        code: 'INVALID_CLAIM_AMOUNT'
      }, { status: 400 });
    }

    // Generate claim number
    const currentYear = new Date().getFullYear();
    const claimPrefix = `HCL-${currentYear}-`;

    // Get existing claims with the same prefix
    const existingClaims = await db.select()
      .from(healthClaims)
      .where(like(healthClaims.claimNumber, `${claimPrefix}%`));

    // Find the highest sequence number
    let maxSequence = 0;
    for (const claim of existingClaims) {
      const parts = claim.claimNumber.split('-');
      if (parts.length === 3) {
        const sequence = parseInt(parts[2], 10);
        if (!isNaN(sequence) && sequence > maxSequence) {
          maxSequence = sequence;
        }
      }
    }

    // Increment and format sequence number
    const nextSequence = maxSequence + 1;
    const claimNumber = `${claimPrefix}${nextSequence.toString().padStart(3, '0')}`;

    // Prepare timestamps
    const now = new Date().toISOString();

    // Prepare insert data
    const insertData = {
      userId: userId.trim(),
      policyId: policyId.trim(),
      claimNumber,
      treatmentDate: treatmentDate.trim(),
      hospitalName: hospitalName.trim(),
      doctorName: doctorName.trim(),
      diagnosis: diagnosis.trim(),
      treatmentDescription: treatmentDescription.trim(),
      claimAmount,
      documents: documents || null,
      status: 'submitted',
      submittedAt: now,
      reviewedAt: null,
      reviewedBy: null,
      approvedAmount: null,
      rejectionReason: null,
      adminNotes: null,
      createdAt: now,
      updatedAt: now
    };

    // Insert into database
    const newClaim = await db.insert(healthClaims)
      .values(insertData)
      .returning();

    return NextResponse.json(newClaim[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const userId = searchParams.get('userId');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const search = searchParams.get('search');

    // Validate userId is required
    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Parse pagination parameters
    const limit = Math.min(parseInt(limitParam ?? '10'), 100);
    const offset = parseInt(offsetParam ?? '0');

    // Build query
    let query = db.select()
      .from(healthClaims)
      .where(eq(healthClaims.userId, userId));

    // Apply search if provided
    if (search && search.trim() !== '') {
      const searchTerm = `%${search}%`;
      const searchCondition = or(
        like(healthClaims.claimNumber, searchTerm),
        like(healthClaims.hospitalName, searchTerm),
        like(healthClaims.doctorName, searchTerm),
        like(healthClaims.diagnosis, searchTerm)
      );
      
      // Rebuild query with search condition
      query = db.select()
        .from(healthClaims)
        .where(eq(healthClaims.userId, userId));
      
      // Note: Due to Drizzle limitations, we need to fetch and filter
      const allUserClaims = await query;
      
      const filteredClaims = allUserClaims.filter(claim => {
        const searchLower = search.toLowerCase();
        return (
          claim.claimNumber.toLowerCase().includes(searchLower) ||
          claim.hospitalName.toLowerCase().includes(searchLower) ||
          claim.doctorName.toLowerCase().includes(searchLower) ||
          claim.diagnosis.toLowerCase().includes(searchLower)
        );
      });

      // Sort by submittedAt DESC
      filteredClaims.sort((a, b) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      // Apply pagination
      const paginatedResults = filteredClaims.slice(offset, offset + limit);
      
      return NextResponse.json(paginatedResults, { status: 200 });
    }

    // No search - fetch with pagination and sorting
    const results = await query
      .orderBy(desc(healthClaims.submittedAt))
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