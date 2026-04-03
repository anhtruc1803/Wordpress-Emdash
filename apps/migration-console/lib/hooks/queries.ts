"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  fetchDashboard,
  fetchProjects,
  fetchWorkspace,
  runImport,
  runAudit,
  runDryRun,
  testTarget,
  testSource,
  updateManualFix,
  updateProjectSettings
} from "@/lib/api/client";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboard
  });
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects
  });
}

export function useWorkspaceQuery(projectId: string) {
  return useQuery({
    queryKey: ["workspace", projectId],
    queryFn: () => fetchWorkspace(projectId)
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }
  });
}

export function useRunAuditMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runAudit(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useRunDryRunMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runDryRun(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useRunImportMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runImport(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useTestSourceMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => testSource(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] })
      ]);
    }
  });
}

export function useTestTargetMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => testTarget(projectId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] })
      ]);
    }
  });
}

export function useUpdateManualFixMutation(projectId: string, fixId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateManualFix>[2]) => updateManualFix(projectId, fixId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });
}

export function useUpdateProjectMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateProjectSettings>[1]) =>
      updateProjectSettings(projectId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workspace", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] })
      ]);
    }
  });
}
