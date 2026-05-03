import { useMemo } from "react";
import { useResolvedGuardedScope } from "../../context";
import { resolveActionReason, resolveGuardedActionState } from "../../utils";
import { useTopBlocker } from "../useTopBlocker";
import type { GuardedActionState } from "../../types";
import type {
  UseGuardedButtonParams,
  UseGuardedButtonReturn,
} from "./useGuardedButton.types";

interface UseMappedGuardedButtonParams<
  TButtonState,
> extends UseGuardedButtonParams<TButtonState> {
  getButtonState: (state: GuardedActionState) => TButtonState;
}

export function useGuardedButton(
  params?: UseGuardedButtonParams,
): UseGuardedButtonReturn;
export function useGuardedButton<TButtonState>(
  params: UseMappedGuardedButtonParams<TButtonState>,
): UseGuardedButtonReturn<TButtonState>;
export function useGuardedButton<TButtonState>(
  params: UseGuardedButtonParams<TButtonState> = {},
): UseGuardedButtonReturn | UseGuardedButtonReturn<TButtonState> {
  const {
    blockedState = "disabled",
    disabled,
    getButtonState,
    loading,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);

  const baseButtonState = useMemo(
    () =>
      resolveGuardedActionState({
        blockedState,
        disabled,
        isBlocked: blocker.isBlocked,
        loading,
      }),
    [blockedState, blocker.isBlocked, disabled, loading],
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

  if (getButtonState) {
    return {
      blocker,
      isBlocked: blocker.isBlocked,
      buttonState: getButtonState(baseButtonState),
      reasonContent: reason.reasonContent,
      ariaDescribedBy: reason.ariaDescribedBy,
    };
  }

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    buttonState: baseButtonState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
