import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claimReports } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract and validate Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'MISSING_AUTH'
        },
        { status: 401 }
      );
    }

    // Extract userId from token (token format is the userId itself after "Bearer ")
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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query claimReports filtered by userId, sorted by generatedAt DESC, with pagination
    const reports = await db.select()
      .from(claimReports)
      .where(eq(claimReports.userId, userId))
      .orderBy(desc(claimReports.generatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(reports, { status: 200 });

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