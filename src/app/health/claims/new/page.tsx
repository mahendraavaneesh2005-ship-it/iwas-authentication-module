"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, FileText, Upload, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface HealthPolicy {
  id: number;
  policyNumber: string;
  policyholderName: string;
  status: string;
}

export default function NewHealthClaimPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<HealthPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    policyId: "",
    treatmentDate: "",
    hospitalName: "",
    doctorName: "",
    diagnosis: "",
    treatmentDescription: "",
    claimAmount: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/health/claims/new");
      return;
    }

    fetchUserPolicies();
  }, [user, router]);

  const fetchUserPolicies = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/health/policies?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch policies");
      }

      const data = await response.json();
      const activePolicies = data.filter((p: HealthPolicy) => p.status === "active");
      setPolicies(activePolicies);

      if (activePolicies.length === 0) {
        toast.error("No active health policies found. Please purchase a policy first.");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
      toast.error("Failed to load your policies");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileNames = Array.from(files).map(file => file.name);
    setUploadedFiles([...uploadedFiles, ...fileNames]);
    toast.success(`${fileNames.length} file(s) uploaded`);
  };

  const removeFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter(f => f !== fileName));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to submit a claim");
      return;
    }

    // Validation
    if (!formData.policyId || !formData.treatmentDate || !formData.hospitalName || 
        !formData.doctorName || !formData.diagnosis || !formData.treatmentDescription || 
        !formData.claimAmount) {
      toast.error("Please fill in all required fields");
      return;
    }

    const claimAmount = parseFloat(formData.claimAmount);
    if (isNaN(claimAmount) || claimAmount <= 0) {
      toast.error("Please enter a valid claim amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/health/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          policyId: formData.policyId,
          treatmentDate: formData.treatmentDate,
          hospitalName: formData.hospitalName,
          doctorName: formData.doctorName,
          diagnosis: formData.diagnosis,
          treatmentDescription: formData.treatmentDescription,
          claimAmount: claimAmount,
          documents: uploadedFiles.length > 0 ? uploadedFiles : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit claim");
      }

      toast.success("Health claim submitted successfully!");
      router.push("/health/claims");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit claim");
    } finally {
      setIsSubmitting(false);
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
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/health/claims">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Claims
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground mt-4">Submit Health Claim</h1>
          <p className="text-muted-foreground mt-2">File a new claim for medical treatment</p>
        </div>

        {/* No Policies Warning */}
        {policies.length === 0 && (
          <div className="max-w-3xl mx-auto mb-8">
            <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-900 p-6">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                No Active Policies Found
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-4">
                You need an active health insurance policy to submit a claim.
              </p>
              <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                <Link href="/health/apply">Apply for Health Insurance</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Claim Form */}
        {policies.length > 0 && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Policy Selection */}
                <div>
                  <Label htmlFor="policyId">Select Policy *</Label>
                  <select
                    id="policyId"
                    name="policyId"
                    value={formData.policyId}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    required
                  >
                    <option value="">Select a policy</option>
                    {policies.map((policy) => (
                      <option key={policy.id} value={policy.id}>
                        {policy.policyNumber} - {policy.policyholderName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Treatment Date */}
                <div>
                  <Label htmlFor="treatmentDate">Treatment Date *</Label>
                  <Input
                    id="treatmentDate"
                    name="treatmentDate"
                    type="date"
                    value={formData.treatmentDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Hospital Name */}
                <div>
                  <Label htmlFor="hospitalName">Hospital/Clinic Name *</Label>
                  <Input
                    id="hospitalName"
                    name="hospitalName"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    placeholder="City General Hospital"
                    required
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <Label htmlFor="doctorName">Doctor Name *</Label>
                  <Input
                    id="doctorName"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>

                {/* Diagnosis */}
                <div>
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleChange}
                    placeholder="Acute appendicitis"
                    required
                  />
                </div>

                {/* Treatment Description */}
                <div>
                  <Label htmlFor="treatmentDescription">Treatment Description *</Label>
                  <Textarea
                    id="treatmentDescription"
                    name="treatmentDescription"
                    value={formData.treatmentDescription}
                    onChange={handleChange}
                    placeholder="Describe the treatment received..."
                    rows={4}
                    required
                  />
                </div>

                {/* Claim Amount */}
                <div>
                  <Label htmlFor="claimAmount">Claim Amount ($) *</Label>
                  <Input
                    id="claimAmount"
                    name="claimAmount"
                    type="number"
                    step="0.01"
                    value={formData.claimAmount}
                    onChange={handleChange}
                    placeholder="5000.00"
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label>Supporting Documents</Label>
                  <div className="mt-2">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Medical bills, prescriptions, test reports (PDF, JPG, PNG)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>

                  {/* Uploaded Files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-foreground">{file}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Claim Processing Time
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        Your claim will be reviewed within 5-7 business days. You'll receive email updates on the status.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Claim...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
