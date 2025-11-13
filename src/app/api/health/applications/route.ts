import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthApplications } from '@/db/schema';
import { like, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Destructure fields
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

    // Basic validation for required string fields
    const requiredFields = [
      { key: 'userId', value: userId },
      { key: 'fullName', value: fullName },
      { key: 'email', value: email },
      { key: 'phone', value: phone },
      { key: 'dateOfBirth', value: dateOfBirth },
      { key: 'gender', value: gender },
      { key: 'address', value: address },
      { key: 'city', value: city },
      { key: 'state', value: state },
      { key: 'zipCode', value: zipCode },
      { key: 'height', value: height },
      { key: 'weight', value: weight },
      { key: 'smoker', value: smoker },
      { key: 'emergencyContactName', value: emergencyContactName },
      { key: 'emergencyContactPhone', value: emergencyContactPhone },
    ];

    for (const field of requiredFields) {
      if (!field.value || typeof field.value !== 'string' || !field.value.trim()) {
        return NextResponse.json(
          { error: `${field.key} is required`, code: `MISSING_${field.key.toUpperCase()}` },
          { status: 400 },
        );
      }
    }

    // Generate application number with date prefix and sequence
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;
    const applicationPrefix = `HLT-${datePrefix}-`;

    // Find last application number for today
    const existingApplications = await db
      .select()
      .from(healthApplications)
      .where(like(healthApplications.applicationNumber, `${applicationPrefix}%`))
      .orderBy(desc(healthApplications.applicationNumber))
      .limit(1);

    let sequenceNumber = 1;
    if (existingApplications.length > 0) {
      const lastAppNum = existingApplications[0].applicationNumber;
      const lastSeq = lastAppNum.slice(-4);
      sequenceNumber = parseInt(lastSeq, 10) + 1;
    }

    const applicationNumber = `${applicationPrefix}${String(sequenceNumber).padStart(4, '0')}`;
    const isoNow = now.toISOString();

    // Prepare insert payload
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
      submittedAt: isoNow,
      createdAt: isoNow,
      updatedAt: isoNow,
    };

    // Insert into DB
    const insertedApplications = await db.insert(healthApplications).values(insertData).returning();

    return NextResponse.json(insertedApplications[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 },
    );
  }
}
