"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl space-y-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User ID</p>
                  <p className="text-sm font-mono">{user?.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>Your activity overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                  <p className="text-sm">{new Date().toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete these steps to get the most out of your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">
                    ✓
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Create your account</p>
                    <p className="text-sm text-muted-foreground">You&apos;ve successfully registered</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-muted-foreground">Add more information about yourself</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Explore features</p>
                    <p className="text-sm text-muted-foreground">Discover what you can do with your account</p>
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
