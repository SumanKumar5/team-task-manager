"use client";

import { useDashboard } from "@/hooks/use-dashboard";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  TODO: "#8888a8",
  IN_PROGRESS: "#3b82f6",
  IN_REVIEW: "#f59e0b",
  DONE: "#22c55e",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityColors: Record<string, string> = {
  LOW: "#8888a8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useDashboard();
  const router = useRouter();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #2a2a38",
            borderTopColor: "#6d56fa",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Projects",
      value: data?.totalProjects ?? 0,
      icon: FolderKanban,
      color: "#6d56fa",
    },
    {
      label: "Total Tasks",
      value: data?.totalTasks ?? 0,
      icon: LayoutDashboard,
      color: "#3b82f6",
    },
    {
      label: "Overdue Tasks",
      value: data?.overdueTasks ?? 0,
      icon: AlertTriangle,
      color: "#ef4444",
    },
    {
      label: "Completed",
      value:
        data?.tasksByStatus?.find(
          (s: { status: string }) => s.status === "DONE",
        )?._count ?? 0,
      icon: CheckCircle2,
      color: "#22c55e",
    },
  ];

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  }

  return (
    <div style={{ padding: "2rem 2.5rem", maxWidth: "100%" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "#f0f0f8",
            letterSpacing: "-0.02em",
          }}
        >
          {getGreeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#8888a8", marginTop: 4, fontSize: "0.9375rem" }}>
          Here's what's happening with your projects today.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              backgroundColor: "#111118",
              border: "1px solid #2a2a38",
              borderRadius: 12,
              padding: "1.25rem 1.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#8888a8",
                  fontWeight: 500,
                }}
              >
                {label}
              </span>
              <div
                style={{
                  backgroundColor: color + "18",
                  borderRadius: 8,
                  padding: 6,
                  display: "flex",
                }}
              >
                <Icon size={15} color={color} />
              </div>
            </div>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: "#f0f0f8",
                lineHeight: 1,
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#111118",
            border: "1px solid #2a2a38",
            borderRadius: 12,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <TrendingUp size={16} color="#6d56fa" />
            <h2
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#f0f0f8",
              }}
            >
              Tasks by Status
            </h2>
          </div>
          {data?.tasksByStatus?.length === 0 || !data?.tasksByStatus ? (
            <p style={{ color: "#55556a", fontSize: "0.875rem" }}>
              No tasks yet
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {data.tasksByStatus.map(
                (s: { status: string; _count: number }) => (
                  <div key={s.status}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontSize: "0.8125rem", color: "#8888a8" }}>
                        {statusLabels[s.status]}
                      </span>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "#f0f0f8",
                        }}
                      >
                        {s._count}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        backgroundColor: "#1a1a24",
                        borderRadius: 3,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${Math.min((s._count / (data.totalTasks || 1)) * 100, 100)}%`,
                          backgroundColor: statusColors[s.status],
                          borderRadius: 3,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#111118",
            border: "1px solid #2a2a38",
            borderRadius: 12,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.25rem",
            }}
          >
            <Clock size={16} color="#6d56fa" />
            <h2
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "#f0f0f8",
              }}
            >
              Recent Tasks
            </h2>
          </div>
          {!data?.recentTasks?.length ? (
            <p style={{ color: "#55556a", fontSize: "0.875rem" }}>
              No tasks yet
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {data.recentTasks.map(
                (task: {
                  id: string;
                  title: string;
                  priority: string;
                  status: string;
                  createdAt: string;
                  project: { id: string; name: string };
                }) => (
                  <div
                    key={task.id}
                    onClick={() => router.push(`/projects/${task.project.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.625rem 0.75rem",
                      backgroundColor: "#1a1a24",
                      borderRadius: 8,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#f0f0f8",
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#8888a8",
                          marginTop: 2,
                        }}
                      >
                        {task.project.name}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexShrink: 0,
                        marginLeft: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 600,
                          color: priorityColors[task.priority],
                          backgroundColor: priorityColors[task.priority] + "18",
                          padding: "2px 8px",
                          borderRadius: 4,
                        }}
                      >
                        {task.priority}
                      </span>
                      <span style={{ fontSize: "0.6875rem", color: "#55556a" }}>
                        {formatDistanceToNow(new Date(task.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
