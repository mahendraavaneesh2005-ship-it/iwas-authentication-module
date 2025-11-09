import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims } from '@/db/schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Authentication: Extract userId from Bearer token
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'MISSING_AUTH' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7).trim();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid authentication token', code: 'INVALID_AUTH' },
        { status: 401 }
      );
    }

    const userId = token;

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate status if provided
    const validStatuses = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Validate date formats if provided
    if (startDate) {
      const startDateObj = new Date(startDate);
      if (isNaN(startDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid startDate format. Must be a valid ISO date string', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Invalid endDate format. Must be a valid ISO date string', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }
    }

    // Validate endDate >= startDate if both provided
    if (startDate && endDate) {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      if (endDateObj < startDateObj) {
        return NextResponse.json(
          { error: 'endDate must be greater than or equal to startDate', code: 'INVALID_DATE_RANGE' },
          { status: 400 }
        );
      }
    }

    // Build query conditions
    const conditions = [eq(claims.userId, userId)];

    // Add status filter if provided
    if (status) {
      conditions.push(eq(claims.status, status));
    }

    // Add date range filters if provided
    if (startDate) {
      conditions.push(gte(claims.submittedAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(claims.submittedAt, endDate));
    }

    // Execute query with all conditions
    const results = await db
      .select()
      .from(claims)
      .where(and(...conditions))
      .orderBy(desc(claims.submittedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}