// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/useAuth"; // adjust path if your context path differs
import { useRouter } from "next/navigation";

type UserItem = {
  _id: string;
  id?: string; // some parts of code use id, some use _id
  name: string;
  email: string;
  role: "user" | "admin" | "insurer";
};

const ROLE_OPTIONS: UserItem["role"][] = ["user", "insurer", "admin"];

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [users, setUsers] = useState<UserItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  // block non-admins
  useEffect(() => {
    if (!isLoading && !user) {
      // not logged in — redirect to login
      router.push("/login");
    }
    // if user exists but not admin, leave them on page and show denied message
  }, [user, isLoading, router]);

  // fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load users");
      }
      const data = await res.json();
      // data.users is expected
      setUsers(data.users || []);
    } catch (e: any) {
      console.error("Failed to fetch users:", e);
      alert("Error loading users: " + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  // role change handler
  const handleRoleChange = async (userId: string, newRole: UserItem["role"]) => {
    if (!confirm(`Change role of user to "${newRole}"?`)) return;

    setSavingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update role");
      }
      // success — update local list
      setUsers(prev => prev ? prev.map(u => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u)) : prev);
      alert("Role updated successfully");
    } catch (e: any) {
      console.error("update role error", e);
      alert("Error updating role: " + (e.message || e));
    } finally {
      setSavingId(null);
    }
  };

  // simple table UI
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>Admin — Role Management</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Only admins may view and change user roles.
      </p>

      {isLoading || !user ? (
        <div>Loading auth...</div>
      ) : user.role !== "admin" ? (
        <div style={{ padding: 20, borderRadius: 8, background: "#fff6f6", color: "#8b0000" }}>
          Access denied — you must be an admin to view this page.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <button onClick={() => fetchUsers()} disabled={loading} style={{ padding: "8px 12px" }}>
              {loading ? "Refreshing..." : "Refresh list"}
            </button>
          </div>

          <div style={{ overflowX: "auto", background: "#fff", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                  <th style={{ padding: "12px 16px" }}>Name</th>
                  <th style={{ padding: "12px 16px" }}>Email</th>
                  <th style={{ padding: "12px 16px" }}>Role</th>
                  <th style={{ padding: "12px 16px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map(u => {
                    const id = u._id || u.id!;
                    return (
                      <tr key={id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "12px 16px" }}>{u.name}</td>
                        <td style={{ padding: "12px 16px" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(id, e.target.value as UserItem["role"])}
                            disabled={savingId === id}
                            style={{ padding: "6px 8px", minWidth: 140 }}
                          >
                            {ROLE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <button
                            onClick={() => handleRoleChange(id, u.role)}
                            disabled={savingId === id}
                            style={{ padding: "6px 8px" }}
                          >
                            {savingId === id ? "Saving..." : "Save"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: 20 }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
