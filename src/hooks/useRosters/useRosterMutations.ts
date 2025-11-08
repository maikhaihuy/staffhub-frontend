import { useMutation } from "@tanstack/react-query";
import { create, remove, update } from "@/features/roster/api";
import { Roster } from "@/features/roster/types";
import { useQueryClient } from "@tanstack/react-query";

export const useCreateRoster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roster: Roster) => create(roster),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["rosters"] })
    }
  })
}

export const useUpdateRoster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roster: Roster) => update(roster.id, roster),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["rosters"] })
    }
  })
}

export const useDeleteRoster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => remove(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["rosters"] })
    }
  })
}
