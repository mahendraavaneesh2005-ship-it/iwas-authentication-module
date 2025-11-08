"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Shield, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function NewClaimPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    policyId: "",
    incidentDate: "",
    incidentLocation: "",
    incidentDescription: "",
    damageDescription: "",
    estimatedCost: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to submit a claim");
      return;
    }

    // Validation
    if (!formData.policyId.trim()) {
      toast.error("Policy Number is required");
      return;
    }
    if (!formData.incidentDate) {
      toast.error("Incident Date is required");
      return;
    }
    if (!formData.incidentLocation.trim()) {
      toast.error("Incident Location is required");
      return;
    }
    if (!formData.incidentDescription.trim()) {
      toast.error("Incident Description is required");
      return;
    }
    if (!formData.damageDescription.trim()) {
      toast.error("Damage Description is required");
      return;
    }
    if (!formData.estimatedCost || parseFloat(formData.estimatedCost) <= 0) {
      toast.error("Valid Estimated Cost is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          policyId: formData.policyId.trim(),
          incidentDate: formData.incidentDate,
          incidentLocation: formData.incidentLocation.trim(),
          incidentDescription: formData.incidentDescription.trim(),
          damageDescription: formData.damageDescription.trim(),
          estimatedCost: parseFloat(formData.estimatedCost),
          documents: [],
          photos: [],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit claim");
      }

      const claim = await response.json();
      toast.success(`Claim ${claim.claimNumber} submitted successfully!`);
      router.push("/insurance/claims");
    } catch (error) {
      console.error("Claim submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit claim");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Header */}
        <header className="border-b border-border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">IWAS</h1>
                  <p className="text-xs text-muted-foreground">Insurance Workflow Automation</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/insurance/claims">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </Link>
          </Button>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Submit New Claim
            </h2>
            <p className="text-muted-foreground">
              File a claim for vehicle damage or loss under your insurance policy
            </p>
          </div>

          <Card className="mb-6 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">Before you start</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Have your policy number ready</li>
                    <li>• Provide accurate incident details and location</li>
                    <li>• Describe the damage thoroughly</li>
                    <li>• Estimate repair costs (we'll verify with our assessors)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Claim Information</CardTitle>
              <CardDescription>
                Fill out the form below to submit your insurance claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Policy Number */}
                <div className="space-y-2">
                  <Label htmlFor="policyId">
                    Policy Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="policyId"
                    name="policyId"
                    placeholder="e.g., POL-2024-001"
                    value={formData.policyId}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the policy number under which you're filing this claim
                  </p>
                </div>

                {/* Incident Date */}
                <div className="space-y-2">
                  <Label htmlFor="incidentDate">
                    Incident Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="incidentDate"
                    name="incidentDate"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={formData.incidentDate}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    When did the incident occur?
                  </p>
                </div>

                {/* Incident Location */}
                <div className="space-y-2">
                  <Label htmlFor="incidentLocation">
                    Incident Location <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="incidentLocation"
                    name="incidentLocation"
                    placeholder="e.g., 123 Main St, Springfield"
                    value={formData.incidentLocation}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide the exact location where the incident occurred
                  </p>
                </div>

                {/* Incident Description */}
                <div className="space-y-2">
                  <Label htmlFor="incidentDescription">
                    Incident Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="incidentDescription"
                    name="incidentDescription"
                    placeholder="Describe what happened during the incident..."
                    rows={4}
                    value={formData.incidentDescription}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a detailed description of what happened
                  </p>
                </div>

                {/* Damage Description */}
                <div className="space-y-2">
                  <Label htmlFor="damageDescription">
                    Damage Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="damageDescription"
                    name="damageDescription"
                    placeholder="Describe the damage to your vehicle..."
                    rows={4}
                    value={formData.damageDescription}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Detail the damage sustained by your vehicle
                  </p>
                </div>

                {/* Estimated Cost */}
                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">
                    Estimated Repair Cost <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="estimatedCost"
                      name="estimatedCost"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8"
                      value={formData.estimatedCost}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Provide your best estimate of repair costs (we'll verify with our assessors)
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting..." : "Submit Claim"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/insurance/claims")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
