import { useCallback } from "react";
import { resolveActionReason, resolveGuardedActionState } from "../../utils";
import { useGuardedControl } from "../useGuardedControl";
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
): UseGuardedButtonReturn<GuardedActionState | TButtonState> {
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

  const resolveState = useCallback(
    (isBlocked: boolean) =>
      resolveGuardedActionState({
        blockedState,
        disabled,
        isBlocked,
        loading,
      }),
    [blockedState, disabled, loading],
  );

  const control = useGuardedControl({
    getControlState: getButtonState,
    reasonFallback,
    reasonId,
    reasonMode,
    resolveReason: resolveActionReason,
    resolveState,
    scope,
  });

  return {
    blocker: control.blocker,
    isBlocked: control.isBlocked,
    buttonState: control.controlState,
    reasonContent: control.reasonContent,
    ariaDescribedBy: control.ariaDescribedBy,
  };
}
