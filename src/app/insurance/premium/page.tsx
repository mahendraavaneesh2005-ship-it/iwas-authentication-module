"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { calculatePremium } from "@/lib/premiumCalculator";

export default function PremiumListPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/api/insurance/applications?userId=${user?.id}`, { credentials: "include" });
        if (!res.ok) { setApplications([]); return; }
        const rows = await res.json();
        const withPremium = rows.map((doc: any) => {
          const prem = calculatePremium({
            vehicleType: doc.vehicleType,
            driverAge: doc.driverAge,
            driverExperience: doc.driverExperience,
            coverageType: doc.coverageType,
            deductible: doc.deductible,
          });
          return { ...doc, finalPremium: prem.finalPremium };
        });
        setApplications(withPremium);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) load();
  }, [API_URL, user?.id]);

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Your Premium Applications</h1>
      {loading ? (
        <div>Loading...</div>
      ) : applications.length === 0 ? (
        <div>No premium applications found.</div>
      ) : (
        <ul className="space-y-4">
          {applications.map((app: any) => (
            <li key={app._id} className="border rounded p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold">Vehicle: {app.vehicleType || ""} {app.vehicleMake} {app.vehicleModel} ({app.vehicleYear})</div>
                <div className="text-sm text-muted-foreground">Application ID: {app._id}</div>
                <div className="text-sm">Premium: ₹{app.finalPremium}</div>
              </div>
              <Link
                href={`/insurance/premium/${app._id}`}
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
