"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProjects,
  useCreateProject,
  useDeleteProject,
} from "@/hooks/use-projects";
import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, type CreateProjectInput } from "@repo/shared";
import { toast } from "sonner";
import {
  Plus,
  FolderKanban,
  Trash2,
  Users,
  CheckSquare,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ConfirmModal } from "@/components/ui/confirm-modal";

type Project = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  members: { id: string }[];
  _count: { tasks: number };
  tasks?: { status: string }[];
};

export default function ProjectsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    projectId: string;
  }>({ open: false, projectId: "" });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = async (data: CreateProjectInput) => {
    try {
      await createProject.mutateAsync(data);
      toast.success("Project created");
      reset();
      setShowModal(false);
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmModal({ open: true, projectId: id });
  };

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

  return (
    <div style={{ padding: "2rem 2.5rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#f0f0f8",
              letterSpacing: "-0.02em",
            }}
          >
            Projects
          </h1>
          <p style={{ color: "#8888a8", marginTop: 4, fontSize: "0.9375rem" }}>
            {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.125rem",
            borderRadius: 8,
            backgroundColor: "#6d56fa",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(109,86,250,0.3)",
          }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {!projects?.length ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#1a1a24",
              borderRadius: "50%",
              padding: "1.25rem",
              marginBottom: "1rem",
            }}
          >
            <FolderKanban size={32} color="#55556a" />
          </div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#f0f0f8",
              marginBottom: 6,
            }}
          >
            No projects yet
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#8888a8",
              maxWidth: 300,
              marginBottom: "1.5rem",
            }}
          >
            Create your first project to start assigning tasks and tracking
            progress.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.125rem",
              borderRadius: 8,
              backgroundColor: "#6d56fa",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {projects.map((project: Project) => {
            const totalTasks = project._count.tasks;
            const doneTasks =
              project.tasks?.filter((t) => t.status === "DONE").length ?? 0;
            const progressPct =
              totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
            const progressColor =
              progressPct === 100
                ? "#22c55e"
                : progressPct >= 50
                  ? "#6d56fa"
                  : "#3b82f6";

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                style={{
                  backgroundColor: "#111118",
                  border: "1px solid #2a2a38",
                  borderRadius: 12,
                  padding: "1.25rem 1.5rem",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#6d56fa50";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#13131c";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "#2a2a38";
                  (e.currentTarget as HTMLDivElement).style.backgroundColor =
                    "#111118";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#6d56fa18",
                      borderRadius: 8,
                      padding: 8,
                      display: "flex",
                    }}
                  >
                    <FolderKanban size={18} color="#6d56fa" />
                  </div>
                  {project.ownerId === user?.id && (
                    <button
                      onClick={(e) => handleDelete(e, project.id)}
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "#55556a",
                        padding: 4,
                        borderRadius: 6,
                        display: "flex",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#ef4444";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "#ef444418";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "#55556a";
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.backgroundColor = "transparent";
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <h3
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                    color: "#f0f0f8",
                    marginBottom: 4,
                  }}
                >
                  {project.name}
                </h3>
                {project.description && (
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#8888a8",
                      marginBottom: "1rem",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {project.description}
                  </p>
                )}

                <div style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: "0.75rem", color: "#8888a8" }}>
                      Progress
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: progressPct === 100 ? "#22c55e" : "#f0f0f8",
                      }}
                    >
                      {progressPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      backgroundColor: "#1a1a24",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        backgroundColor: progressColor,
                        borderRadius: 3,
                        transition: "width 0.6s ease",
                        boxShadow:
                          progressPct > 0
                            ? `0 0 8px ${progressColor}60`
                            : "none",
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#55556a",
                      marginTop: 4,
                    }}
                  >
                    {doneTasks} of {totalTasks} task
                    {totalTasks !== 1 ? "s" : ""} completed
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    paddingTop: "0.875rem",
                    borderTop: "1px solid #1f1f2b",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.75rem",
                      color: "#8888a8",
                    }}
                  >
                    <CheckSquare size={12} />
                    {project._count.tasks} tasks
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.75rem",
                      color: "#8888a8",
                    }}
                  >
                    <Users size={12} />
                    {project.members.length} members
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: "0.75rem",
                      color: "#55556a",
                      marginLeft: "auto",
                    }}
                  >
                    <Calendar size={12} />
                    {formatDistanceToNow(new Date(project.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 10,
              width: "100%",
              maxWidth: 480,
              backgroundColor: "#111118",
              border: "1px solid #2a2a38",
              borderRadius: 16,
              boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #2a2a38",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "1.0625rem",
                  fontWeight: 600,
                  color: "#f0f0f8",
                }}
              >
                Create Project
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#8888a8",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div className="input-wrapper">
                <label className="input-label">Project name</label>
                <input
                  className="input-field"
                  style={{ paddingLeft: "0.875rem" }}
                  placeholder="e.g. Website Redesign"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="input-error">{errors.name.message}</p>
                )}
              </div>
              <div className="input-wrapper">
                <label className="input-label">
                  Description{" "}
                  <span style={{ color: "#55556a" }}>(optional)</span>
                </label>
                <textarea
                  {...register("description")}
                  placeholder="What is this project about?"
                  style={{
                    width: "100%",
                    minHeight: 80,
                    borderRadius: 10,
                    border: "1px solid #2a2a38",
                    backgroundColor: "#1a1a24",
                    padding: "0.625rem 0.875rem",
                    fontSize: "0.9375rem",
                    color: "#f0f0f8",
                    outline: "none",
                    resize: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                  marginTop: "0.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    reset();
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #2a2a38",
                    backgroundColor: "transparent",
                    color: "#8888a8",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#6d56fa",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    opacity: createProject.isPending ? 0.7 : 1,
                  }}
                >
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmModal.open}
        title="Delete project"
        description="This will permanently delete the project and all its tasks. This action cannot be undone."
        confirmLabel="Delete project"
        onConfirm={async () => {
          try {
            await deleteProject.mutateAsync(confirmModal.projectId);
            toast.success("Project deleted");
          } catch {
            toast.error("Failed to delete project");
          }
          setConfirmModal({ open: false, projectId: "" });
        }}
        onCancel={() => setConfirmModal({ open: false, projectId: "" })}
      />
    </div>
  );
}
