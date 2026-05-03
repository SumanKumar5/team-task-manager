"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/hooks/use-projects";
import { useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useAddMember, useRemoveMember } from "@/hooks/use-projects";
import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTaskSchema,
  type CreateTaskInput,
  addMemberSchema,
  type AddMemberInput,
  type UpdateTaskInput,
} from "@repo/shared";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  UserPlus,
  Trash2,
  Calendar,
  User,
  Shield,
  Users,
  X,
  AlignLeft,
  Tag,
  Search,
  ChevronRight,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const COLUMNS = [
  { key: "TODO", label: "To Do", color: "#8888a8" },
  { key: "IN_PROGRESS", label: "In Progress", color: "#3b82f6" },
  { key: "IN_REVIEW", label: "In Review", color: "#f59e0b" },
  { key: "DONE", label: "Done", color: "#22c55e" },
];

const priorityColors: Record<string, string> = {
  LOW: "#8888a8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  URGENT: "#ef4444",
};

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  assignedTo?: { id: string; name: string; email: string };
  createdBy: { id: string; name: string; email: string };
};

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
};

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: project, isLoading } = useProject(id);
  const createTask = useCreateTask(id);
  const updateTask = useUpdateTask(id);
  const deleteTask = useDeleteTask(id);
  const addMember = useAddMember(id);
  const removeMember = useRemoveMember(id);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterAssignee, setFilterAssignee] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: "task" | "member";
    id: string;
  } | null>(null);

  const taskForm = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: { priority: "MEDIUM", status: "TODO" },
  });
  const memberForm = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
  });

  const currentMember = project?.members?.find(
    (m: Member) => m.user.id === user?.id,
  );
  const isAdmin = currentMember?.role === "ADMIN";

  const onCreateTask = async (data: CreateTaskInput) => {
    try {
      await createTask.mutateAsync(data);
      toast.success("Task created");
      taskForm.reset({ priority: "MEDIUM", status: "TODO" });
      setShowTaskModal(false);
    } catch {
      toast.error("Failed to create task");
    }
  };

  const onUpdateTask = async (taskId: string, data: UpdateTaskInput) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data });
      if (selectedTask) {
        setSelectedTask({ ...selectedTask, ...data } as Task);
      }
      toast.success("Task updated");
      setEditingField(null);
    } catch {
      toast.error("Failed to update task");
    }
  };

  const onDeleteTask = (taskId: string) => {
    setConfirmModal({ open: true, type: "task", id: taskId });
  };

  const onAddMember = async (data: AddMemberInput) => {
    try {
      await addMember.mutateAsync(data);
      toast.success("Member added");
      memberForm.reset();
      setShowMemberModal(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error;
      toast.error(msg ?? "Failed to add member");
    }
  };

  const onRemoveMember = (memberId: string) => {
    setConfirmModal({ open: true, type: "member", id: memberId });
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

  if (!project)
    return (
      <div style={{ padding: "2rem", color: "#8888a8" }}>Project not found</div>
    );

  const tasksByStatus = COLUMNS.reduce(
    (acc, col) => {
      acc[col.key] =
        project.tasks?.filter((t: Task) => {
          const matchesStatus = t.status === col.key;
          const matchesPriority =
            !filterPriority || t.priority === filterPriority;
          const matchesAssignee =
            !filterAssignee || t.assignedTo?.id === filterAssignee;
          const matchesSearch =
            !searchQuery ||
            t.title.toLowerCase().includes(searchQuery.toLowerCase());
          return (
            matchesStatus && matchesPriority && matchesAssignee && matchesSearch
          );
        }) ?? [];
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const selectedTaskFresh = selectedTask
    ? (project.tasks?.find((t: Task) => t.id === selectedTask.id) ??
      selectedTask)
    : null;

  const hasActiveFilters = filterPriority || filterAssignee || searchQuery;

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div
        style={{
          flex: 1,
          padding: "2rem 2.5rem",
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <button
            onClick={() => router.push("/projects")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              backgroundColor: "transparent",
              border: "none",
              color: "#8888a8",
              cursor: "pointer",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              padding: 0,
            }}
          >
            <ArrowLeft size={15} /> Back to projects
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <h1
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "#f0f0f8",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {project.name}
                </h1>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: isAdmin ? "#6d56fa" : "#f59e0b",
                    backgroundColor: isAdmin ? "#6d56fa18" : "#f59e0b18",
                    padding: "3px 10px",
                    borderRadius: 6,
                    border: `1px solid ${isAdmin ? "#6d56fa30" : "#f59e0b30"}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Shield size={11} />
                  {isAdmin ? "Admin" : "Member"}
                </span>
              </div>
              {project.description && (
                <p
                  style={{
                    color: "#8888a8",
                    marginTop: 4,
                    fontSize: "0.9375rem",
                  }}
                >
                  {project.description}
                </p>
              )}
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              {isAdmin && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    border: "1px solid #2a2a38",
                    backgroundColor: "transparent",
                    color: "#8888a8",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  <UserPlus size={15} /> Manage Members
                </button>
              )}
              <button
                onClick={() => setShowTaskModal(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#6d56fa",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(109,86,250,0.3)",
                }}
              >
                <Plus size={15} /> Add Task
              </button>
            </div>
          </div>

          {/* Team members */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            <Users size={14} color="#55556a" />
            <span
              style={{
                fontSize: "0.8125rem",
                color: "#55556a",
                marginRight: "0.5rem",
              }}
            >
              Team:
            </span>
            {project.members?.map((m: Member) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  backgroundColor: "#1a1a24",
                  border: "1px solid #2a2a38",
                  padding: "3px 10px 3px 6px",
                  borderRadius: 20,
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    backgroundColor: m.role === "ADMIN" ? "#6d56fa" : "#f59e0b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.625rem",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {m.user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#f0f0f8" }}>
                  {m.user.name}
                </span>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    color: m.role === "ADMIN" ? "#6d56fa" : "#f59e0b",
                    fontWeight: 600,
                  }}
                >
                  {m.role}
                </span>
                {isAdmin && m.user.id !== user?.id && (
                  <button
                    onClick={() => onRemoveMember(m.user.id)}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "#55556a",
                      cursor: "pointer",
                      padding: "0 0 0 4px",
                      display: "flex",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.color =
                        "#55556a")
                    }
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Filter bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#111118",
            border: "1px solid #2a2a38",
            borderRadius: 10,
          }}
        >
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#55556a",
              }}
            />
            <input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                height: 34,
                borderRadius: 8,
                border: "1px solid #2a2a38",
                backgroundColor: "#1a1a24",
                paddingLeft: "2rem",
                paddingRight: "0.75rem",
                fontSize: "0.875rem",
                color: "#f0f0f8",
                outline: "none",
              }}
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              height: 34,
              borderRadius: 8,
              border: "1px solid #2a2a38",
              backgroundColor: "#1a1a24",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              color: filterPriority ? "#f0f0f8" : "#55556a",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            style={{
              height: 34,
              borderRadius: 8,
              border: "1px solid #2a2a38",
              backgroundColor: "#1a1a24",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              color: filterAssignee ? "#f0f0f8" : "#55556a",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">All assignees</option>
            {project.members?.map((m: Member) => (
              <option key={m.user.id} value={m.user.id}>
                {m.user.name}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setFilterPriority("");
                setFilterAssignee("");
                setSearchQuery("");
              }}
              style={{
                height: 34,
                padding: "0 0.75rem",
                borderRadius: 8,
                border: "1px solid #2a2a38",
                backgroundColor: "transparent",
                color: "#8888a8",
                cursor: "pointer",
                fontSize: "0.8125rem",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Kanban board */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
            gap: "1rem",
            flex: 1,
            overflowX: "auto",
            paddingBottom: "0.5rem",
          }}
        >
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              style={{
                backgroundColor: "#111118",
                border: "1px solid #2a2a38",
                borderRadius: 12,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                minHeight: 400,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: col.color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "#f0f0f8",
                    }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#55556a",
                    backgroundColor: "#1a1a24",
                    padding: "2px 7px",
                    borderRadius: 10,
                  }}
                >
                  {tasksByStatus[col.key].length}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                  flex: 1,
                }}
              >
                {tasksByStatus[col.key].map((task: Task) => {
                  const isOverdue =
                    task.dueDate &&
                    new Date(task.dueDate) < new Date() &&
                    task.status !== "DONE";
                  return (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      style={{
                        backgroundColor: "#0d0d15",
                        border: `1px solid ${isOverdue ? "#ef444430" : selectedTask?.id === task.id ? "#6d56fa60" : "#2a2a38"}`,
                        borderRadius: 10,
                        padding: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.borderColor =
                          isOverdue ? "#ef444460" : "#6d56fa50")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.borderColor =
                          isOverdue
                            ? "#ef444430"
                            : selectedTask?.id === task.id
                              ? "#6d56fa60"
                              : "#2a2a38")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#f0f0f8",
                            lineHeight: 1.4,
                            flex: 1,
                          }}
                        >
                          {task.title}
                        </p>
                        <ChevronRight
                          size={14}
                          color="#55556a"
                          style={{ flexShrink: 0, marginLeft: 4 }}
                        />
                      </div>

                      {task.description && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#8888a8",
                            marginBottom: "0.625rem",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {task.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.375rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.6875rem",
                            fontWeight: 600,
                            color: priorityColors[task.priority],
                            backgroundColor:
                              priorityColors[task.priority] + "18",
                            padding: "2px 7px",
                            borderRadius: 4,
                          }}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: "0.6875rem",
                              color: isOverdue ? "#ef4444" : "#8888a8",
                              fontWeight: isOverdue ? 600 : 400,
                            }}
                          >
                            <Calendar size={10} />
                            {isOverdue
                              ? "Overdue"
                              : format(new Date(task.dueDate), "MMM d")}
                          </span>
                        )}
                        {task.assignedTo && (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 3,
                              fontSize: "0.6875rem",
                              color: "#8888a8",
                              marginLeft: "auto",
                            }}
                          >
                            <User size={10} />
                            {task.assignedTo.name.split(" ")[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tasksByStatus[col.key].length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      color: "#55556a",
                      fontSize: "0.8125rem",
                      border: "1px dashed #2a2a38",
                      borderRadius: 8,
                      minHeight: 80,
                    }}
                  >
                    {hasActiveFilters ? "No matching tasks" : "No tasks"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Side Panel */}
      {selectedTaskFresh && (
        <>
          <div
            onClick={() => setSelectedTask(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
              backgroundColor: "rgba(0,0,0,0.3)",
            }}
          />
          <div
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 420,
              zIndex: 40,
              backgroundColor: "#111118",
              borderLeft: "1px solid #2a2a38",
              display: "flex",
              flexDirection: "column",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.4)",
              animation: "slideIn 0.25s ease",
            }}
          >
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #2a2a38",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "#8888a8",
                  fontWeight: 500,
                }}
              >
                Task Details
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {(isAdmin || selectedTaskFresh.createdBy.id === user?.id) && (
                  <button
                    onClick={() => onDeleteTask(selectedTaskFresh.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "5px 10px",
                      borderRadius: 6,
                      border: "1px solid #ef444430",
                      backgroundColor: "#ef444410",
                      color: "#ef4444",
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#8888a8",
                    cursor: "pointer",
                    display: "flex",
                    padding: 4,
                    borderRadius: 6,
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
              {editingField === "title" ? (
                <input
                  autoFocus
                  defaultValue={selectedTaskFresh.title}
                  onBlur={(e) =>
                    onUpdateTask(selectedTaskFresh.id, {
                      title: e.target.value,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      (e.target as HTMLInputElement).blur();
                  }}
                  style={{
                    width: "100%",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#f0f0f8",
                    backgroundColor: "#1a1a24",
                    border: "1px solid #6d56fa",
                    borderRadius: 8,
                    padding: "0.5rem 0.75rem",
                    outline: "none",
                  }}
                />
              ) : (
                <h2
                  onClick={() => setEditingField("title")}
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#f0f0f8",
                    lineHeight: 1.3,
                    cursor: "text",
                    padding: "0.25rem",
                    borderRadius: 6,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "#1a1a24")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  {selectedTaskFresh.title}
                </h2>
              )}

              <div style={{ marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#55556a" }}>
                  Created by {selectedTaskFresh.createdBy.name} ·{" "}
                  {formatDistanceToNow(new Date(selectedTaskFresh.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "#55556a",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Status
                    </label>
                    <select
                      value={selectedTaskFresh.status}
                      onChange={(e) =>
                        onUpdateTask(selectedTaskFresh.id, {
                          status: e.target.value as
                            | "TODO"
                            | "IN_PROGRESS"
                            | "IN_REVIEW"
                            | "DONE",
                        })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid #2a2a38",
                        backgroundColor: "#1a1a24",
                        padding: "0 0.75rem",
                        fontSize: "0.875rem",
                        color: "#f0f0f8",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "#55556a",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Priority
                    </label>
                    <select
                      value={selectedTaskFresh.priority}
                      onChange={(e) =>
                        onUpdateTask(selectedTaskFresh.id, {
                          priority: e.target.value as
                            | "LOW"
                            | "MEDIUM"
                            | "HIGH"
                            | "URGENT",
                        })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid #2a2a38",
                        backgroundColor: "#1a1a24",
                        padding: "0 0.75rem",
                        fontSize: "0.875rem",
                        color: priorityColors[selectedTaskFresh.priority],
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "#55556a",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Assignee
                    </label>
                    <select
                      value={selectedTaskFresh.assignedTo?.id ?? ""}
                      onChange={(e) =>
                        onUpdateTask(selectedTaskFresh.id, {
                          assignedToId: e.target.value || undefined,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid #2a2a38",
                        backgroundColor: "#1a1a24",
                        padding: "0 0.75rem",
                        fontSize: "0.875rem",
                        color: "#f0f0f8",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">Unassigned</option>
                      {project.members?.map((m: Member) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "0.75rem",
                        color: "#55556a",
                        fontWeight: 500,
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      defaultValue={
                        selectedTaskFresh.dueDate
                          ? new Date(selectedTaskFresh.dueDate)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onBlur={(e) =>
                        onUpdateTask(selectedTaskFresh.id, {
                          dueDate: e.target.value || undefined,
                        })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        borderRadius: 8,
                        border: "1px solid #2a2a38",
                        backgroundColor: "#1a1a24",
                        padding: "0 0.75rem",
                        fontSize: "0.8125rem",
                        color: "#f0f0f8",
                        outline: "none",
                        colorScheme: "dark",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "0.75rem",
                      color: "#55556a",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 6,
                    }}
                  >
                    <AlignLeft size={11} /> Description
                  </label>
                  {editingField === "description" ? (
                    <textarea
                      autoFocus
                      defaultValue={selectedTaskFresh.description ?? ""}
                      onBlur={(e) =>
                        onUpdateTask(selectedTaskFresh.id, {
                          description: e.target.value || undefined,
                        })
                      }
                      style={{
                        width: "100%",
                        minHeight: 120,
                        borderRadius: 8,
                        border: "1px solid #6d56fa",
                        backgroundColor: "#1a1a24",
                        padding: "0.625rem 0.75rem",
                        fontSize: "0.875rem",
                        color: "#f0f0f8",
                        outline: "none",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => setEditingField("description")}
                      style={{
                        minHeight: 80,
                        borderRadius: 8,
                        border: "1px solid #2a2a38",
                        backgroundColor: "#1a1a24",
                        padding: "0.625rem 0.75rem",
                        fontSize: "0.875rem",
                        color: selectedTaskFresh.description
                          ? "#f0f0f8"
                          : "#55556a",
                        cursor: "text",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "#6d56fa50")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.borderColor =
                          "#2a2a38")
                      }
                    >
                      {selectedTaskFresh.description ?? "Add a description..."}
                    </div>
                  )}
                </div>

                <div
                  style={{ paddingTop: "1rem", borderTop: "1px solid #1f1f2b" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: "0.75rem",
                    }}
                  >
                    <Tag size={12} color="#55556a" />
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "#55556a",
                        fontWeight: 500,
                      }}
                    >
                      Details
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.8125rem", color: "#8888a8" }}>
                        Created by
                      </span>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "#f0f0f8",
                          fontWeight: 500,
                        }}
                      >
                        {selectedTaskFresh.createdBy.name}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.8125rem", color: "#8888a8" }}>
                        Created
                      </span>
                      <span style={{ fontSize: "0.8125rem", color: "#f0f0f8" }}>
                        {format(
                          new Date(selectedTaskFresh.createdAt),
                          "MMM d, yyyy",
                        )}
                      </span>
                    </div>
                    {selectedTaskFresh.dueDate && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{ fontSize: "0.8125rem", color: "#8888a8" }}
                        >
                          Due
                        </span>
                        <span
                          style={{
                            fontSize: "0.8125rem",
                            color:
                              new Date(selectedTaskFresh.dueDate) <
                                new Date() &&
                              selectedTaskFresh.status !== "DONE"
                                ? "#ef4444"
                                : "#f0f0f8",
                            fontWeight:
                              new Date(selectedTaskFresh.dueDate) < new Date()
                                ? 600
                                : 400,
                          }}
                        >
                          {format(
                            new Date(selectedTaskFresh.dueDate),
                            "MMM d, yyyy 'at' h:mm a",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
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
            onClick={() => setShowTaskModal(false)}
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
              maxWidth: 500,
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
                Create Task
              </h2>
              <button
                onClick={() => setShowTaskModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#8888a8",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={taskForm.handleSubmit(onCreateTask)}
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div className="input-wrapper">
                <label className="input-label">Title</label>
                <input
                  className="input-field"
                  style={{ paddingLeft: "0.875rem" }}
                  placeholder="Task title"
                  {...taskForm.register("title")}
                />
                {taskForm.formState.errors.title && (
                  <p className="input-error">
                    {taskForm.formState.errors.title.message}
                  </p>
                )}
              </div>
              <div className="input-wrapper">
                <label className="input-label">
                  Description{" "}
                  <span style={{ color: "#55556a" }}>(optional)</span>
                </label>
                <textarea
                  {...taskForm.register("description")}
                  placeholder="Describe the task..."
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
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div className="input-wrapper">
                  <label className="input-label">Priority</label>
                  <select
                    {...taskForm.register("priority")}
                    style={{
                      height: 44,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #2a2a38",
                      backgroundColor: "#1a1a24",
                      padding: "0 0.875rem",
                      fontSize: "0.9375rem",
                      color: "#f0f0f8",
                      outline: "none",
                    }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="input-wrapper">
                  <label className="input-label">Status</label>
                  <select
                    {...taskForm.register("status")}
                    style={{
                      height: 44,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #2a2a38",
                      backgroundColor: "#1a1a24",
                      padding: "0 0.875rem",
                      fontSize: "0.9375rem",
                      color: "#f0f0f8",
                      outline: "none",
                    }}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div className="input-wrapper">
                  <label className="input-label">
                    Due date{" "}
                    <span style={{ color: "#55556a" }}>(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    {...taskForm.register("dueDate")}
                    style={{
                      height: 44,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #2a2a38",
                      backgroundColor: "#1a1a24",
                      padding: "0 0.875rem",
                      fontSize: "0.875rem",
                      color: "#f0f0f8",
                      outline: "none",
                      colorScheme: "dark",
                    }}
                  />
                </div>
                <div className="input-wrapper">
                  <label className="input-label">
                    Assign to{" "}
                    <span style={{ color: "#55556a" }}>(optional)</span>
                  </label>
                  <select
                    {...taskForm.register("assignedToId")}
                    onChange={(e) =>
                      taskForm.setValue(
                        "assignedToId",
                        e.target.value || undefined,
                      )
                    }
                    style={{
                      height: 44,
                      width: "100%",
                      borderRadius: 10,
                      border: "1px solid #2a2a38",
                      backgroundColor: "#1a1a24",
                      padding: "0 0.875rem",
                      fontSize: "0.9375rem",
                      color: "#f0f0f8",
                      outline: "none",
                    }}
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m: Member) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    setShowTaskModal(false);
                    taskForm.reset();
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
                  disabled={createTask.isPending}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#6d56fa",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    opacity: createTask.isPending ? 0.7 : 1,
                  }}
                >
                  {createTask.isPending ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
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
            onClick={() => setShowMemberModal(false)}
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
              maxWidth: 420,
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
                Add Member
              </h2>
              <button
                onClick={() => setShowMemberModal(false)}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#8888a8",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                }}
              >
                ×
              </button>
            </div>
            <form
              onSubmit={memberForm.handleSubmit(onAddMember)}
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div className="input-wrapper">
                <label className="input-label">Email address</label>
                <input
                  className="input-field"
                  style={{ paddingLeft: "0.875rem" }}
                  type="email"
                  placeholder="teammate@company.com"
                  {...memberForm.register("email")}
                />
                {memberForm.formState.errors.email && (
                  <p className="input-error">
                    {memberForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="input-wrapper">
                <label className="input-label">Role</label>
                <select
                  {...memberForm.register("role")}
                  style={{
                    height: 44,
                    width: "100%",
                    borderRadius: 10,
                    border: "1px solid #2a2a38",
                    backgroundColor: "#1a1a24",
                    padding: "0 0.875rem",
                    fontSize: "0.9375rem",
                    color: "#f0f0f8",
                    outline: "none",
                  }}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
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
                  onClick={() => setShowMemberModal(false)}
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
                  disabled={addMember.isPending}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: "#6d56fa",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    opacity: addMember.isPending ? 0.7 : 1,
                  }}
                >
                  {addMember.isPending ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmModal?.open ?? false}
        title={confirmModal?.type === "task" ? "Delete task" : "Remove member"}
        description={
          confirmModal?.type === "task"
            ? "This task will be permanently deleted."
            : "This member will be removed from the project."
        }
        confirmLabel={
          confirmModal?.type === "task" ? "Delete task" : "Remove member"
        }
        onConfirm={async () => {
          if (!confirmModal) return;
          try {
            if (confirmModal.type === "task") {
              await deleteTask.mutateAsync(confirmModal.id);
              toast.success("Task deleted");
              setSelectedTask(null);
            } else {
              await removeMember.mutateAsync(confirmModal.id);
              toast.success("Member removed");
            }
          } catch {
            toast.error("Failed");
          }
          setConfirmModal(null);
        }}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
