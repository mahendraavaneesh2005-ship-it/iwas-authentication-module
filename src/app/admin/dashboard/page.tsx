"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Shield, Users, FileText, TrendingUp, Clock, CheckCircle2, XCircle, DollarSign,
  AlertCircle, BarChart3, Settings, LogOut, Home, Edit2, Trash2, Eye, ArrowRight,
  ArrowLeft, Filter, Download, ChevronDown, ChevronUp, Search, Plus
} from "lucide-react";
import Link from "next/link";

// Types
interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin" | "insurer";
  createdAt?: string;
}

interface HealthClaim {
  id: number;
  userId: string;
  policyId: string;
  claimNumber: string;
  treatmentDate: string;
  hospitalName: string;
  doctorName: string;
  diagnosis: string;
  claimAmount: number;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedAmount: number | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InsuranceClaim {
  id: number;
  userId: string;
  policyId: string;
  claimNumber: string;
  incidentDate: string;
  incidentDescription: string;
  incidentLocation: string;
  damageDescription: string;
  estimatedCost: number;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  approvedAmount: number | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HealthPolicy {
  id: number;
  userId: string;
  policyNumber: string;
  policyholderName: string;
  status: "active" | "inactive" | "expired";
  monthlyPremium: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface InsurancePolicy {
  id: number;
  userId: string;
  policyNumber: string;
  status: string;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface HealthApplication {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  selectedPlanId: string;
  calculatedPremium: number;
  submittedAt: string;
  createdAt: string;
}

interface InsuranceApplication {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface Payment {
  id: number;
  userId: string;
  policyId: string;
  applicationId: string;
  paymentAmount: number;
  paymentStatus: "pending" | "completed" | "failed";
  paymentMethod: string;
  paidAt: string;
  createdAt: string;
}

// Status Config
const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-800 dark:bg-blue-900", icon: FileText },
  under_review: { label: "Under Review", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-800 dark:bg-green-900", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-800 dark:bg-red-900", icon: XCircle },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900", icon: DollarSign },
  pending: { label: "Pending", color: "bg-gray-100 text-gray-800 dark:bg-gray-900", icon: Clock },
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "user" | "admin" | "insurer">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUserRole, setNewUserRole] = useState<User["role"]>("user");

  // Health Claims State
  const [healthClaims, setHealthClaims] = useState<HealthClaim[]>([]);
  const [healthClaimsLoading, setHealthClaimsLoading] = useState(false);
  const [healthClaimFilter, setHealthClaimFilter] = useState("all");
  const [selectedHealthClaim, setSelectedHealthClaim] = useState<HealthClaim | null>(null);
  const [isHealthClaimDialogOpen, setIsHealthClaimDialogOpen] = useState(false);
  const [healthClaimReview, setHealthClaimReview] = useState({
    status: "",
    approvedAmount: "",
    rejectionReason: "",
  });

  // Insurance Claims State
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>([]);
  const [insuranceClaimsLoading, setInsuranceClaimsLoading] = useState(false);
  const [insuranceClaimFilter, setInsuranceClaimFilter] = useState("all");
  const [selectedInsuranceClaim, setSelectedInsuranceClaim] = useState<InsuranceClaim | null>(null);
  const [isInsuranceClaimDialogOpen, setIsInsuranceClaimDialogOpen] = useState(false);
  const [insuranceClaimReview, setInsuranceClaimReview] = useState({
    status: "",
    approvedAmount: "",
    rejectionReason: "",
  });

  // Health Policies State
  const [healthPolicies, setHealthPolicies] = useState<HealthPolicy[]>([]);
  const [healthPoliciesLoading, setHealthPoliciesLoading] = useState(false);

  // Insurance Policies State
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [insurancePoliciesLoading, setInsurancePoliciesLoading] = useState(false);

  // Health Applications State
  const [healthApps, setHealthApps] = useState<HealthApplication[]>([]);
  const [healthAppsLoading, setHealthAppsLoading] = useState(false);
  const [healthAppFilter, setHealthAppFilter] = useState("all");

  // Insurance Applications State
  const [insuranceApps, setInsuranceApps] = useState<InsuranceApplication[]>([]);
  const [insuranceAppsLoading, setInsuranceAppsLoading] = useState(false);
  const [insuranceAppFilter, setInsuranceAppFilter] = useState("all");

  // Payments State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Guard
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="border-destructive/30 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>Only admins can view this page.</CardContent>
        </Card>
      </div>
    );
  }

  // Fetch functions
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users`, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers((data.users || []) as User[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHealthClaims = async () => {
    setHealthClaimsLoading(true);
    try {
      const res = await fetch(`${API}/api/health/claims`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load health claims");
      const data = await res.json();
      setHealthClaims((data || []) as HealthClaim[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load health claims");
    } finally {
      setHealthClaimsLoading(false);
    }
  };

  const fetchInsuranceClaims = async () => {
    setInsuranceClaimsLoading(true);
    try {
      const res = await fetch(`/api/claims/all`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load insurance claims");
      const data = await res.json();
      setInsuranceClaims((data || []) as InsuranceClaim[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load insurance claims");
    } finally {
      setInsuranceClaimsLoading(false);
    }
  };

  const fetchHealthPolicies = async () => {
    setHealthPoliciesLoading(true);
    try {
      const res = await fetch(`${API}/api/health/policies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load health policies");
      const data = await res.json();
      setHealthPolicies((data || []) as HealthPolicy[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load health policies");
    } finally {
      setHealthPoliciesLoading(false);
    }
  };

  const fetchInsurancePolicies = async () => {
    setInsurancePoliciesLoading(true);
    try {
      const res = await fetch(`${API}/api/insurance/policies`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load insurance policies");
      const data = await res.json();
      setInsurancePolicies((data || []) as InsurancePolicy[]);
    } catch (e: any) {
      toast.error(e.message || "Failed to load insurance policies");
    } finally {
      setInsurancePoliciesLoading(false);
    }
  };

  // Load data on mount and tab changes
  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else if (activeTab === "health-claims") fetchHealthClaims();
    else if (activeTab === "insurance-claims") fetchInsuranceClaims();
    else if (activeTab === "health-policies") fetchHealthPolicies();
    else if (activeTab === "insurance-policies") fetchInsurancePolicies();
  }, [activeTab]);

