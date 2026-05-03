import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  AddMemberInput,
} from "@repo/shared";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/api/projects");
      return res.data;
    },
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const res = await api.get(`/api/projects/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProjectInput) => {
      const res = await api.post("/api/projects", data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProjectInput) => {
      const res = await api.put(`/api/projects/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", id] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/projects/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useAddMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: AddMemberInput) => {
      const res = await api.post(`/api/projects/${projectId}/members`, data);
      return res.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
}

export function useRemoveMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/api/projects/${projectId}/members/${memberId}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["projects", projectId] }),
  });
}
