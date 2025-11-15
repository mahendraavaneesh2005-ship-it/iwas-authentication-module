import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import HealthPlan from "../models/HealthPlan.js";

dotenv.config();

const sampleHealthPlans = [
  {
    planName: "Basic Health Plan",
    description:
      "Essential coverage for individuals seeking affordable healthcare protection with basic medical services.",
    coverageAmount: 10000,
    monthlyPremiumBase: 299,
    annualDeductible: 1000,
    copayAmount: 100,
    outOfPocketMax: 50000,
    coverageDetails: "Outpatient Care, Prescription Drugs, Emergency Services, Lab Tests",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    planName: "Standard Health Plan",
    description:
      "Comprehensive coverage with enhanced benefits including specialist care and preventive services for growing families.",
    coverageAmount: 50000,
    monthlyPremiumBase: 499,
    annualDeductible: 500,
    copayAmount: 50,
    outOfPocketMax: 200000,
    coverageDetails: "All Basic Features, Specialist Visits, Preventive Care, Maternity Care",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    planName: "Premium Health Plan",
    description:
      "Ultimate healthcare protection with maximum coverage, lowest copays, and access to premium services including dental and vision.",
    coverageAmount: 100000,
    monthlyPremiumBase: 799,
    annualDeductible: 250,
    copayAmount: 25,
    outOfPocketMax: 500000,
    coverageDetails: "All Standard Features, Dental Care, Vision Care, International Coverage",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const run = async () => {
  try {
    console.log("Connecting to DB using URI:", process.env.MONGODB_URI);
    await connectDB(process.env.MONGODB_URI);

    const count = await HealthPlan.countDocuments();
    if (count > 0) {
      console.log(`Health plans already exist (${count}). Skipping seeding.`);
      process.exit(0);
    }

    await HealthPlan.insertMany(sampleHealthPlans);
    console.log("✅ Health plans seeder completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  }
};

run();
