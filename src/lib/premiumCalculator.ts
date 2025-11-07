import { 
  VehicleApplication, 
  PremiumBreakdown, 
  PREMIUM_FACTORS, 
  BASE_PREMIUM,
  VehicleType,
  CoverageType
} from "@/types/insurance";

export function calculatePremium(application: Partial<VehicleApplication>): PremiumBreakdown {
  const {
    vehicleType,
    driverAge,
    driverExperience,
    coverageType,
    deductible,
  } = application;

  // Base premium
  let premium = BASE_PREMIUM;
  const factors: any = {
    vehicleType: "N/A",
    driverAge: "N/A",
    experience: "N/A",
    coverage: "N/A",
    deductible: "N/A",
  };

  // Vehicle type factor
  let vehicleTypeFactor = 1.0;
  if (vehicleType) {
    vehicleTypeFactor = PREMIUM_FACTORS.vehicleType[vehicleType as VehicleType] || 1.0;
    factors.vehicleType = `${vehicleType} (×${vehicleTypeFactor})`;
  }

  // Age factor
  let ageFactor = 1.0;
  if (driverAge) {
    if (driverAge < 25) {
      ageFactor = PREMIUM_FACTORS.age.under25;
      factors.driverAge = `Under 25 (×${ageFactor})`;
    } else if (driverAge <= 35) {
      ageFactor = PREMIUM_FACTORS.age["25to35"];
      factors.driverAge = `25-35 (×${ageFactor})`;
    } else if (driverAge <= 50) {
      ageFactor = PREMIUM_FACTORS.age["36to50"];
      factors.driverAge = `36-50 (×${ageFactor})`;
    } else {
      ageFactor = PREMIUM_FACTORS.age.over50;
      factors.driverAge = `Over 50 (×${ageFactor})`;
    }
  }

  // Experience factor
  let experienceFactor = 1.0;
  if (driverExperience !== undefined) {
    if (driverExperience < 3) {
      experienceFactor = PREMIUM_FACTORS.experience.under3;
      factors.experience = `< 3 years (×${experienceFactor})`;
    } else if (driverExperience <= 5) {
      experienceFactor = PREMIUM_FACTORS.experience["3to5"];
      factors.experience = `3-5 years (×${experienceFactor})`;
    } else if (driverExperience <= 10) {
      experienceFactor = PREMIUM_FACTORS.experience["6to10"];
      factors.experience = `6-10 years (×${experienceFactor})`;
    } else {
      experienceFactor = PREMIUM_FACTORS.experience.over10;
      factors.experience = `> 10 years (×${experienceFactor})`;
    }
  }

  // Coverage factor
  let coverageFactor = 1.0;
  if (coverageType) {
    coverageFactor = PREMIUM_FACTORS.coverage[coverageType as CoverageType] || 1.0;
    factors.coverage = `${coverageType} (×${coverageFactor})`;
  }

  // Deductible discount
  let deductibleDiscount = 1.0;
  if (deductible) {
    const deductibleKey = deductible.toString() as keyof typeof PREMIUM_FACTORS.deductible;
    deductibleDiscount = PREMIUM_FACTORS.deductible[deductibleKey] || 1.0;
    factors.deductible = `$${deductible} (×${deductibleDiscount})`;
  }

  // Calculate final premium
  const basePremium = BASE_PREMIUM;
  const finalPremium = Math.round(
    premium * 
    vehicleTypeFactor * 
    ageFactor * 
    experienceFactor * 
    coverageFactor * 
    deductibleDiscount
  );

  return {
    basePremium,
    vehicleTypeFactor,
    ageFactor,
    experienceFactor,
    coverageFactor,
    deductibleDiscount,
    finalPremium,
    factors,
  };
}
