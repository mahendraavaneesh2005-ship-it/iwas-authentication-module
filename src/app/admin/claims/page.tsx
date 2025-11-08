"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Shield, FileText, Clock, CheckCircle2, XCircle, DollarSign, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Claim {
  id: number;
  userId: string;
  policyId: string;
  claimNumber: string;
  incidentDate: string;
  incidentDescription: string;
  incidentLocation: string;
  damageDescription: string;
  estimatedCost: number;
  documents: string[] | null;
  photos: string[] | null;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedAmount: number | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
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

export default function AdminClaimsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "",
    approvedAmount: "",
    rejectionReason: "",
    adminNotes: "",
  });

  useEffect(() => {
    fetchClaims();
  }, [filterStatus]);

  const fetchClaims = async () => {
    try {
      const url = filterStatus === "all" 
        ? "/api/claims/all"
        : `/api/claims/all?status=${filterStatus}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch claims");
      }
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Failed to load claims");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewClaim = (claim: Claim) => {
    setSelectedClaim(claim);
    setReviewData({
      status: claim.status,
      approvedAmount: claim.approvedAmount?.toString() || "",
      rejectionReason: claim.rejectionReason || "",
      adminNotes: claim.adminNotes || "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdateClaim = async () => {
    if (!selectedClaim || !user) return;

    // Validation
    if (!reviewData.status) {
      toast.error("Status is required");
      return;
    }

    if (reviewData.status === "approved" && !reviewData.approvedAmount) {
      toast.error("Approved amount is required for approved claims");
      return;
    }

    if (reviewData.status === "rejected" && !reviewData.rejectionReason) {
      toast.error("Rejection reason is required for rejected claims");
      return;
    }

    setIsUpdating(true);

    try {
      const updatePayload: any = {
        status: reviewData.status,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      };

      if (reviewData.approvedAmount) {
        updatePayload.approvedAmount = parseFloat(reviewData.approvedAmount);
      }

      if (reviewData.rejectionReason) {
        updatePayload.rejectionReason = reviewData.rejectionReason;
      }

      if (reviewData.adminNotes) {
        updatePayload.adminNotes = reviewData.adminNotes;
      }

      const response = await fetch(`/api/claims/${selectedClaim.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update claim");
      }

      toast.success("Claim updated successfully");
      setIsDialogOpen(false);
      setSelectedClaim(null);
      fetchClaims();
    } catch (error) {
      console.error("Error updating claim:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update claim");
    } finally {
      setIsUpdating(false);
    }
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

  const totalClaims = claims.length;
  const submittedClaims = claims.filter((c) => c.status === "submitted").length;
  const underReviewClaims = claims.filter((c) => c.status === "under_review").length;
  const totalEstimated = claims.reduce((sum, c) => sum + c.estimatedCost, 0);

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
                  <h1 className="text-xl font-bold text-foreground">IWAS Admin</h1>
                  <p className="text-xs text-muted-foreground">Claims Management</p>
                </div>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Claims Management</h2>
            <p className="text-muted-foreground">
              Review and process insurance claims from users
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalClaims}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  New Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{submittedClaims}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Under Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{underReviewClaims}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Estimated
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(totalEstimated)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Claims</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Claims List */}
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  Loading claims...
                </div>
              </CardContent>
            </Card>
          ) : claims.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No claims found
                  </h3>
                  <p className="text-muted-foreground">
                    {filterStatus === "all"
                      ? "No claims have been submitted yet."
                      : `No claims with status "${filterStatus}".`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => {
                const StatusIcon = statusConfig[claim.status].icon;
                return (
                  <Card key={claim.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              {claim.claimNumber}
                            </CardTitle>
                            <Badge className={statusConfig[claim.status].color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[claim.status].label}
                            </Badge>
                          </div>
                          <CardDescription>
                            User: {claim.userId} • Policy: {claim.policyId} • Incident: {formatDate(claim.incidentDate)}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground">Estimated Cost</div>
                          <div className="text-lg font-semibold text-foreground">
                            {formatCurrency(claim.estimatedCost)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Incident Location
                            </h4>
                            <p className="text-foreground">{claim.incidentLocation}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Submitted
                            </h4>
                            <p className="text-foreground">{formatDate(claim.submittedAt)}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Incident Description
                          </h4>
                          <p className="text-foreground">{claim.incidentDescription}</p>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Damage Description
                          </h4>
                          <p className="text-foreground">{claim.damageDescription}</p>
                        </div>

                        {claim.approvedAmount && (
                          <div className="pt-4 border-t border-border">
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
                          <div className="pt-4 border-t border-border">
                            <h4 className="font-medium text-sm text-red-600 mb-1">
                              Rejection Reason
                            </h4>
                            <p className="text-foreground">{claim.rejectionReason}</p>
                          </div>
                        )}

                        {claim.adminNotes && (
                          <div className="pt-4 border-t border-border">
                            <h4 className="font-medium text-sm text-muted-foreground mb-1">
                              Admin Notes
                            </h4>
                            <p className="text-foreground">{claim.adminNotes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="text-sm text-muted-foreground">
                            {claim.reviewedAt && claim.reviewedBy && (
                              <span>Reviewed by {claim.reviewedBy} on {formatDate(claim.reviewedAt)}</span>
                            )}
                          </div>
                          <Button
                            onClick={() => handleReviewClaim(claim)}
                            variant="outline"
                          >
                            Review / Update
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Claim</DialogTitle>
              <DialogDescription>
                {selectedClaim?.claimNumber} - Update claim status and provide feedback
              </DialogDescription>
            </DialogHeader>

            {selectedClaim && (
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={reviewData.status}
                    onValueChange={(value) =>
                      setReviewData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Approved Amount */}
                {(reviewData.status === "approved" || reviewData.status === "paid") && (
                  <div className="space-y-2">
                    <Label htmlFor="approvedAmount">
                      Approved Amount <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        id="approvedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="pl-8"
                        value={reviewData.approvedAmount}
                        onChange={(e) =>
                          setReviewData((prev) => ({
                            ...prev,
                            approvedAmount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Original estimate: {formatCurrency(selectedClaim.estimatedCost)}
                    </p>
                  </div>
                )}

                {/* Rejection Reason */}
                {reviewData.status === "rejected" && (
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Rejection Reason <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Explain why this claim is being rejected..."
                      rows={4}
                      value={reviewData.rejectionReason}
                      onChange={(e) =>
                        setReviewData((prev) => ({
                          ...prev,
                          rejectionReason: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                {/* Admin Notes */}
                <div className="space-y-2">
                  <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Internal notes about this claim..."
                    rows={3}
                    value={reviewData.adminNotes}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        adminNotes: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateClaim}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUpdating ? "Updating..." : "Update Claim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
