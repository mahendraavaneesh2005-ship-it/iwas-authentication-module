import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthApplications } from '@/db/schema';
import { like, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract and validate required fields
    const {
      userId,
      fullName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      height,
      weight,
      smoker,
      emergencyContactName,
      emergencyContactPhone,
      preExistingConditions,
      medications,
      alcoholConsumption,
      exerciseFrequency,
      familyMedicalHistory,
      selectedPlanId,
      calculatedPremium,
    } = body;

    // Validate all required fields
    if (!userId?.trim()) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    if (!fullName?.trim()) {
      return NextResponse.json(
        { error: 'Full name is required', code: 'MISSING_FULL_NAME' },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!dateOfBirth?.trim()) {
      return NextResponse.json(
        { error: 'Date of birth is required', code: 'MISSING_DATE_OF_BIRTH' },
        { status: 400 }
      );
    }

    if (!gender?.trim()) {
      return NextResponse.json(
        { error: 'Gender is required', code: 'MISSING_GENDER' },
        { status: 400 }
      );
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { error: 'Address is required', code: 'MISSING_ADDRESS' },
        { status: 400 }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        { error: 'City is required', code: 'MISSING_CITY' },
        { status: 400 }
      );
    }

    if (!state?.trim()) {
      return NextResponse.json(
        { error: 'State is required', code: 'MISSING_STATE' },
        { status: 400 }
      );
    }

    if (!zipCode?.trim()) {
      return NextResponse.json(
        { error: 'Zip code is required', code: 'MISSING_ZIP_CODE' },
        { status: 400 }
      );
    }

    if (!height?.trim()) {
      return NextResponse.json(
        { error: 'Height is required', code: 'MISSING_HEIGHT' },
        { status: 400 }
      );
    }

    if (!weight?.trim()) {
      return NextResponse.json(
        { error: 'Weight is required', code: 'MISSING_WEIGHT' },
        { status: 400 }
      );
    }

    if (!smoker?.trim()) {
      return NextResponse.json(
        { error: 'Smoker status is required', code: 'MISSING_SMOKER' },
        { status: 400 }
      );
    }

    if (!emergencyContactName?.trim()) {
      return NextResponse.json(
        { error: 'Emergency contact name is required', code: 'MISSING_EMERGENCY_CONTACT_NAME' },
        { status: 400 }
      );
    }

    if (!emergencyContactPhone?.trim()) {
      return NextResponse.json(
        { error: 'Emergency contact phone is required', code: 'MISSING_EMERGENCY_CONTACT_PHONE' },
        { status: 400 }
      );
    }

    // Generate application number
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const applicationPrefix = `HLT-${datePrefix}-`;

    // Query existing applications for today to get the next sequence number
    const existingApplications = await db
      .select()
      .from(healthApplications)
      .where(like(healthApplications.applicationNumber, `${applicationPrefix}%`))
      .orderBy(desc(healthApplications.applicationNumber))
      .limit(1);

    let sequenceNumber = 1;
    if (existingApplications.length > 0) {
      const lastApplicationNumber = existingApplications[0].applicationNumber;
      const lastSequence = lastApplicationNumber.slice(-4);
      sequenceNumber = parseInt(lastSequence, 10) + 1;
    }

    const applicationNumber = `${applicationPrefix}${String(sequenceNumber).padStart(4, '0')}`;

    // Prepare timestamps
    const now = new Date().toISOString();

    // Prepare insert data with sanitized and validated fields
    const insertData = {
      userId: userId.trim(),
      applicationNumber,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dateOfBirth: dateOfBirth.trim(),
      gender: gender.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      height: height.trim(),
      weight: weight.trim(),
      preExistingConditions: preExistingConditions?.trim() || null,
      medications: medications?.trim() || null,
      smoker: smoker.trim(),
      alcoholConsumption: alcoholConsumption?.trim() || null,
      exerciseFrequency: exerciseFrequency?.trim() || null,
      familyMedicalHistory: familyMedicalHistory?.trim() || null,
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      status: 'pending',
      selectedPlanId: selectedPlanId || null,
      calculatedPremium: calculatedPremium || null,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    // Insert the new application
    const newApplication = await db
      .insert(healthApplications)
      .values(insertData)
      .returning();

    return NextResponse.json(newApplication[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}