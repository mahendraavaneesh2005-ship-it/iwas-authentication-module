"use client";
import React from "react";
import RoleList from "./RoleList";
import AddRole from "./AddRole";

export default function RoleManagementPage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Role Management Dashboard</h1>
      <AddRole />
      <RoleList />
    </div>
  );
}