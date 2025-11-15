"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new comprehensive admin dashboard
    router.push("/admin/dashboard");
  }, [router]);

  return null;
}
