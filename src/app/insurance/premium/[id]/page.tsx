"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Car, DollarSign, ArrowLeft, Check, CreditCard, Clock, AlertCircle } from "lucide-react";
import { VehicleApplication } from "@/types/insurance";
import Link from "next/link";

export default function PremiumDisplayPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<VehicleApplication | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleProceedToPayment = () => {
    if (application) {
      router.push(`/insurance/payment/${application.id}`);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-muted-foreground">Loading premium details...</p>
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
                  <p className="text-xs text-muted-foreground">Premium Calculation</p>
                </div>
              </Link>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-4xl">
          {/* Success Banner */}
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-6 mb-8 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
                Application Submitted Successfully!
              </h2>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your vehicle insurance application has been processed. Review your premium calculation below and proceed to payment.
              </p>
            </div>
          </div>

          {/* Premium Summary Card */}
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-900">
            <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
              <CardTitle className="text-2xl flex items-center gap-3">
                <DollarSign className="h-7 w-7 text-blue-600" />
                Your Premium
              </CardTitle>
              <CardDescription>Annual and monthly premium breakdown</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center mb-8 pb-8 border-b">
                <p className="text-sm text-muted-foreground mb-2">Annual Premium</p>
                <div className="text-5xl font-bold text-blue-600 mb-4">
                  ${application.finalPremium?.toLocaleString()}
                </div>
                <p className="text-lg text-muted-foreground">
                  or <span className="font-semibold text-foreground">${monthlyPremium}/month</span>
                </p>
              </div>

              {/* Premium Breakdown */}
              {application.premiumBreakdown && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Premium Calculation Breakdown</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Base Premium</p>
                      <p className="text-xl font-semibold">${application.premiumBreakdown.basePremium}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Vehicle Type</p>
                      <p className="text-xl font-semibold">{application.premiumBreakdown.factors.vehicleType}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Driver Age</p>
                      <p className="text-xl font-semibold">{application.premiumBreakdown.factors.driverAge}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Driving Experience</p>
                      <p className="text-xl font-semibold">{application.premiumBreakdown.factors.experience}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Coverage Type</p>
                      <p className="text-xl font-semibold">{application.premiumBreakdown.factors.coverage}</p>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground mb-1">Deductible</p>
                      <p className="text-xl font-semibold">{application.premiumBreakdown.factors.deductible}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>How it works:</strong> We start with a base premium and apply multipliers based on vehicle type, driver profile, coverage selection, and deductible amount to calculate your personalized rate.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Details Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Car className="h-6 w-6 text-blue-600" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-semibold">
                    {application.year} {application.make} {application.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-semibold capitalize">{application.vehicleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">VIN</p>
                  <p className="font-semibold font-mono">{application.vin}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Plate</p>
                  <p className="font-semibold">{application.licensePlate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage Type</p>
                  <p className="font-semibold capitalize">{application.coverageType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coverage Amount</p>
                  <p className="font-semibold">${application.coverageAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Deductible</p>
                  <p className="font-semibold">${application.deductible.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={handleProceedToPayment}
              className="bg-blue-600 hover:bg-blue-700 flex-1"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Proceed to Payment
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="flex-1"
            >
              <Clock className="h-5 w-5 mr-2" />
              Save for Later
            </Button>
          </div>

          {/* Info Notice */}
          <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Important Information</p>
              <p>Your premium quote is valid for 30 days. Complete payment to activate your policy. Policy becomes effective immediately upon payment confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
