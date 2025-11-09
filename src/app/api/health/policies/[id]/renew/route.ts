import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthPolicies, healthPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Validate id parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const { userId } = body;

    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          error: 'User ID is required',
          code: 'MISSING_USER_ID',
        },
        { status: 400 }
      );
    }

    // 3. Fetch policy from database
    const policyResult = await db
      .select()
      .from(healthPolicies)
      .where(eq(healthPolicies.id, parseInt(id)))
      .limit(1);

    if (policyResult.length === 0) {
      return NextResponse.json(
        {
          error: 'Policy not found',
        },
        { status: 404 }
      );
    }

    const policy = policyResult[0];

    // 4. Verify policy ownership
    if (policy.userId !== userId) {
      return NextResponse.json(
        {
          error: 'You are not authorized to renew this policy',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // 5. Verify policy status
    if (policy.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Only active policies can be renewed',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // 6. Verify renewal window (60 days before or after expiry)
    const now = new Date();
    const endDate = new Date(policy.endDate);
    const daysDifference = Math.ceil(
      (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDifference < -60 || daysDifference > 60) {
      return NextResponse.json(
        {
          error: 'Policy can only be renewed within 60 days of expiry date',
          code: 'OUTSIDE_RENEWAL_WINDOW',
        },
        { status: 400 }
      );
    }

    // Renewal Actions
    // 1. Calculate new dates
    const currentEndDate = new Date(policy.endDate);
    const newEndDate = new Date(
      currentEndDate.setFullYear(currentEndDate.getFullYear() + 1)
    ).toISOString();

    const renewalDateBase = new Date();
    const newRenewalDate = new Date(
      renewalDateBase.setFullYear(renewalDateBase.getFullYear() + 1)
    ).toISOString();

    // 2. Update policy in database
    const updatedPolicyResult = await db
      .update(healthPolicies)
      .set({
        endDate: newEndDate,
        renewalDate: newRenewalDate,
        renewalReminderSent: 'no',
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString(),
      })
      .where(eq(healthPolicies.id, parseInt(id)))
      .returning();

    // 3. Fetch complete policy with plan details
    const completePolicy = await db
      .select({
        id: healthPolicies.id,
        userId: healthPolicies.userId,
        applicationId: healthPolicies.applicationId,
        planId: healthPolicies.planId,
        policyNumber: healthPolicies.policyNumber,
        policyholderName: healthPolicies.policyholderName,
        email: healthPolicies.email,
        monthlyPremium: healthPolicies.monthlyPremium,
        coverageAmount: healthPolicies.coverageAmount,
        startDate: healthPolicies.startDate,
        endDate: healthPolicies.endDate,
        status: healthPolicies.status,
        paymentStatus: healthPolicies.paymentStatus,
        renewalDate: healthPolicies.renewalDate,
        renewalReminderSent: healthPolicies.renewalReminderSent,
        createdAt: healthPolicies.createdAt,
        updatedAt: healthPolicies.updatedAt,
        plan: {
          id: healthPlans.id,
          name: healthPlans.name,
          description: healthPlans.description,
          coverageAmount: healthPlans.coverageAmount,
          monthlyPremiumBase: healthPlans.monthlyPremiumBase,
          features: healthPlans.features,
          deductible: healthPlans.deductible,
          copayPercentage: healthPlans.copayPercentage,
          createdAt: healthPlans.createdAt,
          updatedAt: healthPlans.updatedAt,
        },
      })
      .from(healthPolicies)
      .leftJoin(healthPlans, eq(healthPolicies.planId, healthPlans.id))
      .where(eq(healthPolicies.id, parseInt(id)))
      .limit(1);

    return NextResponse.json(completePolicy[0], { status: 200 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}