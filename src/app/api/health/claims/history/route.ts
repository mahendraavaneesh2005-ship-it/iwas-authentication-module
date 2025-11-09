import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthClaims } from '@/db/schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';

const VALID_STATUSES = ['submitted', 'under_review', 'approved', 'rejected', 'paid'];

export async function GET(request: NextRequest) {
  try {
    // Extract and validate Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_AUTH' 
        },
        { status: 401 }
      );
    }

    // Validate Bearer token format
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_AUTH' 
        },
        { status: 401 }
      );
    }

    // Extract userId from token
    const userId = authHeader.substring(7).trim();
    
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'Invalid authentication token',
          code: 'INVALID_AUTH' 
        },
        { status: 401 }
      );
    }

    // Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { 
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
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
          { 
            error: 'Invalid startDate format. Must be a valid ISO date string',
            code: 'INVALID_START_DATE'
          },
          { status: 400 }
        );
      }
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      if (isNaN(endDateObj.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid endDate format. Must be a valid ISO date string',
            code: 'INVALID_END_DATE'
          },
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
          { 
            error: 'endDate must be greater than or equal to startDate',
            code: 'INVALID_DATE_RANGE'
          },
          { status: 400 }
        );
      }
    }

    // Build query conditions
    const conditions = [eq(healthClaims.userId, userId)];

    if (status) {
      conditions.push(eq(healthClaims.status, status));
    }

    if (startDate) {
      conditions.push(gte(healthClaims.submittedAt, startDate));
    }

    if (endDate) {
      conditions.push(lte(healthClaims.submittedAt, endDate));
    }

    // Execute query with all conditions
    const results = await db.select()
      .from(healthClaims)
      .where(and(...conditions))
      .orderBy(desc(healthClaims.submittedAt))
      .limit(limit)
      .offset(offset);

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