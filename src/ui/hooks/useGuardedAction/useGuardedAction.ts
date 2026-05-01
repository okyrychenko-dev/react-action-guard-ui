import { useResolvedGuardedScope } from "../../context";
import { resolveActionReason, resolveGuardedActionState } from "../../utils";
import { useTopBlocker } from "../useTopBlocker";
import type { GuardedActionState } from "../../types";
import type {
  UseGuardedActionParams,
  UseGuardedActionReturn,
} from "./useGuardedAction.types";

interface UseMappedGuardedActionParams<
  TActionState,
> extends UseGuardedActionParams<TActionState> {
  getActionState: (state: GuardedActionState) => TActionState;
}

export function useGuardedAction(
  params?: UseGuardedActionParams,
): UseGuardedActionReturn;
export function useGuardedAction<TActionState>(
  params: UseMappedGuardedActionParams<TActionState>,
): UseGuardedActionReturn<TActionState>;
export function useGuardedAction<TActionState>(
  params: UseGuardedActionParams<TActionState> = {},
): UseGuardedActionReturn | UseGuardedActionReturn<TActionState> {
  const {
    blockedState = "disabled",
    disabled,
    getActionState,
    loading,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);

  const baseActionState = resolveGuardedActionState({
    blockedState,
    disabled,
    isBlocked: blocker.isBlocked,
    loading,
  });

  const reason = resolveActionReason({
    blocker,
    fallback: reasonFallback,
    mode: reasonMode,
    reasonId,
  });

  if (getActionState) {
    return {
      blocker,
      isBlocked: blocker.isBlocked,
      actionState: getActionState(baseActionState),
      reasonContent: reason.reasonContent,
      ariaDescribedBy: reason.ariaDescribedBy,
    };
  }

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    actionState: baseActionState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
