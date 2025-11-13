"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void | Promise<void>;
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Registration failed");
    }
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user as User;
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Invalid email or password");
    }
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user as User;
  };

  const updateProfile = async (name: string, email: string, currentPassword?: string, newPassword?: string) => {
    if (!user) throw new Error("No user logged in");
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, currentPassword, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || "Update failed");
    }
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  const logout = async () => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}