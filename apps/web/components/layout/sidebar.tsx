"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Zap, LayoutDashboard, FolderKanban, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/projects", icon: FolderKanban, label: "Projects" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
      toast.success("Logged out");
    }
  };

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        height: "100vh",
        backgroundColor: "#0d0d15",
        borderRight: "1px solid #2a2a38",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{ padding: "1.5rem 1.25rem", borderBottom: "1px solid #2a2a38" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              borderRadius: 10,
              backgroundColor: "#6d56fa",
              padding: 8,
              display: "flex",
              boxShadow: "0 4px 12px rgba(109,86,250,0.3)",
            }}
          >
            <Zap size={16} color="white" />
          </div>
          <span
            style={{ fontSize: "1.0625rem", fontWeight: 700, color: "#f0f0f8" }}
          >
            TeamFlow
          </span>
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "0.75rem 0.75rem",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.9rem",
                fontWeight: active ? 600 : 400,
                color: active ? "#f0f0f8" : "#8888a8",
                backgroundColor: active ? "#1a1a24" : "transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                borderLeft: active
                  ? "2px solid #6d56fa"
                  : "2px solid transparent",
              }}
            >
              <Icon size={17} color={active ? "#6d56fa" : "#8888a8"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: "0.75rem", borderTop: "1px solid #2a2a38" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            padding: "0.625rem 0.75rem",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#6d56fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "white",
              flexShrink: 0,
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "#f0f0f8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: "#8888a8",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.625rem 0.75rem",
            borderRadius: 8,
            fontSize: "0.875rem",
            color: "#8888a8",
            backgroundColor: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#1a1a24";
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "#8888a8";
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
