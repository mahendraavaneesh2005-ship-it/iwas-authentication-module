"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, User, Settings, TrendingUp, FileText, Plus, AlertCircle, Heart, RefreshCw, IndianRupee,
  Car, ArrowLeft,ArrowRight,Check, Clock
} from "lucide-react";

import { toast } from "sonner";
import { calculatePremium } from "@/lib/premiumCalculator";
import { VehicleApplication, VehicleType, CoverageType } from "@/types/insurance";
import Link from "next/link";


export default function InsuranceApplicationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [formData, setFormData] = useState({
    // Vehicle Details
    vehicleType: "" as VehicleType | "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vin: "",
    licensePlate: "",
    color: "",
    mileage: 0,
    
    // Driver Details
    driverName: user?.name || "",
    driverLicense: "",
    driverAge: 30,
    driverExperience: 5,
    
    // Coverage Details
    coverageType: "" as CoverageType | "",
    coverageAmount: 100000,
    deductible: 500,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required";
      if (!formData.make) newErrors.make = "Make is required";
      if (!formData.model) newErrors.model = "Model is required";
      if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
        newErrors.year = "Valid year is required";
      }
      if (!formData.vin || formData.vin.length < 17) newErrors.vin = "VIN must be 17 characters";
      if (!formData.licensePlate) newErrors.licensePlate = "License plate is required";
      if (!formData.color) newErrors.color = "Color is required";
      if (!formData.mileage || formData.mileage < 0) newErrors.mileage = "Valid mileage is required";
    } else if (step === 2) {
      if (!formData.driverName) newErrors.driverName = "Driver name is required";
      if (!formData.driverLicense) newErrors.driverLicense = "Driver license number is required";
      if (!formData.driverAge || formData.driverAge < 16 || formData.driverAge > 100) {
        newErrors.driverAge = "Driver age must be between 16 and 100";
      }
      if (formData.driverExperience < 0 || formData.driverExperience > 80) {
        newErrors.driverExperience = "Invalid driving experience";
      }
    } else if (step === 3) {
      if (!formData.coverageType) newErrors.coverageType = "Coverage type is required";
      if (!formData.coverageAmount || formData.coverageAmount < 10000) {
        newErrors.coverageAmount = "Coverage amount must be at least ₹10,000";
      }
      if (!formData.deductible) newErrors.deductible = "Deductible is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/insurance/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user?.id,
          vehicleType: formData.vehicleType,
          make: formData.make,
          model: formData.model,
          year: formData.year,
          vin: formData.vin,
          licensePlate: formData.licensePlate,
          color: formData.color,
          mileage: formData.mileage,
          driverName: formData.driverName,
          driverLicense: formData.driverLicense,
          driverAge: formData.driverAge,
          driverExperience: formData.driverExperience,
          coverageType: formData.coverageType,
          coverageAmount: formData.coverageAmount,
          deductible: formData.deductible,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to submit application");
      }
      const doc = await res.json();
      toast.success("Application submitted successfully!");
      router.push(`/insurance/premium/${doc._id}`);
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const steps = [
    { number: 1, title: "Vehicle Details", icon: Car },
    { number: 2, title: "Driver Information", icon: User },
    { number: 3, title: "Coverage Selection", icon: Shield },
  ];

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
                  <p className="text-xs text-muted-foreground">Vehicle Insurance Application</p>
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
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        currentStep >= step.number
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white dark:bg-zinc-900 border-border text-muted-foreground"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <step.icon className="h-6 w-6" />
                      )}
                    </div>
                    <p className={`text-sm font-medium mt-2 ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-4 transition-all ${
                        currentStep > step.number ? "bg-blue-600" : "bg-border"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {currentStep === 1 && "Vehicle Details"}
                {currentStep === 2 && "Driver Information"}
                {currentStep === 3 && "Coverage Selection"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Provide information about the vehicle you want to insure"}
                {currentStep === 2 && "Tell us about the primary driver"}
                {currentStep === 3 && "Choose your coverage options"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 1: Vehicle Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vehicleType">Vehicle Type *</Label>
                      <Select
                        value={formData.vehicleType}
                        onValueChange={(value) => updateField("vehicleType", value)}
                      >
                        <SelectTrigger id="vehicleType" className={errors.vehicleType ? "border-red-500" : ""}>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.vehicleType && <p className="text-sm text-red-500">{errors.vehicleType}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => updateField("year", parseInt(e.target.value))}
                        className={errors.year ? "border-red-500" : ""}
                      />
                      {errors.year && <p className="text-sm text-red-500">{errors.year}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input
                        id="make"
                        placeholder="e.g., Toyota, Honda, Ford"
                        value={formData.make}
                        onChange={(e) => updateField("make", e.target.value)}
                        className={errors.make ? "border-red-500" : ""}
                      />
                      {errors.make && <p className="text-sm text-red-500">{errors.make}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        placeholder="e.g., Camry, Accord, F-150"
                        value={formData.model}
                        onChange={(e) => updateField("model", e.target.value)}
                        className={errors.model ? "border-red-500" : ""}
                      />
                      {errors.model && <p className="text-sm text-red-500">{errors.model}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN (Vehicle Identification Number) *</Label>
                    <Input
                      id="vin"
                      placeholder="17-character VIN"
                      value={formData.vin}
                      onChange={(e) => updateField("vin", e.target.value.toUpperCase())}
                      maxLength={17}
                      className={errors.vin ? "border-red-500" : ""}
                    />
                    {errors.vin && <p className="text-sm text-red-500">{errors.vin}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="licensePlate">License Plate *</Label>
                      <Input
                        id="licensePlate"
                        placeholder="ABC-1234"
                        value={formData.licensePlate}
                        onChange={(e) => updateField("licensePlate", e.target.value.toUpperCase())}
                        className={errors.licensePlate ? "border-red-500" : ""}
                      />
                      {errors.licensePlate && <p className="text-sm text-red-500">{errors.licensePlate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color *</Label>
                      <Input
                        id="color"
                        placeholder="e.g., Silver, Black, White"
                        value={formData.color}
                        onChange={(e) => updateField("color", e.target.value)}
                        className={errors.color ? "border-red-500" : ""}
                      />
                      {errors.color && <p className="text-sm text-red-500">{errors.color}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mileage">Current Mileage *</Label>
                    <Input
                      id="mileage"
                      type="number"
                      placeholder="e.g., 25000"
                      value={formData.mileage}
                      onChange={(e) => updateField("mileage", parseInt(e.target.value))}
                      className={errors.mileage ? "border-red-500" : ""}
                    />
                    {errors.mileage && <p className="text-sm text-red-500">{errors.mileage}</p>}
                  </div>
                </div>
              )}

              {/* Step 2: Driver Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name *</Label>
                    <Input
                      id="driverName"
                      placeholder="Full name"
                      value={formData.driverName}
                      onChange={(e) => updateField("driverName", e.target.value)}
                      className={errors.driverName ? "border-red-500" : ""}
                    />
                    {errors.driverName && <p className="text-sm text-red-500">{errors.driverName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driverLicense">Driver License Number *</Label>
                    <Input
                      id="driverLicense"
                      placeholder="License number"
                      value={formData.driverLicense}
                      onChange={(e) => updateField("driverLicense", e.target.value.toUpperCase())}
                      className={errors.driverLicense ? "border-red-500" : ""}
                    />
                    {errors.driverLicense && <p className="text-sm text-red-500">{errors.driverLicense}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="driverAge">Driver Age *</Label>
                      <Input
                        id="driverAge"
                        type="number"
                        value={formData.driverAge}
                        onChange={(e) => updateField("driverAge", parseInt(e.target.value))}
                        className={errors.driverAge ? "border-red-500" : ""}
                      />
                      {errors.driverAge && <p className="text-sm text-red-500">{errors.driverAge}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="driverExperience">Years of Driving Experience *</Label>
                      <Input
                        id="driverExperience"
                        type="number"
                        value={formData.driverExperience}
                        onChange={(e) => updateField("driverExperience", parseInt(e.target.value))}
                        className={errors.driverExperience ? "border-red-500" : ""}
                      />
                      {errors.driverExperience && <p className="text-sm text-red-500">{errors.driverExperience}</p>}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Note:</strong> Driver information affects your premium calculation. More experience typically results in lower premiums.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Coverage Selection */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverageType">Coverage Type *</Label>
                    <Select
                      value={formData.coverageType}
                      onValueChange={(value) => updateField("coverageType", value)}
                    >
                      <SelectTrigger id="coverageType" className={errors.coverageType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select coverage type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liability">Liability Only</SelectItem>
                        <SelectItem value="collision">Collision</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        <SelectItem value="full">Full Coverage</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.coverageType && <p className="text-sm text-red-500">{errors.coverageType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="coverageAmount">Coverage Amount *</Label>
                    <Select
                      value={formData.coverageAmount.toString()}
                      onValueChange={(value) => updateField("coverageAmount", parseInt(value))}
                    >
                      <SelectTrigger id="coverageAmount" className={errors.coverageAmount ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50000">₹50,000</SelectItem>
                        <SelectItem value="100000">₹100,000</SelectItem>
                        <SelectItem value="250000">₹250,000</SelectItem>
                        <SelectItem value="500000">₹500,000</SelectItem>
                        <SelectItem value="1000000">₹1,000,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.coverageAmount && <p className="text-sm text-red-500">{errors.coverageAmount}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deductible">Deductible *</Label>
                    <Select
                      value={formData.deductible.toString()}
                      onValueChange={(value) => updateField("deductible", parseInt(value))}
                    >
                      <SelectTrigger id="deductible" className={errors.deductible ? "border-red-500" : ""}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="250">₹250</SelectItem>
                        <SelectItem value="500">₹500</SelectItem>
                        <SelectItem value="1000">₹1,000</SelectItem>
                        <SelectItem value="2000">₹2,000</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.deductible && <p className="text-sm text-red-500">{errors.deductible}</p>}
                    <p className="text-sm text-muted-foreground">
                      Higher deductibles typically result in lower premiums
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>Coverage Explanations:</strong>
                    </p>
                    <ul className="text-sm text-blue-900 dark:text-blue-100 mt-2 space-y-1 list-disc list-inside">
                      <li><strong>Liability:</strong> Covers damage you cause to others</li>
                      <li><strong>Collision:</strong> Covers damage to your vehicle from accidents</li>
                      <li><strong>Comprehensive:</strong> Covers theft, weather, vandalism</li>
                      <li><strong>Full:</strong> Complete protection with all coverage types</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>

                {currentStep < 3 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                    <Check className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
