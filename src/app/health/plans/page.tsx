"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Shield, DollarSign, Calendar, TrendingUp } from "lucide-react";
import Link from "next/link";

interface HealthPlan {
  id: number;
  planName: string;
  planType: string;
  coverageAmount: number;
  monthlyPremiumBase: number;
  annualDeductible: number;
  copayAmount: number;
  outOfPocketMax: number;
  coverageDetails: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function HealthPlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [plans, setPlans] = useState<HealthPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [calculatedPremium, setCalculatedPremium] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const applicationId = searchParams.get("applicationId");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/health/plans");
      return;
    }

    fetchPlans();
  }, [user, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/health/plans");
      
      if (!response.ok) {
        throw new Error("Failed to fetch health plans");
      }

      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to load health plans");
    } finally {
      setLoading(false);
    }
  };

  const calculatePremium = (plan: HealthPlan) => {
    // Premium calculation logic based on plan base premium
    // In a real application, this would factor in age, health conditions, etc.
    const basePremium = plan.monthlyPremiumBase;
    
    // Simple calculation for demo - could be enhanced with risk factors
    const calculated = basePremium;
    
    setSelectedPlan(plan.id);
    setCalculatedPremium(calculated);
    toast.success(`Premium calculated: $${calculated.toFixed(2)}/month`);
  };

  const handleProceedToPayment = async () => {
    if (!selectedPlan || !calculatedPremium || !applicationId) {
      toast.error("Please select a plan and ensure you have an active application");
      return;
    }

    setIsProcessing(true);

    try {
      // Update the application with selected plan and premium
      const response = await fetch(`/api/health/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPlanId: selectedPlan,
          calculatedPremium: calculatedPremium,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update application");
      }

      toast.success("Plan selected! Proceeding to payment...");
      router.push(`/health/payment?applicationId=${applicationId}&planId=${selectedPlan}&amount=${calculatedPremium}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to proceed to payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading health plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/health/apply">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Application
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-4">Select Your Health Plan</h1>
          <p className="text-muted-foreground mt-2">Choose the plan that best fits your needs</p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border-2 transition-all ${
                selectedPlan === plan.id
                  ? "border-blue-600 shadow-lg"
                  : "border-border hover:border-blue-300 dark:hover:border-blue-800"
              }`}
            >
              <div className="p-6">
                {/* Plan Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{plan.planName}</h3>
                    <span className="text-sm text-muted-foreground capitalize">{plan.planType}</span>
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Premium */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.monthlyPremiumBase.toFixed(0)}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                {/* Plan Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-foreground">
                      Coverage: <strong>${plan.coverageAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-foreground">
                      Deductible: <strong>${plan.annualDeductible.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-foreground">
                      Copay: <strong>${plan.copayAmount}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-foreground">
                      Max Out-of-Pocket: <strong>${plan.outOfPocketMax.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {plan.description}
                  </p>
                )}

                {/* Action Button */}
                {selectedPlan === plan.id ? (
                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          Plan Selected
                        </p>
                        {calculatedPremium && (
                          <p className="text-xs text-green-700 dark:text-green-200">
                            Premium: ${calculatedPremium.toFixed(2)}/month
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => calculatePremium(plan)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Select Plan
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Proceed to Payment */}
        {selectedPlan && calculatedPremium && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Ready to Continue?</h3>
                  <p className="text-sm text-muted-foreground">
                    Proceed to payment to activate your health insurance policy
                  </p>
                </div>
                <Button
                  onClick={handleProceedToPayment}
                  disabled={isProcessing || !applicationId}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* No Application Warning */}
        {!applicationId && (
          <div className="max-w-3xl mx-auto mt-8">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900 p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                <strong>Note:</strong> You need to complete an application before selecting a plan.{" "}
                <Link href="/health/apply" className="underline font-medium">
                  Start your application here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
