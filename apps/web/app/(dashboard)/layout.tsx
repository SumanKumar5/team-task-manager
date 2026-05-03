"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && !token) router.push("/login");
  }, [token, _hasHydrated, router]);

  if (!_hasHydrated) return null;
  if (!token) return null;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0a0a0f",
      }}
    >
      <Sidebar />
      <main style={{ flex: 1, overflow: "auto", height: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
