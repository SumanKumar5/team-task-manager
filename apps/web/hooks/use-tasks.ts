import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreateTaskInput, UpdateTaskInput } from "@repo/shared";

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${projectId}/tasks`);
      return res.data;
    },
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskInput) => {
      const res = await api.post(`/api/projects/${projectId}/tasks`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskInput }) => {
      const res = await api.put(`/api/tasks/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/tasks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
