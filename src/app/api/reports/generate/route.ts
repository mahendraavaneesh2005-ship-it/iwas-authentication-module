import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { claims, healthClaims, claimReports } from '@/db/schema';
import { eq, gte, lte, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Authentication - Extract userId from Authorization header
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

    const token = authHeader.substring(7).trim();
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Invalid authentication token',
          code: 'INVALID_AUTH'
        },
        { status: 401 }
      );
    }

    const userId = token;

    // Parse request body
    const body = await request.json();
    const { reportType, startDate, endDate } = body;

    // Validate reportType
    if (!reportType) {
      return NextResponse.json(
        { 
          error: 'Report type is required',
          code: 'MISSING_REPORT_TYPE'
        },
        { status: 400 }
      );
    }

    const validReportTypes = ['health', 'insurance', 'all'];
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json(
        { 
          error: 'Report type must be one of: health, insurance, all',
          code: 'INVALID_REPORT_TYPE'
        },
        { status: 400 }
      );
    }

    // Validate startDate
    if (!startDate) {
      return NextResponse.json(
        { 
          error: 'Start date is required',
          code: 'MISSING_START_DATE'
        },
        { status: 400 }
      );
    }

    const startDateObj = new Date(startDate);
    if (isNaN(startDateObj.getTime())) {
      return NextResponse.json(
        { 
          error: 'Start date must be a valid ISO date format',
          code: 'INVALID_START_DATE'
        },
        { status: 400 }
      );
    }

    // Validate endDate
    if (!endDate) {
      return NextResponse.json(
        { 
          error: 'End date is required',
          code: 'MISSING_END_DATE'
        },
        { status: 400 }
      );
    }

    const endDateObj = new Date(endDate);
    if (isNaN(endDateObj.getTime())) {
      return NextResponse.json(
        { 
          error: 'End date must be a valid ISO date format',
          code: 'INVALID_END_DATE'
        },
        { status: 400 }
      );
    }

    // Validate endDate >= startDate
    if (endDateObj < startDateObj) {
      return NextResponse.json(
        { 
          error: 'End date must be greater than or equal to start date',
          code: 'INVALID_DATE_RANGE'
        },
        { status: 400 }
      );
    }

    // Query claims based on reportType
    let allClaims: any[] = [];
    let totalClaims = 0;
    let totalClaimedAmount = 0;
    let totalApprovedAmount = 0;

    if (reportType === 'insurance' || reportType === 'all') {
      const insuranceClaims = await db.select()
        .from(claims)
        .where(
          and(
            eq(claims.userId, userId),
            gte(claims.submittedAt, startDate),
            lte(claims.submittedAt, endDate)
          )
        );

      allClaims = [...allClaims, ...insuranceClaims];
      
      for (const claim of insuranceClaims) {
        totalClaimedAmount += claim.estimatedCost || 0;
        if (claim.status === 'approved' || claim.status === 'paid') {
          totalApprovedAmount += claim.approvedAmount || 0;
        }
      }
    }

    if (reportType === 'health' || reportType === 'all') {
      const healthClaimsResults = await db.select()
        .from(healthClaims)
        .where(
          and(
            eq(healthClaims.userId, userId),
            gte(healthClaims.submittedAt, startDate),
            lte(healthClaims.submittedAt, endDate)
          )
        );

      allClaims = [...allClaims, ...healthClaimsResults];
      
      for (const claim of healthClaimsResults) {
        totalClaimedAmount += claim.claimAmount || 0;
        if (claim.status === 'approved' || claim.status === 'paid') {
          totalApprovedAmount += claim.approvedAmount || 0;
        }
      }
    }

    totalClaims = allClaims.length;

    // Insert into claimReports table
    const newReport = await db.insert(claimReports)
      .values({
        userId,
        reportType,
        startDate,
        endDate,
        totalClaims,
        totalClaimedAmount,
        totalApprovedAmount,
        claimsData: allClaims,
        generatedAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newReport[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error as Error).message 
      },
      { status: 500 }
    );
  }
}