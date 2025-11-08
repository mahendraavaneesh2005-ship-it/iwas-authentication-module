"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, User, Settings, TrendingUp, FileText, Car, Plus } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
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
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12 max-w-6xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-muted-foreground">
              Here's an overview of your account and quick actions
            </p>
          </div>

          {/* Insurance Actions */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Insurance Services</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-200 dark:border-blue-900" onClick={() => router.push("/insurance/apply")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <Plus className="h-5 w-5 text-blue-600" />
                    </div>
                    New Insurance Application
                  </CardTitle>
                  <CardDescription>Apply for vehicle insurance coverage</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start a new insurance application for your vehicle. Get instant premium calculation and coverage options.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/insurance/apply">
                      Apply Now →
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/insurance/policies")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    My Policies
                  </CardTitle>
                  <CardDescription>View and manage your insurance policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access your active insurance policies, view coverage details, and manage your account.
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/insurance/policies">
                      View Policies →
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Profile Card */}
            <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/profile")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Profile
                </CardTitle>
                <CardDescription>Manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <Button variant="link" className="p-0 h-auto text-blue-600" asChild>
                  <Link href="/profile">Edit Profile →</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  Account Status
                </CardTitle>
                <CardDescription>Your current activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="text-xs font-mono text-muted-foreground">{user?.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600" />
                  </div>
                  Quick Actions
                </CardTitle>
                <CardDescription>Manage your preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                  <Link href="/insurance/policies">
                    <FileText className="h-4 w-4 mr-2" />
                    View Policies
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started Section */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with IWAS</CardTitle>
              <CardDescription>Complete these steps to get the most out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create your account</p>
                    <p className="text-sm text-muted-foreground">You've successfully registered with IWAS</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Apply for insurance</p>
                    <p className="text-sm text-muted-foreground">Get coverage for your vehicle with instant quotes</p>
                    <Button variant="link" className="p-0 h-auto mt-1 text-blue-600" asChild>
                      <Link href="/insurance/apply">Start Application →</Link>
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Manage your policies</p>
                    <p className="text-sm text-muted-foreground">Track and manage all your insurance policies in one place</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}