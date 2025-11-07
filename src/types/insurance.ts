// Vehicle Insurance Types

export type VehicleType = "sedan" | "suv" | "truck" | "motorcycle" | "van";
export type CoverageType = "liability" | "comprehensive" | "collision" | "full";
export type PolicyStatus = "pending" | "active" | "expired" | "cancelled";
export type ClaimStatus = "submitted" | "under_review" | "approved" | "rejected" | "paid";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface VehicleApplication {
  id: string;
  userId: string;
  // Vehicle Details
  vehicleType: VehicleType;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  
  // Driver Details
  driverName: string;
  driverLicense: string;
  driverAge: number;
  driverExperience: number; // years
  
  // Coverage Details
  coverageType: CoverageType;
  coverageAmount: number;
  deductible: number;
  
  // Status
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedAt?: string;
  
  // Premium Calculation
  premiumCalculated?: boolean;
  basePremium?: number;
  finalPremium?: number;
  premiumBreakdown?: PremiumBreakdown;
  
  createdAt: string;
  updatedAt: string;
}

export interface PremiumBreakdown {
  basePremium: number;
  vehicleTypeFactor: number;
  ageFactor: number;
  experienceFactor: number;
  coverageFactor: number;
  deductibleDiscount: number;
  finalPremium: number;
  factors: {
    vehicleType: string;
    driverAge: string;
    experience: string;
    coverage: string;
    deductible: string;
  };
}

export interface Policy {
  id: string;
  userId: string;
  applicationId: string;
  
  // Policy Details
  policyNumber: string;
  startDate: string;
  endDate: string;
  status: PolicyStatus;
  
  // Vehicle & Coverage
  vehicleDetails: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
  };
  coverageType: CoverageType;
  coverageAmount: number;
  deductible: number;
  
  // Premium
  premium: number;
  premiumBreakdown: PremiumBreakdown;
  
  // Payment
  paymentId?: string;
  paymentStatus: PaymentStatus;
  
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  policyId: string;
  
  amount: number;
  status: PaymentStatus;
  method: "credit_card" | "debit_card" | "bank_transfer";
  
  // Payment Details (mocked)
  cardLast4?: string;
  transactionId?: string;
  
  paidAt?: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  userId: string;
  policyId: string;
  
  // Claim Details
  claimNumber: string;
  incidentDate: string;
  incidentDescription: string;
  incidentLocation: string;
  
  // Damage Details
  damageDescription: string;
  estimatedCost: number;
  
  // Documents (mocked - just filenames)
  documents: string[];
  photos: string[];
  
  // Status & Review
  status: ClaimStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // Admin user ID
  
  // Admin Decision
  approvedAmount?: number;
  rejectionReason?: string;
  adminNotes?: string;
  
  createdAt: string;
  updatedAt: string;
}

// Calculation Constants
export const PREMIUM_FACTORS = {
  vehicleType: {
    sedan: 1.0,
    suv: 1.2,
    truck: 1.3,
    motorcycle: 1.5,
    van: 1.1,
  },
  age: {
    under25: 1.5,
    "25to35": 1.2,
    "36to50": 1.0,
    over50: 1.1,
  },
  experience: {
    under3: 1.4,
    "3to5": 1.2,
    "6to10": 1.0,
    over10: 0.9,
  },
  coverage: {
    liability: 1.0,
    comprehensive: 1.3,
    collision: 1.2,
    full: 1.5,
  },
  deductible: {
    250: 1.0,
    500: 0.9,
    1000: 0.8,
    2000: 0.7,
  },
};

export const BASE_PREMIUM = 500; // Base annual premium in dollars
