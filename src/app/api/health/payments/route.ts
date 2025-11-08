import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthApplications, healthPlans, healthPolicies } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, paymentMethod, paymentAmount, userId } = body;

    // Validation: Check all required fields
    if (!applicationId) {
      return NextResponse.json({
        error: 'Application ID is required',
        code: 'MISSING_APPLICATION_ID'
      }, { status: 400 });
    }

    if (!paymentMethod) {
      return NextResponse.json({
        error: 'Payment method is required',
        code: 'MISSING_PAYMENT_METHOD'
      }, { status: 400 });
    }

    if (paymentAmount === undefined || paymentAmount === null) {
      return NextResponse.json({
        error: 'Payment amount is required',
        code: 'MISSING_PAYMENT_AMOUNT'
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      }, { status: 400 });
    }

    // Validate applicationId is a valid integer
    const parsedApplicationId = parseInt(String(applicationId));
    if (isNaN(parsedApplicationId)) {
      return NextResponse.json({
        error: 'Application ID must be a valid integer',
        code: 'INVALID_APPLICATION_ID'
      }, { status: 400 });
    }

    // Validate paymentAmount is a positive number
    const parsedPaymentAmount = parseFloat(String(paymentAmount));
    if (isNaN(parsedPaymentAmount) || parsedPaymentAmount <= 0) {
      return NextResponse.json({
        error: 'Payment amount must be a positive number',
        code: 'INVALID_PAYMENT_AMOUNT'
      }, { status: 400 });
    }

    // Fetch the application
    const application = await db.select()
      .from(healthApplications)
      .where(eq(healthApplications.id, parsedApplicationId))
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json({
        error: 'Application not found',
        code: 'APPLICATION_NOT_FOUND'
      }, { status: 404 });
    }

    const app = application[0];

    // Verify application belongs to the provided userId
    if (app.userId !== userId) {
      return NextResponse.json({
        error: 'You are not authorized to access this application',
        code: 'UNAUTHORIZED_ACCESS'
      }, { status: 403 });
    }

    // Verify application has selectedPlanId and calculatedPremium
    if (!app.selectedPlanId) {
      return NextResponse.json({
        error: 'Application does not have a selected plan',
        code: 'NO_SELECTED_PLAN'
      }, { status: 400 });
    }

    if (!app.calculatedPremium) {
      return NextResponse.json({
        error: 'Application does not have a calculated premium',
        code: 'NO_CALCULATED_PREMIUM'
      }, { status: 400 });
    }

    // Verify paymentAmount matches calculatedPremium
    if (Math.abs(parsedPaymentAmount - app.calculatedPremium) > 0.01) {
      return NextResponse.json({
        error: `Payment amount ${parsedPaymentAmount} does not match calculated premium ${app.calculatedPremium}`,
        code: 'PAYMENT_AMOUNT_MISMATCH'
      }, { status: 400 });
    }

    // Fetch the plan details
    const plan = await db.select()
      .from(healthPlans)
      .where(eq(healthPlans.id, app.selectedPlanId))
      .limit(1);

    if (plan.length === 0) {
      return NextResponse.json({
        error: 'Selected health plan not found',
        code: 'PLAN_NOT_FOUND'
      }, { status: 404 });
    }

    const selectedPlan = plan[0];

    // Generate unique policy number: HP-YYYYMMDD-####
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const policyPrefix = `HP-${datePrefix}-`;

    // Query existing policies with same date prefix
    const existingPolicies = await db.select()
      .from(healthPolicies)
      .where(like(healthPolicies.policyNumber, `${policyPrefix}%`))
      .orderBy(desc(healthPolicies.policyNumber));

    let sequenceNumber = 1;
    if (existingPolicies.length > 0) {
      const lastPolicyNumber = existingPolicies[0].policyNumber;
      const lastSequence = lastPolicyNumber.split('-')[2];
      sequenceNumber = parseInt(lastSequence) + 1;
    }

    const policyNumber = `${policyPrefix}${String(sequenceNumber).padStart(4, '0')}`;

    // Calculate dates
    const startDate = now.toISOString();
    const endDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
    const renewalDate = endDate;
    const timestamp = now.toISOString();

    // Create health policy
    const newPolicy = await db.insert(healthPolicies)
      .values({
        userId: app.userId,
        applicationId: parsedApplicationId,
        planId: app.selectedPlanId,
        policyNumber,
        policyholderName: app.fullName,
        email: app.email,
        monthlyPremium: app.calculatedPremium,
        coverageAmount: selectedPlan.coverageAmount,
        startDate,
        endDate,
        renewalDate,
        status: 'active',
        paymentStatus: 'paid',
        renewalReminderSent: 'no',
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .returning();

    // Update health application status
    await db.update(healthApplications)
      .set({
        status: 'approved',
        updatedAt: timestamp,
      })
      .where(eq(healthApplications.id, parsedApplicationId));

    return NextResponse.json(newPolicy[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error as Error).message
    }, { status: 500 });
  }
}