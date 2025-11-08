"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, CheckCircle2, Users, TrendingUp, Lock, User } from "lucide-react";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Navigation */}
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
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:inline">
                    Welcome, {user.name}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </Button>
                  <Button onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-full px-4 py-2 mb-8">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">
                Stories 2.4 & 2.5 Complete — Claims Workflow Ready
              </span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Insurance Workflow<br />
              <span className="text-blue-600">Simplified</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Streamline your insurance operations with IWAS. Secure, compliant, and built for modern insurance professionals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button size="lg" onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8">
                  Open Dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8">
                    <Link href="/register">Create Account</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg h-14 px-8">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mb-6">
                <Lock className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Secure & Compliant</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with role-based access control and complete audit trails
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Work seamlessly with agents, claims officers, and administrators in one platform
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-border p-8 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Get instant insights and reports to make data-driven decisions faster
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 IWAS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}