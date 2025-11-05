"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Shield, ArrowLeft, User, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const router = useRouter();
  
  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  
  // Validation errors
  const [profileErrors, setProfileErrors] = useState({ name: "", email: "" });
  const [passwordErrors, setPasswordErrors] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return "";
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setProfileErrors({ name: "", email: "" });
    
    // Validate
    let hasError = false;
    const errors = { name: "", email: "" };
    
    if (!name.trim()) {
      errors.name = "Name is required";
      hasError = true;
    }
    
    if (!email.trim()) {
      errors.email = "Email is required";
      hasError = true;
    } else if (!validateEmail(email)) {
      errors.email = "Please enter a valid email address";
      hasError = true;
    }
    
    if (hasError) {
      setProfileErrors(errors);
      return;
    }
    
    setIsLoadingProfile(true);
    
    try {
      await updateProfile(name, email);
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset errors
    setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    
    // Validate
    let hasError = false;
    const errors = { currentPassword: "", newPassword: "", confirmPassword: "" };
    
    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
      hasError = true;
    }
    
    if (!newPassword) {
      errors.newPassword = "New password is required";
      hasError = true;
    } else {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        errors.newPassword = passwordError;
        hasError = true;
      }
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      hasError = true;
    }
    
    if (hasError) {
      setPasswordErrors(errors);
      return;
    }
    
    setIsLoadingPassword(true);
    
    try {
      await updateProfile(name, email, currentPassword, newPassword);
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
    } catch (error: any) {
      if (error.message.includes("Current password")) {
        setPasswordErrors({ ...errors, currentPassword: error.message });
      }
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleCancelProfile = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setProfileErrors({ name: "", email: "" });
    setIsEditingProfile(false);
  };

  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setIsEditingPassword(false);
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
                  <Link href="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12 max-w-4xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h2>
            <p className="text-muted-foreground">
              Manage your account information and security settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      Profile Information
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Update your name and email address
                    </CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setProfileErrors({ ...profileErrors, name: "" });
                        }}
                        disabled={!isEditingProfile}
                        className={profileErrors.name ? "border-destructive" : ""}
                        placeholder="Enter your full name"
                      />
                      {profileErrors.name && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {profileErrors.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setProfileErrors({ ...profileErrors, email: "" });
                        }}
                        disabled={!isEditingProfile}
                        className={profileErrors.email ? "border-destructive" : ""}
                        placeholder="your.email@example.com"
                      />
                      {profileErrors.email && (
                        <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          {profileErrors.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label htmlFor="userId" className="text-muted-foreground">User ID</Label>
                    <Input
                      id="userId"
                      type="text"
                      value={user?.id}
                      disabled
                      className="font-mono text-sm bg-muted"
                    />
                  </div>

                  {isEditingProfile && (
                    <>
                      <Separator className="my-6" />
                      <div className="flex gap-3 justify-end">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleCancelProfile}
                          disabled={isLoadingProfile}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoadingProfile}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isLoadingProfile ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      Password & Security
                    </CardTitle>
                    <CardDescription className="mt-1.5">
                      Change your password to keep your account secure
                    </CardDescription>
                  </div>
                  {!isEditingPassword && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditingPassword(true)}
                    >
                      Change Password
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!isEditingPassword ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p>Your password is secure. Last changed on {new Date().toLocaleDateString()}</p>
                  </div>
                ) : (
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => {
                            setCurrentPassword(e.target.value);
                            setPasswordErrors({ ...passwordErrors, currentPassword: "" });
                          }}
                          className={passwordErrors.currentPassword ? "border-destructive" : ""}
                          placeholder="Enter your current password"
                          autoComplete="off"
                        />
                        {passwordErrors.currentPassword && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.currentPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            setPasswordErrors({ ...passwordErrors, newPassword: "" });
                          }}
                          className={passwordErrors.newPassword ? "border-destructive" : ""}
                          placeholder="Enter your new password"
                          autoComplete="off"
                        />
                        {passwordErrors.newPassword && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.newPassword}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Must be at least 8 characters with uppercase, lowercase, and numbers
                      </p>
                    </div>

                    <div className="space-y-2 mt-6">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordErrors({ ...passwordErrors, confirmPassword: "" });
                          }}
                          className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                          placeholder="Confirm your new password"
                          autoComplete="off"
                        />
                        {passwordErrors.confirmPassword && (
                          <div className="absolute -bottom-5 left-0 flex items-center gap-1 text-xs text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            {passwordErrors.confirmPassword}
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />
                    
                    <div className="flex gap-3 justify-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleCancelPassword}
                        disabled={isLoadingPassword}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isLoadingPassword}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoadingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Account Actions Card */}
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Sign out of your account</p>
                    <p className="text-sm text-muted-foreground">
                      You'll need to sign in again to access your account
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      logout();
                      router.push("/");
                      toast.success("Signed out successfully");
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}