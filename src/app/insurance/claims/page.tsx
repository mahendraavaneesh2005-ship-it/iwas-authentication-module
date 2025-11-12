"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { toast } from "sonner";


import {
  Shield, User, Settings, TrendingUp, FileText, Plus, AlertCircle, Heart, RefreshCw, IndianRupee,
  Car, ArrowLeft, Clock,XCircle,CheckCircle2
} from "lucide-react";


import Link from "next/link";

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
    icon: IndianRupee,
  },
};

export default function ClaimsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  const fetchClaims = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/claims?userId=₹{user.id}`);
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
  const approvedClaims = claims.filter((c) => c.status === "approved" || c.status === "paid").length;
  const pendingClaims = claims.filter((c) => c.status === "submitted" || c.status === "under_review").length;
  const totalApproved = claims
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
                  <p className="text-xs text-muted-foreground">Insurance Workflow Automation</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">My Claims</h2>
              <p className="text-muted-foreground">
                View and manage your insurance claims
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/insurance/claims/new">
                <Plus className="h-4 w-4 mr-2" />
                New Claim
              </Link>
            </Button>
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
                  Total Approved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(totalApproved)}
                </div>
              </CardContent>
            </Card>
          </div>

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
                    No claims yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't submitted any insurance claims. Start by filing your first claim.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/insurance/claims/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Submit First Claim
                    </Link>
                  </Button>
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
                            Policy: {claim.policyId} • Incident Date: {formatDate(claim.incidentDate)}
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
                        <div>
                          <h4 className="font-medium text-sm text-muted-foreground mb-1">
                            Incident Location
                          </h4>
                          <p className="text-foreground">{claim.incidentLocation}</p>
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

                        <div className="flex items-center justify-between pt-4 border-t border-border text-sm text-muted-foreground">
                          <span>Submitted: {formatDate(claim.submittedAt)}</span>
                          {claim.reviewedAt && (
                            <span>Reviewed: {formatDate(claim.reviewedAt)}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
