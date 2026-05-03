import { useMemo } from "react";
import { useResolvedGuardedScope } from "../../context";
import { resolveActionReason, resolveGuardedGroupState } from "../../utils";
import { useTopBlocker } from "../useTopBlocker";
import type {
  UseGuardedGroupParams,
  UseGuardedGroupReturn,
} from "./useGuardedGroup.types";

export function useGuardedGroup(
  params: UseGuardedGroupParams = {},
): UseGuardedGroupReturn {
  const { reasonFallback, reasonId, reasonMode = "hidden", scope } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);
  const groupState = useMemo(
    () => resolveGuardedGroupState(blocker.isBlocked),
    [blocker.isBlocked],
  );

  const reason = useMemo(
    () =>
      resolveActionReason({
        blocker,
        fallback: reasonFallback,
        mode: reasonMode,
        reasonId,
      }),
    [blocker, reasonFallback, reasonId, reasonMode],
  );

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    groupState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
