// src/contexts/useAuth.tsx
"use client";

/**
 * Small compatibility wrapper so imports like "@/contexts/useAuth"
 * work while your main AuthContext implementation lives in AuthContext.tsx.
 *
 * It re-exports the AuthProvider and useAuth hook from AuthContext.tsx.
 */

export { AuthProvider, useAuth } from "./AuthContext";
