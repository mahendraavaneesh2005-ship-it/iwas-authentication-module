import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthPolicies, healthPlans } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate userId is provided
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID' 
        },
        { status: 400 }
      );
    }

    // Query database with LEFT JOIN to healthPlans
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
          updatedAt: healthPlans.updatedAt,
        },
      })
      .from(healthPolicies)
      .leftJoin(healthPlans, eq(healthPolicies.planId, healthPlans.id))
      .where(eq(healthPolicies.userId, userId))
      .orderBy(asc(healthPolicies.endDate));

    // Filter for policies expiring within the next 30 days
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringPolicies = policies.filter((policy) => {
      const endDate = new Date(policy.endDate);
      return endDate <= thirtyDaysFromNow && endDate >= now;
    });

    // Add daysUntilExpiry to each policy
    const enhancedPolicies = expiringPolicies.map((policy) => {
      const endDate = new Date(policy.endDate);
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...policy,
        daysUntilExpiry,
      };
    });

    return NextResponse.json(enhancedPolicies, { status: 200 });
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