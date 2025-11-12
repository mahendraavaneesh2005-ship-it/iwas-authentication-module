"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Policy } from "@/types/insurance";

import {
  Shield, User, Settings, TrendingUp, FileText, Plus,
  AlertCircle, Heart, RefreshCw, IndianRupee, CreditCard, ArrowLeft, Clock
} from "lucide-react";

import Link from "next/link";


export default function PaymentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<VehicleApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    paymentMethod: "credit_card" as "credit_card" | "debit_card" | "bank_transfer",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const applications = JSON.parse(localStorage.getItem("applications") || "[]");
    const found = applications.find((app: VehicleApplication) => app.id === params.id);
    
    if (!found || found.userId !== user?.id) {
      router.push("/dashboard");
      return;
    }
    
    setApplication(found);
    setLoading(false);
  }, [params.id, user?.id, router]);

  const validatePayment = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (paymentData.paymentMethod !== "bank_transfer") {
      // Validate card number (16 digits)
      const cardNum = paymentData.cardNumber.replace(/\s/g, "");
      if (!cardNum || cardNum.length !== 16 || !/^\d+₹/.test(cardNum)) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number";
      }

      // Validate card name
      if (!paymentData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }

      // Validate expiry
      if (!paymentData.expiryMonth) {
        newErrors.expiryMonth = "Month required";
      }
      if (!paymentData.expiryYear) {
        newErrors.expiryYear = "Year required";
      }

      // Validate CVV (3-4 digits)
      if (!paymentData.cvv || !/^\d{3,4}₹/.test(paymentData.cvv)) {
        newErrors.cvv = "Please enter a valid CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!validatePayment() || !application) return;

    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create policy
      const policyNumber = `POL-₹{Date.now()}-₹{Math.random().toString(36).substring(7).toUpperCase()}`;
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const policy: Policy = {
        id: Math.random().toString(36).substring(7),
        userId: user?.id || "",
        applicationId: application.id,
        policyNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "active",
        vehicleDetails: {
          make: application.make,
          model: application.model,
          year: application.year,
          vin: application.vin,
          licensePlate: application.licensePlate,
        },
        coverageType: application.coverageType,
        coverageAmount: application.coverageAmount,
        deductible: application.deductible,
        premium: application.finalPremium || 0,
        premiumBreakdown: application.premiumBreakdown!,
        paymentStatus: "completed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create payment record
      const payment: Payment = {
        id: Math.random().toString(36).substring(7),
        userId: user?.id || "",
        policyId: policy.id,
        amount: application.finalPremium || 0,
        status: "completed",
        method: paymentData.paymentMethod,
        cardLast4: paymentData.cardNumber.slice(-4),
        transactionId: `TXN-₹{Date.now()}`,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      policy.paymentId = payment.id;

      // Store in localStorage
      const policies = JSON.parse(localStorage.getItem("policies") || "[]");
      policies.push(policy);
      localStorage.setItem("policies", JSON.stringify(policies));

      const payments = JSON.parse(localStorage.getItem("payments") || "[]");
      payments.push(payment);
      localStorage.setItem("payments", JSON.stringify(payments));

      // Update application status
      const applications = JSON.parse(localStorage.getItem("applications") || "[]");
      const updatedApps = applications.map((app: VehicleApplication) =>
        app.id === application.id ? { ...app, status: "approved" } : app
      );
      localStorage.setItem("applications", JSON.stringify(updatedApps));

      toast.success("Payment successful! Your policy is now active.");
      router.push("/insurance/policies");
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const updateField = (field: string, value: any) => {
    if (field === "cardNumber") {
      value = formatCardNumber(value.replace(/\D/g, "").slice(0, 16));
    }
    setPaymentData({ ...paymentData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-muted-foreground">Loading payment details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!application) {
    return null;
  }

  const monthlyPremium = Math.round((application.finalPremium || 0) / 12);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Header */}
        <header className="border-b border-border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">IWAS</h1>
                  <p className="text-xs text-muted-foreground">Secure Payment</p>
                </div>
              </Link>
              <Button variant="ghost" asChild>
                <Link href={`/insurance/premium/₹{application.id}`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Premium
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    Payment Information
                  </CardTitle>
                  <CardDescription>Complete your payment to activate your policy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={paymentData.paymentMethod}
                      onValueChange={(value) => updateField("paymentMethod", value)}
                    >
                      <SelectTrigger id="paymentMethod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {paymentData.paymentMethod !== "bank_transfer" ? (
                    <>
                      {/* Card Number */}
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber}
                          onChange={(e) => updateField("cardNumber", e.target.value)}
                          className={errors.cardNumber ? "border-red-500" : ""}
                          maxLength={19}
                        />
                        {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
                      </div>

                      {/* Cardholder Name */}
                      <div className="space-y-2">
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={paymentData.cardName}
                          onChange={(e) => updateField("cardName", e.target.value.toUpperCase())}
                          className={errors.cardName ? "border-red-500" : ""}
                        />
                        {errors.cardName && <p className="text-sm text-red-500">{errors.cardName}</p>}
                      </div>

                      {/* Expiry and CVV */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">Month</Label>
                          <Select
                            value={paymentData.expiryMonth}
                            onValueChange={(value) => updateField("expiryMonth", value)}
                          >
                            <SelectTrigger id="expiryMonth" className={errors.expiryMonth ? "border-red-500" : ""}>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                  {month.toString().padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.expiryMonth && <p className="text-sm text-red-500">{errors.expiryMonth}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">Year</Label>
                          <Select
                            value={paymentData.expiryYear}
                            onValueChange={(value) => updateField("expiryYear", value)}
                          >
                            <SelectTrigger id="expiryYear" className={errors.expiryYear ? "border-red-500" : ""}>
                              <SelectValue placeholder="YY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                                <SelectItem key={year} value={year.toString().slice(-2)}>
                                  {year.toString().slice(-2)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.expiryYear && <p className="text-sm text-red-500">{errors.expiryYear}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            type="password"
                            value={paymentData.cvv}
                            onChange={(e) => updateField("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className={errors.cvv ? "border-red-500" : ""}
                            maxLength={4}
                          />
                          {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                      <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                        <strong>Bank Transfer Instructions:</strong>
                      </p>
                      <p className="text-sm text-blue-900 dark:text-blue-100">
                        For bank transfer payments, please contact our support team at support@iwas.com to receive wire transfer instructions. Your policy will be activated once payment is confirmed.
                      </p>
                    </div>
                  )}

                  {/* Security Notice */}
                  <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground mb-1">Secure Payment</p>
                      <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={processing || paymentData.paymentMethod === "bank_transfer"}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Pay ₹{application.finalPremium?.toLocaleString()}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Vehicle</p>
                    <p className="font-semibold">
                      {application.year} {application.make} {application.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coverage Type</p>
                    <p className="font-semibold capitalize">{application.coverageType}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Coverage Amount</p>
                    <p className="font-semibold">₹{application.coverageAmount.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Deductible</p>
                    <p className="font-semibold">₹{application.deductible.toLocaleString()}</p>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Annual Premium</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{application.finalPremium?.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ₹{monthlyPremium}/month
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>Policy Term:</strong> 12 months from payment date
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Help Notice */}
              <div className="mt-4 bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">Need Help?</p>
                  <p>Contact support@iwas.com or call 1-800-IWAS-HELP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
