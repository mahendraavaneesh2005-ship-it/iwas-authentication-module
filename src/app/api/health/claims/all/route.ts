import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthClaims } from '@/db/schema';
import { eq, like, or, and, desc, asc } from 'drizzle-orm';

const VALID_STATUSES = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Parse filter parameters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Parse sort parameters
    const sortField = searchParams.get('sort') ?? 'submittedAt';
    const sortOrder = searchParams.get('order') ?? 'desc';
    
    // Build conditions array
    const conditions = [];
    
    // Add status filter if provided and valid
    if (status && VALID_STATUSES.includes(status)) {
      conditions.push(eq(healthClaims.status, status));
    }
    
    // Add search filter if provided
    if (search) {
      const searchPattern = `%${search}%`;
      const searchConditions = or(
        like(healthClaims.claimNumber, searchPattern),
        like(healthClaims.userId, searchPattern),
        like(healthClaims.policyId, searchPattern),
        like(healthClaims.hospitalName, searchPattern),
        like(healthClaims.doctorName, searchPattern),
        like(healthClaims.diagnosis, searchPattern)
      );
      conditions.push(searchConditions);
    }
    
    // Build the query
    let query = db.select().from(healthClaims);
    
    // Apply filters if any conditions exist
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    const sortColumn = healthClaims[sortField as keyof typeof healthClaims] || healthClaims.submittedAt;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}