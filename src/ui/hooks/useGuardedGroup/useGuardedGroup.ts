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
  const groupState = resolveGuardedGroupState(blocker.isBlocked);

  const reason = resolveActionReason({
    blocker,
    fallback: reasonFallback,
    mode: reasonMode,
    reasonId,
  });

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    groupState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
