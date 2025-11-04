"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find((u: any) => u.email === email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const newUser = {
      id: Math.random().toString(36).substring(7),
      name,
      email,
      password, // In production, this should be hashed
    };

    // Store in "database" (localStorage)
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Set current user
    const userWithoutPassword = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check credentials
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Set current user
    const userWithoutPassword = { id: user.id, name: user.name, email: user.email };
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
