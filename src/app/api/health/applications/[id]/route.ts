import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthApplications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid application ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Validate userId query parameter
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required for authorization',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query application by ID
    const application = await db.select()
      .from(healthApplications)
      .where(eq(healthApplications.id, parseInt(id)))
      .limit(1);

    // Check if application exists
    if (application.length === 0) {
      return NextResponse.json(
        { 
          error: 'Health application not found',
          code: 'APPLICATION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify userId matches application owner (authorization check)
    if (application[0].userId !== userId) {
      return NextResponse.json(
        { 
          error: 'Access denied: You do not have permission to view this application',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Return the complete application object
    return NextResponse.json(application[0], { status: 200 });

  } catch (error) {
    console.error('GET health application error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
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
    const body = await request.json();

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid application ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const parsedId = parseInt(id);

    // Check if application exists
    const existingApplication = await db.select()
      .from(healthApplications)
      .where(eq(healthApplications.id, parsedId))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json(
        { 
          error: 'Health application not found',
          code: 'APPLICATION_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    // Only update fields that are provided
    if (body.selectedPlanId !== undefined) {
      updateData.selectedPlanId = body.selectedPlanId;
    }

    if (body.calculatedPremium !== undefined) {
      updateData.calculatedPremium = body.calculatedPremium;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    // Update the application
    const updatedApplication = await db.update(healthApplications)
      .set(updateData)
      .where(eq(healthApplications.id, parsedId))
      .returning();

    return NextResponse.json(updatedApplication[0], { status: 200 });

  } catch (error) {
    console.error('PATCH health application error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}