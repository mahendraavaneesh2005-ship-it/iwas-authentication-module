import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthPolicies, healthPlans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Validation: userId is required
    if (!userId) {
      return NextResponse.json(
        {
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Query with join to get policy and plan details
    const policies = await db
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
          updatedAt: healthPlans.updatedAt
        }
      })
      .from(healthPolicies)
      .leftJoin(healthPlans, eq(healthPolicies.planId, healthPlans.id))
      .where(eq(healthPolicies.userId, userId))
      .orderBy(desc(healthPolicies.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(policies, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message
      },
      { status: 500 }
    );
  }
}