"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type UserItem = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: "user" | "admin" | "insurer";
  createdAt?: string;
};

const ROLE_OPTIONS: UserItem["role"][] = ["user", "insurer", "admin"];

export default function AdminUsersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserItem["role"]>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserItem["role"]>>({});

  // Guard: require login and admin
  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/users`, { method: "GET", credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to load users");
      }
      const data = await res.json();
      setUsers((data.users || []) as UserItem[]);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchUsers();
  }, [user]);

  // Derived data: stats, filtered, paginated
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === "admin").length;
    const insurers = users.filter(u => u.role === "insurer").length;
    const basic = users.filter(u => u.role === "user").length;
    return { total, admins, insurers, basic };
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users;
    if (roleFilter !== "all") list = list.filter(u => u.role === roleFilter);
    if (q) list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    return list;
  }, [users, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onSelectRole = (id: string, role: UserItem["role"]) => {
    setPendingRoles(prev => ({ ...prev, [id]: role }));
  };

  const saveRole = async (userId: string) => {
    const newRole = pendingRoles[userId];
    if (!newRole) return;
    setSavingId(userId);
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/role`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update role");
      setUsers(prev => prev.map(u => (u._id === userId || u.id === userId ? { ...u, role: newRole } : u)));
      setPendingRoles(prev => {
        const clone = { ...prev };
        delete clone[userId];
        return clone;
      });
      toast.success("Role updated");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Error updating role");
    } finally {
      setSavingId(null);
    }
  };

  const resetRole = (userId: string) => {
    setPendingRoles(prev => {
      const clone = { ...prev };
      delete clone[userId];
      return clone;
    });
  };

  const exportCSV = () => {
    const headers = ["name", "email", "role"];
    const rows = filtered.map(u => [u.name, u.email, u.role]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

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
            <CardTitle className="text-destructive">Access denied</CardTitle>
          </CardHeader>
          <CardContent>Only admins can view this page.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchUsers()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="secondary" onClick={exportCSV}>Export CSV</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Admins</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.admins}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Insurers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.insurers}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{stats.basic}</CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          />
        </div>
        <div className="w-full sm:w-56">
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v as any); setPage(1); }}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLE_OPTIONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="min-w-[160px]">Role</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((u) => {
                    const id = u._id || u.id!;
                    const current = pendingRoles[id] ?? u.role;
                    const dirty = pendingRoles[id] !== undefined && pendingRoles[id] !== u.role;
                    const disabled = savingId === id;
                    return (
                      <TableRow key={id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Select value={current} onValueChange={(v) => onSelectRole(id, v as UserItem["role"]) } disabled={disabled}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map(r => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => saveRole(id)} disabled={!dirty || disabled}>
                              {disabled ? "Saving..." : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resetRole(id)} disabled={!dirty || disabled}>Reset</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
          <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}
