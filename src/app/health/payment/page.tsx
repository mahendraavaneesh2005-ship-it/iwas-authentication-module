"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, CheckCircle2, Shield, DollarSign, Calendar } from "lucide-react";
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
  description: string | null;
}

export default function HealthPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [plan, setPlan] = useState<HealthPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const applicationId = searchParams.get("applicationId");
  const planId = searchParams.get("planId");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/health/payment");
      return;
    }

    if (!applicationId || !planId || !amount) {
      toast.error("Missing required payment information");
      router.push("/health/plans");
      return;
    }

    fetchPlanDetails();
  }, [user, applicationId, planId, amount, router]);

  const fetchPlanDetails = async () => {
    if (!planId) return;

    try {
      const response = await fetch("/api/health/plans");
      
      if (!response.ok) {
        throw new Error("Failed to fetch plan details");
      }

      const plans = await response.json();
      const selectedPlan = plans.find((p: HealthPlan) => p.id === parseInt(planId));
      
      if (selectedPlan) {
        setPlan(selectedPlan);
      } else {
        toast.error("Plan not found");
        router.push("/health/plans");
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId || !amount || !user) {
      toast.error("Missing required payment information");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/health/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: parseInt(applicationId),
          paymentMethod,
          paymentAmount: parseFloat(amount),
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment processing failed");
      }

      toast.success("Payment successful! Your policy has been issued.");
      router.push(`/health/policies?new=true&policyId=${data.id}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment processing failed");
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
          <p className="text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!plan || !amount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Invalid payment information</p>
          <Button onClick={() => router.push("/health/plans")} className="mt-4">
            Return to Plans
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/health/plans">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Plans
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-4">Complete Your Payment</h1>
          <p className="text-muted-foreground mt-2">Finalize your health insurance policy</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Order Summary</h2>

              {/* Plan Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{plan.planName}</h3>
                  <span className="text-sm text-muted-foreground capitalize">{plan.planType}</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-muted-foreground">Coverage Amount:</span>
                    <span className="font-medium text-foreground ml-auto">
                      ${plan.coverageAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-muted-foreground">Annual Deductible:</span>
                    <span className="font-medium text-foreground ml-auto">
                      ${plan.annualDeductible.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-muted-foreground">Copay Amount:</span>
                    <span className="font-medium text-foreground ml-auto">
                      ${plan.copayAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">Monthly Premium</span>
                  <span className="text-foreground">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span className="text-foreground">Total Due Today</span>
                  <span className="text-blue-600">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  First month premium payment
                </p>
              </div>

              {/* Coverage Info */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Coverage starts immediately
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-200 mt-1">
                      Your policy will be active as soon as payment is confirmed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Payment Method</h2>

              <form onSubmit={handlePayment} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Select Payment Method</Label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === "credit_card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-foreground">Credit Card</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="debit_card"
                        checked={paymentMethod === "debit_card"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-foreground">Debit Card</span>
                    </label>

                    <label className="flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === "bank_transfer"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <DollarSign className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-foreground">Bank Transfer</span>
                    </label>
                  </div>
                </div>

                {/* Payment Info Note */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> This is a demo payment form. 
                    In a production environment, this would integrate with a payment gateway like Stripe or PayPal.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Pay ${parseFloat(amount).toFixed(2)}
                    </>
                  )}
                </Button>

                {/* Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Secure payment processing</span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
