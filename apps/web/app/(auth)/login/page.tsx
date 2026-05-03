"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, Lock, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginSchema, type LoginInput } from "@repo/shared";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", data);
      setAuth(res.data.user, res.data.token);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-grid">
      <div className="auth-panel-left">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Zap size={20} color="white" />
          </div>
          <span
            style={{ fontSize: "1.25rem", fontWeight: 700, color: "#f0f0f8" }}
          >
            TeamFlow
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <h2 className="left-headline">
              Ship faster,
              <br />
              <span>together.</span>
            </h2>
            <p className="left-body">
              The modern workspace for high-performing teams. Track work, manage
              projects, and hit every deadline.
            </p>
          </div>
          <div className="left-features">
            {[
              "Role-based access for every team",
              "Real-time task tracking & updates",
              "Dashboard with overdue alerts",
            ].map((f) => (
              <div key={f} className="left-feature">
                <CheckCircle2
                  size={18}
                  color="#6d56fa"
                  style={{ flexShrink: 0 }}
                />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: "0.8125rem", color: "#55556a" }}>
          © 2026 TeamFlow. Built for modern teams.
        </p>
      </div>

      <div className="auth-panel-right">
        <div className="auth-card">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">
            Sign in to continue to your workspace
          </p>

          <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="input-wrapper">
              <label className="input-label">Email address</label>
              <div className="input-relative">
                <span className="input-icon">
                  <Mail size={16} />
                </span>
                <input
                  className="input-field"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="input-error">{errors.email.message}</p>
              )}
            </div>

            <div className="input-wrapper">
              <label className="input-label">Password</label>
              <div className="input-relative">
                <span className="input-icon">
                  <Lock size={16} />
                </span>
                <input
                  className="input-field"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="input-error">{errors.password.message}</p>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <svg
                  style={{
                    width: 18,
                    height: 18,
                    animation: "spin 1s linear infinite",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    style={{ opacity: 0.25 }}
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    style={{ opacity: 0.75 }}
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              ) : (
                <>
                  Sign in <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="auth-link">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
