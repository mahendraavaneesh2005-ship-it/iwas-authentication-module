import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims } from '@/db/schema';
import { eq, like, or, and, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Parse filter parameters
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Parse sorting parameters
    const sortField = searchParams.get('sort') ?? 'submittedAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    // Build base query
    let query = db.select().from(claims);

    // Build where conditions
    const conditions = [];

    // Apply status filter
    if (status) {
      const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];
      if (validStatuses.includes(status)) {
        conditions.push(eq(claims.status, status));
      }
    }

    // Apply search filter
    if (search) {
      conditions.push(
        or(
          like(claims.claimNumber, `%${search}%`),
          like(claims.userId, `%${search}%`),
          like(claims.policyId, `%${search}%`),
          like(claims.incidentDescription, `%${search}%`)
        )
      );
    }

    // Combine all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    const sortColumn = sortField === 'submittedAt' ? claims.submittedAt :
                      sortField === 'status' ? claims.status :
                      sortField === 'estimatedCost' ? claims.estimatedCost :
                      sortField === 'createdAt' ? claims.createdAt :
                      claims.submittedAt;

    if (sortOrder === 'asc') {
      query = query.orderBy(asc(sortColumn));
    } else {
      query = query.orderBy(desc(sortColumn));
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    // Execute query
    const results = await query;

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}