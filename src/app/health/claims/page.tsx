"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Clock, CheckCircle2, XCircle, DollarSign, Download, Calendar, TrendingUp, Activity, AlertCircle, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Claim {
  id: number;
  userId: string;
  policyId: string;
  claimNumber: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedAmount: number | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // Health claim fields
  treatmentDate?: string;
  hospitalName?: string;
  doctorName?: string;
  diagnosis?: string;
  treatmentDescription?: string;
  claimAmount?: number;
  documents?: string[] | null;
  // Insurance claim fields
  incidentDate?: string;
  incidentDescription?: string;
  incidentLocation?: string;
  damageDescription?: string;
  estimatedCost?: number;
  photos?: string[] | null;
}

interface ClaimReport {
  id: number;
  userId: string;
  reportType: string;
  startDate: string;
  endDate: string;
  totalClaims: number;
  totalClaimedAmount: number;
  totalApprovedAmount: number;
  claimsData: Claim[];
  generatedAt: string;
}

const statusConfig = {
  submitted: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: FileText,
  },
  under_review: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    icon: XCircle,
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    icon: DollarSign,
  },
};

export default function HealthClaimsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [insuranceClaims, setInsuranceClaims] = useState<Claim[]>([]);
  const [healthClaims, setHealthClaims] = useState<Claim[]>([]);
  const [reports, setReports] = useState<ClaimReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [activeTab, setActiveTab] = useState<"claims" | "reports">("claims");
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // Report generation form
  const [reportForm, setReportForm] = useState({
    reportType: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (user) {
      fetchClaims();
      fetchReports();
    }
  }, [user, statusFilter, startDate, endDate]);

  const fetchClaims = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (startDate) params.append("startDate", new Date(startDate).toISOString());
      if (endDate) params.append("endDate", new Date(endDate).toISOString());

      const [insuranceResponse, healthResponse] = await Promise.all([
        fetch(`/api/claims/history?${params.toString()}`, {
          headers: { Authorization: `Bearer ${user.id}` }
        }),
        fetch(`/api/health/claims/history?${params.toString()}`, {
          headers: { Authorization: `Bearer ${user.id}` }
        })
      ]);

      if (insuranceResponse.ok) {
        const insuranceData = await insuranceResponse.json();
        setInsuranceClaims(insuranceData);
      }

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        setHealthClaims(healthData);
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Failed to load claims");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReports = async () => {
    if (!user) return;

    setIsLoadingReports(true);
    try {
      const response = await fetch("/api/reports", {
        headers: { Authorization: `Bearer ${user.id}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!user) return;

    if (!reportForm.startDate || !reportForm.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (new Date(reportForm.endDate) < new Date(reportForm.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    setIsGeneratingReport(true);

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`
        },
        body: JSON.stringify({
          reportType: reportForm.reportType,
          startDate: new Date(reportForm.startDate).toISOString(),
          endDate: new Date(reportForm.endDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate report");
      }

      const newReport = await response.json();
      toast.success("Report generated successfully!");
      setReports([newReport, ...reports]);
      
      // Reset form
      setReportForm({
        reportType: "all",
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const downloadReport = (report: ClaimReport) => {
    const reportData = {
      reportId: report.id,
      reportType: report.reportType,
      dateRange: {
        start: formatDate(report.startDate),
        end: formatDate(report.endDate),
      },
      summary: {
        totalClaims: report.totalClaims,
        totalClaimedAmount: formatCurrency(report.totalClaimedAmount),
        totalApprovedAmount: formatCurrency(report.totalApprovedAmount),
        approvalRate: report.totalClaims > 0 
          ? `${((report.totalApprovedAmount / report.totalClaimedAmount) * 100).toFixed(1)}%`
          : "0%",
      },
      claims: report.claimsData.map(claim => {
        const isHealthClaim = !!claim.diagnosis;
        return {
          claimNumber: claim.claimNumber,
          type: isHealthClaim ? "Health" : "Insurance",
          date: formatDate(claim.treatmentDate || claim.incidentDate || claim.submittedAt),
          ...(isHealthClaim ? {
            hospitalName: claim.hospitalName,
            doctorName: claim.doctorName,
            diagnosis: claim.diagnosis,
          } : {
            incidentDescription: claim.incidentDescription,
            damageDescription: claim.damageDescription,
          }),
          claimAmount: formatCurrency(claim.claimAmount || claim.estimatedCost || 0),
          status: claim.status,
          approvedAmount: claim.approvedAmount ? formatCurrency(claim.approvedAmount) : "N/A",
        };
      }),
      generatedAt: formatDate(report.generatedAt),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `claims-report-${report.reportType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const allClaims = [...insuranceClaims, ...healthClaims].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const totalClaims = allClaims.length;
  const approvedClaims = allClaims.filter((c) => c.status === "approved" || c.status === "paid").length;
  const pendingClaims = allClaims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const totalClaimed = allClaims.reduce((sum, c) => sum + (c.claimAmount || c.estimatedCost || 0), 0);
  const totalApproved = allClaims
    .filter((c) => c.status === "approved" || c.status === "paid")
    .reduce((sum, c) => sum + (c.approvedAmount || 0), 0);

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
                  <p className="text-xs text-muted-foreground">Claims History & Reports</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Claims History & Reports</h2>
            <p className="text-muted-foreground">
              View all your insurance and health claims, generate detailed reports
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-6 md:grid-cols-5 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalClaims}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {healthClaims.length} health, {insuranceClaims.length} insurance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{approvedClaims}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{pendingClaims}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Claimed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {formatCurrency(totalClaimed)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalApproved)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-border">
            <button
              onClick={() => setActiveTab("claims")}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === "claims"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Claims History
              </div>
              {activeTab === "claims" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`pb-3 px-4 font-medium transition-colors relative ${
                activeTab === "reports"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Reports
              </div>
              {activeTab === "reports" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          </div>

          {/* Claims History Tab */}
          {activeTab === "claims" && (
            <>
              {/* Filters */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Claims
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="under_review">Under Review</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {(statusFilter !== "all" || startDate || endDate) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => {
                        setStatusFilter("all");
                        setStartDate("");
                        setEndDate("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>

              {isLoading ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      Loading claims...
                    </div>
                  </CardContent>
                </Card>
              ) : allClaims.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No claims found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {statusFilter !== "all" || startDate || endDate
                          ? "Try adjusting your filters"
                          : "You haven't submitted any claims yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {allClaims.map((claim) => {
                    const StatusIcon = statusConfig[claim.status].icon;
                    const isHealthClaim = !!claim.diagnosis;
                    return (
                      <Card key={`${isHealthClaim ? 'health' : 'insurance'}-${claim.id}`} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">
                                  {claim.claimNumber}
                                </CardTitle>
                                <Badge className={isHealthClaim ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"}>
                                  {isHealthClaim ? "Health" : "Insurance"}
                                </Badge>
                                <Badge className={statusConfig[claim.status].color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig[claim.status].label}
                                </Badge>
                              </div>
                              <CardDescription>
                                Policy: {claim.policyId} • {isHealthClaim ? `Treatment Date: ${formatDate(claim.treatmentDate!)}` : `Incident Date: ${formatDate(claim.incidentDate!)}`}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">Claim Amount</div>
                              <div className="text-lg font-semibold text-foreground">
                                {formatCurrency(claim.claimAmount || claim.estimatedCost || 0)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {isHealthClaim ? (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Hospital Name
                                </h4>
                                <p className="text-foreground">{claim.hospitalName}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Doctor Name
                                </h4>
                                <p className="text-foreground">{claim.doctorName}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Diagnosis
                                </h4>
                                <p className="text-foreground">{claim.diagnosis}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Treatment Description
                                </h4>
                                <p className="text-foreground">{claim.treatmentDescription}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Incident Location
                                </h4>
                                <p className="text-foreground">{claim.incidentLocation}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Incident Date
                                </h4>
                                <p className="text-foreground">{formatDate(claim.incidentDate!)}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Incident Description
                                </h4>
                                <p className="text-foreground">{claim.incidentDescription}</p>
                              </div>
                              <div className="md:col-span-2">
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                                  Damage Description
                                </h4>
                                <p className="text-foreground">{claim.damageDescription}</p>
                              </div>
                            </div>
                          )}

                          {claim.approvedAmount && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Approved Amount
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency(claim.approvedAmount)}
                                </span>
                              </div>
                            </div>
                          )}

                          {claim.rejectionReason && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="font-medium text-sm text-red-600 mb-1">
                                Rejection Reason
                              </h4>
                              <p className="text-foreground">{claim.rejectionReason}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                            <span>Submitted: {formatDate(claim.submittedAt)}</span>
                            {claim.reviewedAt && (
                              <span>Reviewed: {formatDate(claim.reviewedAt)}</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Report Generation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Generate New Report
                  </CardTitle>
                  <CardDescription>
                    Create a detailed report of your claims for a specific time period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reportType">Report Type</Label>
                      <Select
                        value={reportForm.reportType}
                        onValueChange={(value) =>
                          setReportForm({ ...reportForm, reportType: value })
                        }
                      >
                        <SelectTrigger id="reportType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Claims</SelectItem>
                          <SelectItem value="health">Health Claims Only</SelectItem>
                          <SelectItem value="insurance">Insurance Claims Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportStartDate">Start Date</Label>
                      <Input
                        id="reportStartDate"
                        type="date"
                        value={reportForm.startDate}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, startDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reportEndDate">End Date</Label>
                      <Input
                        id="reportEndDate"
                        type="date"
                        value={reportForm.endDate}
                        onChange={(e) =>
                          setReportForm({ ...reportForm, endDate: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={handleGenerateReport}
                        disabled={isGeneratingReport}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {isGeneratingReport ? "Generating..." : "Generate Report"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generated Reports List */}
              {isLoadingReports ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      Loading reports...
                    </div>
                  </CardContent>
                </Card>
              ) : reports.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No reports generated yet
                      </h3>
                      <p className="text-muted-foreground">
                        Generate your first report to see detailed analytics of your claims
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="capitalize">
                              {report.reportType === "all" ? "All Claims Report" : 
                               report.reportType === "health" ? "Health Claims Report" : 
                               "Insurance Claims Report"}
                            </CardTitle>
                            <CardDescription>
                              {formatDate(report.startDate)} - {formatDate(report.endDate)}
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(report)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-4 gap-6 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Total Claims
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {report.totalClaims}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Total Claimed
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {formatCurrency(report.totalClaimedAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Total Approved
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(report.totalApprovedAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">
                              Approval Rate
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {report.totalClaims > 0 && report.totalClaimedAmount > 0
                                ? `${((report.totalApprovedAmount / report.totalClaimedAmount) * 100).toFixed(1)}%`
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        {report.totalClaims > 0 && report.totalClaimedAmount > 0 && (
                          <div className="mt-4 pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Approval Progress</span>
                              <span className="text-sm font-medium">
                                {((report.totalApprovedAmount / report.totalClaimedAmount) * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600 rounded-full transition-all"
                                style={{
                                  width: `${(report.totalApprovedAmount / report.totalClaimedAmount) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground pt-4 border-t border-border mt-4">
                          Generated on {formatDate(report.generatedAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}