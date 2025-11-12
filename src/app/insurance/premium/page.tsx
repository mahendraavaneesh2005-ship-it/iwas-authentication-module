"use client";

import Link from "next/link";

// Adjust the imported type if needed
import { VehicleApplication } from "@/types/insurance"; 

export default function PremiumListPage() {
  // Get user applications from localStorage for demonstration purposes
  const applications = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("applications") || "[]")
    : [];

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Premium Applications</h1>
      {applications.length === 0 ? (
        <div>No premium applications found.</div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app: VehicleApplication) => (
            <li key={app.id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">Vehicle: {app.vehicleType} {app.make} {app.model} ({app.year})</div>
                <div className="text-sm text-muted-foreground">Application ID: {app.id}</div>
                <div className="text-sm">Premium: ₹{app.finalPremium}</div>
              </div>
              <Link
                href={`/insurance/premium/₹{app.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