  // Update user role
  const updateUserRole = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`${API}/api/admin/users/${selectedUser._id}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newUserRole }),
      });
      if (!res.ok) throw new Error("Failed to update user role");
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, role: newUserRole } : u));
      toast.success("User role updated");
      setIsUserDialogOpen(false);
      setSelectedUser(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update user role");
    }
  };

  // Update health claim
  const updateHealthClaim = async () => {
    if (!selectedHealthClaim || !user) return;
    if (!healthClaimReview.status || (healthClaimReview.status === "approved" && !healthClaimReview.approvedAmount) || (healthClaimReview.status === "rejected" && !healthClaimReview.rejectionReason)) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      const payload: any = {
        status: healthClaimReview.status,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      };
      if (healthClaimReview.approvedAmount) payload.approvedAmount = parseFloat(healthClaimReview.approvedAmount);
      if (healthClaimReview.rejectionReason) payload.rejectionReason = healthClaimReview.rejectionReason;

      const res = await fetch(`/api/health/claims/${selectedHealthClaim.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update claim");
      toast.success("Health claim updated");
      setIsHealthClaimDialogOpen(false);
      fetchHealthClaims();
    } catch (e: any) {
      toast.error(e.message || "Failed to update claim");
    }
  };

  // Update insurance claim
  const updateInsuranceClaim = async () => {
    if (!selectedInsuranceClaim || !user) return;
    if (!insuranceClaimReview.status || (insuranceClaimReview.status === "approved" && !insuranceClaimReview.approvedAmount) || (insuranceClaimReview.status === "rejected" && !insuranceClaimReview.rejectionReason)) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      const payload: any = {
        status: insuranceClaimReview.status,
        reviewedBy: user.id,
        reviewedAt: new Date().toISOString(),
      };
      if (insuranceClaimReview.approvedAmount) payload.approvedAmount = parseFloat(insuranceClaimReview.approvedAmount);
      if (insuranceClaimReview.rejectionReason) payload.rejectionReason = insuranceClaimReview.rejectionReason;

      const res = await fetch(`/api/claims/${selectedInsuranceClaim.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update claim");
      toast.success("Insurance claim updated");
      setIsInsuranceClaimDialogOpen(false);
      fetchInsuranceClaims();
    } catch (e: any) {
      toast.error(e.message || "Failed to update claim");
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      totalAdmins: users.filter(u => u.role === "admin").length,
      totalInsurers: users.filter(u => u.role === "insurer").length,
      totalClaimsHealth: healthClaims.length,
      totalClaimsInsurance: insuranceClaims.length,
      pendingClaimsHealth: healthClaims.filter(c => c.status === "submitted" || c.status === "under_review").length,
      pendingClaimsInsurance: insuranceClaims.filter(c => c.status === "submitted" || c.status === "under_review").length,
      approvedClaimsHealth: healthClaims.filter(c => c.status === "approved").length,
      approvedClaimsInsurance: insuranceClaims.filter(c => c.status === "approved").length,
      totalHealthPolicies: healthPolicies.length,
      totalInsurancePolicies: insurancePolicies.length,
      totalPremiumHealth: healthPolicies.reduce((sum, p) => sum + p.monthlyPremium, 0),
      totalPremiumInsurance: insurancePolicies.reduce((sum, p) => sum + p.premium, 0),
      totalApprovedAmountHealth: healthClaims.filter(c => c.status === "approved" || c.status === "paid").reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
      totalApprovedAmountInsurance: insuranceClaims.filter(c => c.status === "approved" || c.status === "paid").reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
    };
  }, [users, healthClaims, insuranceClaims, healthPolicies, insurancePolicies]);

  // Filter functions
  const filteredUsers = useMemo(() => {
    let list = users;
    if (userRoleFilter !== "all") list = list.filter(u => u.role === userRoleFilter);
    if (userSearch) {
      const q = userSearch.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [users, userRoleFilter, userSearch]);

  const filteredHealthClaims = useMemo(() => {
    if (healthClaimFilter === "all") return healthClaims;
    return healthClaims.filter(c => c.status === healthClaimFilter);
  }, [healthClaims, healthClaimFilter]);

  const filteredInsuranceClaims = useMemo(() => {
    if (insuranceClaimFilter === "all") return insuranceClaims;
    return insuranceClaims.filter(c => c.status === insuranceClaimFilter);
  }, [insuranceClaims, insuranceClaimFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        {/* Header */}
        <header className="border-b border-border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">IWAS Admin Dashboard</h1>
                  <p className="text-xs text-muted-foreground">Complete Insurance Management System</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Overview Stats */}
          {activeTab === "overview" && (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard Overview</h2>
                <p className="text-muted-foreground">Monitor all insurance activities and operations</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalUsers}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.totalAdmins} admins, {stats.totalInsurers} insurers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Health Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalClaimsHealth}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.pendingClaimsHealth} pending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Insurance Claims</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{stats.totalClaimsInsurance}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.pendingClaimsInsurance} pending</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Policies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalHealthPolicies + stats.totalInsurancePolicies}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stats.totalHealthPolicies} health, {stats.totalInsurancePolicies} insurance</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Approved Claims Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalApprovedAmountHealth + stats.totalApprovedAmountInsurance)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total paid out</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Health Policies Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalPremiumHealth * 12)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Annual premium</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Insurance Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPremiumInsurance * 12)}</div>
                    <p className="text-xs text-muted-foreground mt-1">Annual premium</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.totalClaimsHealth + stats.totalClaimsInsurance > 0
                        ? Math.round(((stats.approvedClaimsHealth + stats.approvedClaimsInsurance) / (stats.totalClaimsHealth + stats.totalClaimsInsurance)) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Overall approval rate</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="health-claims" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Health Claims</span>
              </TabsTrigger>
              <TabsTrigger value="insurance-claims" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Ins. Claims</span>
              </TabsTrigger>
              <TabsTrigger value="health-policies" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Health Pol.</span>
              </TabsTrigger>
              <TabsTrigger value="insurance-policies" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Ins. Pol.</span>
              </TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage users, roles, and permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={userRoleFilter} onValueChange={(v: any) => setUserRoleFilter(v)}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="insurer">Insurer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                          </TableRow>
                        ) : filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((u) => (
                            <TableRow key={u._id}>
                              <TableCell className="font-medium">{u.name}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={u.role === "admin" ? "bg-blue-100" : u.role === "insurer" ? "bg-green-100" : "bg-gray-100"}>
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "N/A"}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setNewUserRole(u.role);
                                    setIsUserDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Claims Tab */}
            <TabsContent value="health-claims" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Insurance Claims</CardTitle>
                  <CardDescription>Review and approve health insurance claims</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <Select value={healthClaimFilter} onValueChange={setHealthClaimFilter}>
                      <SelectTrigger className="w-56">
                        <SelectValue />
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

                  <div className="space-y-4">
                    {healthClaimsLoading ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
                      </Card>
                    ) : filteredHealthClaims.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">No claims found</CardContent>
                      </Card>
                    ) : (
                      filteredHealthClaims.map((claim) => (
                        <Card key={claim.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                                  <Badge className={statusConfig[claim.status].color}>
                                    {statusConfig[claim.status].label}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  User: {claim.userId} | Hospital: {claim.hospitalName} | Treatment: {formatDate(claim.treatmentDate)}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Claim Amount</div>
                                <div className="text-lg font-bold">{formatCurrency(claim.claimAmount)}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Doctor</h4>
                                <p className="text-foreground">{claim.doctorName}</p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-muted-foreground mb-1">Diagnosis</h4>
                                <p className="text-foreground">{claim.diagnosis}</p>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedHealthClaim(claim);
                                  setHealthClaimReview({
                                    status: claim.status,
                                    approvedAmount: claim.approvedAmount?.toString() || "",
                                    rejectionReason: claim.rejectionReason || "",
                                  });
                                  setIsHealthClaimDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance Claims Tab */}
            <TabsContent value="insurance-claims" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Claims</CardTitle>
                  <CardDescription>Review and approve general insurance claims</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3 items-center">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <Select value={insuranceClaimFilter} onValueChange={setInsuranceClaimFilter}>
                      <SelectTrigger className="w-56">
                        <SelectValue />
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

                  <div className="space-y-4">
                    {insuranceClaimsLoading ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
                      </Card>
                    ) : filteredInsuranceClaims.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">No claims found</CardContent>
                      </Card>
                    ) : (
                      filteredInsuranceClaims.map((claim) => (
                        <Card key={claim.id} className="hover:shadow-md transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                                  <Badge className={statusConfig[claim.status].color}>
                                    {statusConfig[claim.status].label}
                                  </Badge>
                                </div>
                                <CardDescription>
                                  User: {claim.userId} | Location: {claim.incidentLocation} | Incident: {formatDate(claim.incidentDate)}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground">Estimated Cost</div>
                                <div className="text-lg font-bold">{formatCurrency(claim.estimatedCost)}</div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Incident Description</h4>
                              <p className="text-foreground text-sm">{claim.incidentDescription}</p>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInsuranceClaim(claim);
                                  setInsuranceClaimReview({
                                    status: claim.status,
                                    approvedAmount: claim.approvedAmount?.toString() || "",
                                    rejectionReason: claim.rejectionReason || "",
                                  });
                                  setIsInsuranceClaimDialogOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Policies Tab */}
            <TabsContent value="health-policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Insurance Policies</CardTitle>
                  <CardDescription>View all active health insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Number</TableHead>
                          <TableHead>Policyholder</TableHead>
                          <TableHead>Coverage</TableHead>
                          <TableHead>Monthly Premium</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valid Until</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {healthPoliciesLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                          </TableRow>
                        ) : healthPolicies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No policies found</TableCell>
                          </TableRow>
                        ) : (
                          healthPolicies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                              <TableCell>{policy.policyholderName}</TableCell>
                              <TableCell>{formatCurrency(policy.coverageAmount)}</TableCell>
                              <TableCell>{formatCurrency(policy.monthlyPremium)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={policy.status === "active" ? "bg-green-100" : "bg-red-100"}>
                                  {policy.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(policy.endDate)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Insurance Policies Tab */}
            <TabsContent value="insurance-policies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Insurance Policies</CardTitle>
                  <CardDescription>View all active insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Policy Number</TableHead>
                          <TableHead>Coverage Amount</TableHead>
                          <TableHead>Annual Premium</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valid Until</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {insurancePoliciesLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                          </TableRow>
                        ) : insurancePolicies.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No policies found</TableCell>
                          </TableRow>
                        ) : (
                          insurancePolicies.map((policy) => (
                            <TableRow key={policy.id}>
                              <TableCell className="font-medium">{policy.policyNumber}</TableCell>
                              <TableCell>{formatCurrency(policy.coverageAmount)}</TableCell>
                              <TableCell>{formatCurrency(policy.premium)}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={policy.status === "active" ? "bg-green-100" : "bg-red-100"}>
                                  {policy.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(policy.endDate)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* User Edit Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>Update the role for {selectedUser?.name}</DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={selectedUser.name} disabled />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={selectedUser.email} disabled />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUserRole} onValueChange={(v: any) => setNewUserRole(v)}>
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="insurer">Insurer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Cancel</Button>
              <Button onClick={updateUserRole} className="bg-blue-600 hover:bg-blue-700">Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Health Claim Review Dialog */}
        <Dialog open={isHealthClaimDialogOpen} onOpenChange={setIsHealthClaimDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Health Claim</DialogTitle>
              <DialogDescription>{selectedHealthClaim?.claimNumber}</DialogDescription>
            </DialogHeader>
            {selectedHealthClaim && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Hospital</Label>
                    <p className="font-medium">{selectedHealthClaim.hospitalName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Doctor</Label>
                    <p className="font-medium">{selectedHealthClaim.doctorName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Diagnosis</Label>
                    <p className="font-medium">{selectedHealthClaim.diagnosis}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Claim Amount</Label>
                    <p className="font-medium">{formatCurrency(selectedHealthClaim.claimAmount)}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                  <Select value={healthClaimReview.status} onValueChange={(v) => setHealthClaimReview({ ...healthClaimReview, status: v })}>
                    <SelectTrigger id="status">
                      <SelectValue />
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

                {(healthClaimReview.status === "approved" || healthClaimReview.status === "paid") && (
                  <div>
                    <Label htmlFor="approvedAmount">Approved Amount <span className="text-red-500">*</span></Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={healthClaimReview.approvedAmount}
                      onChange={(e) => setHealthClaimReview({ ...healthClaimReview, approvedAmount: e.target.value })}
                    />
                  </div>
                )}

                {healthClaimReview.status === "rejected" && (
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Explain why this claim is being rejected..."
                      value={healthClaimReview.rejectionReason}
                      onChange={(e) => setHealthClaimReview({ ...healthClaimReview, rejectionReason: e.target.value })}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsHealthClaimDialogOpen(false)}>Cancel</Button>
              <Button onClick={updateHealthClaim} className="bg-blue-600 hover:bg-blue-700">Update Claim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Insurance Claim Review Dialog */}
        <Dialog open={isInsuranceClaimDialogOpen} onOpenChange={setIsInsuranceClaimDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Insurance Claim</DialogTitle>
              <DialogDescription>{selectedInsuranceClaim?.claimNumber}</DialogDescription>
            </DialogHeader>
            {selectedInsuranceClaim && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs">Incident Location</Label>
                    <p className="font-medium">{selectedInsuranceClaim.incidentLocation}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs">Estimated Cost</Label>
                    <p className="font-medium">{formatCurrency(selectedInsuranceClaim.estimatedCost)}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground text-xs">Incident Description</Label>
                  <p className="font-medium text-sm">{selectedInsuranceClaim.incidentDescription}</p>
                </div>

                <div>
                  <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
                  <Select value={insuranceClaimReview.status} onValueChange={(v) => setInsuranceClaimReview({ ...insuranceClaimReview, status: v })}>
                    <SelectTrigger id="status">
                      <SelectValue />
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

                {(insuranceClaimReview.status === "approved" || insuranceClaimReview.status === "paid") && (
                  <div>
                    <Label htmlFor="approvedAmount">Approved Amount <span className="text-red-500">*</span></Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={insuranceClaimReview.approvedAmount}
                      onChange={(e) => setInsuranceClaimReview({ ...insuranceClaimReview, approvedAmount: e.target.value })}
                    />
                  </div>
                )}

                {insuranceClaimReview.status === "rejected" && (
                  <div>
                    <Label htmlFor="rejectionReason">Rejection Reason <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Explain why this claim is being rejected..."
                      value={insuranceClaimReview.rejectionReason}
                      onChange={(e) => setInsuranceClaimReview({ ...insuranceClaimReview, rejectionReason: e.target.value })}
                      rows={4}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInsuranceClaimDialogOpen(false)}>Cancel</Button>
              <Button onClick={updateInsuranceClaim} className="bg-blue-600 hover:bg-blue-700">Update Claim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
