import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { QUERY_KEYS } from "@/constants";
import type { CurrentUser } from "./useCurrentUser";

const updateExcludeTodoCompletion = async (
  excludeTodoCompletion: boolean
): Promise<void> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("사용자 정보를 가져올 수 없습니다.");
  }

  const currentMetadata = user.user_metadata || {};
  const newMetadata = {
    ...currentMetadata,
    exclude_todo_completion: excludeTodoCompletion,
  };

  const { error: updateError } = await supabase.auth.updateUser({
    data: newMetadata,
  });

  if (updateError) {
    throw new Error(updateError.message);
  }
};

export const useTodoCompletionSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExcludeTodoCompletion,
    onMutate: async (newValue: boolean) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });
      const previous = queryClient.getQueryData<CurrentUser>([
        QUERY_KEYS.CURRENT_USER,
      ]);
      queryClient.setQueryData<CurrentUser>(
        [QUERY_KEYS.CURRENT_USER],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            user_metadata: {
              ...(old.user_metadata || {}),
              exclude_todo_completion: newValue,
            },
          };
        }
      );
      queryClient.setQueryData<CurrentUser>(["currentUser"], (old) => {
        if (!old) return old;
        return {
          ...old,
          user_metadata: {
            ...(old.user_metadata || {}),
            exclude_todo_completion: newValue,
          },
        };
      });
      return { previous };
    },
    onError: (_err, _newValue, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          [QUERY_KEYS.CURRENT_USER],
          context.previous
        );
        queryClient.setQueryData(["currentUser"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.DAILY_VIVID] });
    },
  });
};

export function getExcludeTodoCompletion(
  userMetadata?: Record<string, unknown> | null
): boolean {
  if (!userMetadata) return false;
  return userMetadata.exclude_todo_completion === true;
}
