  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import { useAuth } from "@/contexts/AuthContext";
  import ProtectedRoute from "@/components/ProtectedRoute";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  import { Shield, ArrowLeft, FileText, Calendar, IndianRupee, CheckCircle, XCircle, Clock, Plus, RefreshCw, AlertCircle, Heart, } from "lucide-react";
  import Link from "next/link";
  import { toast } from "sonner";

  interface HealthPolicy {
    id: number;
    userId: string;
    applicationId: number;
    planId: number;
    policyNumber: string;
    policyholderName: string;
    email: string;
    monthlyPremium: number;
    coverageAmount: number;
    startDate: string;
    endDate: string;
    status: string;
    paymentStatus: string;
    renewalDate: string;
    renewalReminderSent: string;
    createdAt: string;
    updatedAt: string;
    plan: {
      id: number;
      name: string;
      description: string;
      coverageAmount: number;
      monthlyPremiumBase: number;
      features: string[];
      deductible: number;
      copayPercentage: number;
    };
    daysUntilExpiry?: number;
  }

  export default function HealthPoliciesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [policies, setPolicies] = useState<HealthPolicy[]>([]);
    const [expiringPolicies, setExpiringPolicies] = useState<HealthPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [renewingPolicyId, setRenewingPolicyId] = useState<number | null>(null);

    useEffect(() => {
      if (user?.id) {
        fetchPolicies();
        fetchExpiringPolicies();
      }
    }, [user?.id]);

    const fetchPolicies = async () => {
      try {
        const response = await fetch(`/api/health/policies?userId=₹{user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setPolicies(data);
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error);
        toast.error("Failed to load policies");
      } finally {
        setLoading(false);
      }
    };

    const fetchExpiringPolicies = async () => {
      try {
        const response = await fetch(`/api/health/policies/expiring?userId=₹{user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setExpiringPolicies(data);
        }
      } catch (error) {
        console.error("Failed to fetch expiring policies:", error);
      }
    };

    const handleRenewPolicy = async (policyId: number) => {
      setRenewingPolicyId(policyId);
      try {
        const response = await fetch(`/api/health/policies/₹{policyId}/renew`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user?.id }),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("Policy renewed successfully! Coverage extended for another year.");
          // Refresh policies
          await fetchPolicies();
          await fetchExpiringPolicies();
        } else {
          toast.error(data.error || "Failed to renew policy");
        }
      } catch (error) {
        console.error("Failed to renew policy:", error);
        toast.error("An error occurred while renewing the policy");
      } finally {
        setRenewingPolicyId(null);
      }
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case "active":
          return (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          );
        case "pending":
          return (
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Clock className="h-3 w-3 mr-1" />
              Pending
            </Badge>
          );
        case "expired":
          return (
            <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
              <XCircle className="h-3 w-3 mr-1" />
              Expired
            </Badge>
          );
        case "cancelled":
          return (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              Cancelled
            </Badge>
          );
        default:
          return <Badge>{status}</Badge>;
      }
    };

    const getPaymentStatusBadge = (status: string) => {
      switch (status) {
        case "paid":
          return (
            <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
              Paid
            </Badge>
          );
        case "pending":
          return (
            <Badge variant="outline" className="border-yellow-200 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300">
              Pending
            </Badge>
          );
        case "overdue":
          return (
            <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
              Overdue
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const isExpiringSoon = (endDate: string) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
    };

    const canRenew = (endDate: string) => {
      const daysUntilExpiry = Math.ceil(
        (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry <= 60 && daysUntilExpiry >= -60;
    };

    if (loading) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-muted-foreground">Loading health policies...</p>
            </div>
          </div>
        </ProtectedRoute>
      );
    }

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
                    <p className="text-xs text-muted-foreground">Health Insurance Policies</p>
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

          <div className="container mx-auto px-6 py-12 max-w-6xl">
            {/* Expiring Policies Alert */}
            {expiringPolicies.length > 0 && (
              <Card className="mb-8 border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
                    <AlertCircle className="h-5 w-5" />
                    Action Required: Policies Expiring Soon
                  </CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">
                    You have {expiringPolicies.length} {expiringPolicies.length === 1 ? "policy" : "policies"} expiring within 30 days. Renew now to maintain coverage.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringPolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 rounded-lg p-4">
                        <div>
                          <p className="font-semibold">{policy.plan.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Policy #{policy.policyNumber} • Expires in {policy.daysUntilExpiry} {policy.daysUntilExpiry === 1 ? "day" : "days"}
                          </p>
                        </div>
                        <Button
                          onClick={() => handleRenewPolicy(policy.id)}
                          disabled={renewingPolicyId === policy.id}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {renewingPolicyId === policy.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Renewing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Renew Now
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">My Health Insurance Policies</h2>
                  <p className="text-muted-foreground">
                    View, manage, and renew your health insurance coverage
                  </p>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Policies</p>
                        <p className="text-2xl font-bold">{policies.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                          {policies.filter((p) => p.status === "active").length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Expiring Soon</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {expiringPolicies.length}
                        </p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Monthly Premium</p>
                        <p className="text-2xl font-bold">
                          ₹{policies.filter((p) => p.status === "active").reduce((sum, p) => sum + p.monthlyPremium, 0).toLocaleString()}
                        </p>
                      </div>
                      <IndianRupee className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Policies List */}
            {policies.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-950/30 mb-4">
                      <Heart className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Health Policies Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      You don't have any health insurance policies yet. Apply for coverage to protect your health and well-being.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {policies.map((policy) => {
                  const expiringSoon = isExpiringSoon(policy.endDate);
                  const renewable = canRenew(policy.endDate);

                  return (
                    <Card key={policy.id} className={`hover:shadow-md transition-shadow ₹{expiringSoon ? "border-orange-200 dark:border-orange-900" : ""}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <CardTitle className="text-xl">{policy.plan.name}</CardTitle>
                              {getStatusBadge(policy.status)}
                              {getPaymentStatusBadge(policy.paymentStatus)}
                              {expiringSoon && (
                                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Expiring Soon
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm">{policy.policyNumber}</span>
                              <span>•</span>
                              <span>{policy.policyholderName}</span>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Monthly Premium</p>
                            <p className="text-2xl font-bold text-blue-600">₹{policy.monthlyPremium.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">₹{(policy.monthlyPremium * 12).toLocaleString()}/year</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Coverage Amount</p>
                              <p className="font-semibold">₹{policy.coverageAmount.toLocaleString()}</p>
                              <p className="text-sm text-muted-foreground">Deductible: ₹{policy.plan.deductible.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <Calendar className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Policy Period</p>
                              <p className="font-semibold text-sm">{formatDate(policy.startDate)}</p>
                              <p className="text-sm text-muted-foreground">to {formatDate(policy.endDate)}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <Heart className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Co-pay</p>
                              <p className="font-semibold">{policy.plan.copayPercentage}%</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Next Renewal</p>
                              <p className="font-semibold text-sm">{formatDate(policy.renewalDate)}</p>
                            </div>
                          </div>
                        </div>

                        {/* Features */}
                        {policy.plan.features && policy.plan.features.length > 0 && (
                          <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold mb-2">Coverage Includes:</p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {policy.plan.features.map((feature, index) => (
                                <li key={index} className="text-sm flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-6 border-t">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          {policy.status === "active" && renewable && (
                            <Button
                              size="sm"
                              onClick={() => handleRenewPolicy(policy.id)}
                              disabled={renewingPolicyId === policy.id}
                              className={expiringSoon ? "bg-orange-600 hover:bg-orange-700" : ""}
                            >
                              {renewingPolicyId === policy.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Renewing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Renew Policy
                                </>
                              )}
                            </Button>
                          )}
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
