import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claimReports, healthClaims } from '@/db/schema';
import { eq, gte, lte, and, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reportType, startDate, endDate } = body;

    // Validate required fields
    if (!userId || !reportType || !startDate || !endDate) {
      return NextResponse.json({
        error: 'All fields are required: userId, reportType, startDate, endDate',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    // Validate reportType
    const validReportTypes = ['monthly', 'quarterly', 'custom'];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({
        error: 'Invalid reportType. Must be one of: monthly, quarterly, custom',
        code: 'INVALID_REPORT_TYPE'
      }, { status: 400 });
    }

    // Validate date formats
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format. Dates must be valid ISO format strings',
        code: 'INVALID_DATE_FORMAT'
      }, { status: 400 });
    }

    // Validate endDate is after or equal to startDate
    if (endDateObj < startDateObj) {
      return NextResponse.json({
        error: 'endDate must be after or equal to startDate',
        code: 'INVALID_DATE_RANGE'
      }, { status: 400 });
    }

    // Query healthClaims for the user within the date range
    const claims = await db.select()
      .from(healthClaims)
      .where(
        and(
          eq(healthClaims.userId, userId),
          gte(healthClaims.treatmentDate, startDate),
          lte(healthClaims.treatmentDate, endDate)
        )
      );

    // Calculate aggregations
    const totalClaims = claims.length;
    const totalClaimedAmount = claims.reduce((sum, claim) => sum + (claim.claimAmount || 0), 0);
    const totalApprovedAmount = claims
      .filter(claim => claim.status === 'approved' || claim.status === 'paid')
      .reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0);

    // Create report
    const newReport = await db.insert(claimReports)
      .values({
        userId,
        reportType,
        startDate,
        endDate,
        totalClaims,
        totalClaimedAmount,
        totalApprovedAmount,
        claimsData: claims,
        generatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Validate userId is provided
    if (!userId) {
      return NextResponse.json({
        error: 'userId query parameter is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Get pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query reports for the user
    const reports = await db.select()
      .from(claimReports)
      .where(eq(claimReports.userId, userId))
      .orderBy(desc(claimReports.generatedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(reports, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}