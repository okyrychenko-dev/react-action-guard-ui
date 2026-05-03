import { useMemo } from "react";
import { useResolvedGuardedScope } from "../../context";
import { resolveFieldReason, resolveGuardedFieldState } from "../../utils";
import { useTopBlocker } from "../useTopBlocker";
import type { GuardedFieldState } from "../../types";
import type {
  UseGuardedFieldParams,
  UseGuardedFieldReturn,
} from "./useGuardedField.types";

interface UseMappedGuardedFieldParams<
  TFieldState,
> extends UseGuardedFieldParams<TFieldState> {
  getFieldState: (state: GuardedFieldState) => TFieldState;
}

export function useGuardedField(
  params?: UseGuardedFieldParams,
): UseGuardedFieldReturn;
export function useGuardedField<TFieldState>(
  params: UseMappedGuardedFieldParams<TFieldState>,
): UseGuardedFieldReturn<TFieldState>;
export function useGuardedField<TFieldState>(
  params: UseGuardedFieldParams<TFieldState> = {},
): UseGuardedFieldReturn | UseGuardedFieldReturn<TFieldState> {
  const {
    blockedState = "disabled",
    disabled,
    getFieldState,
    loading,
    readOnly,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    scope,
  } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);

  const baseFieldState = useMemo(
    () =>
      resolveGuardedFieldState({
        blockedState,
        disabled,
        isBlocked: blocker.isBlocked,
        loading,
        readOnly,
      }),
    [blockedState, blocker.isBlocked, disabled, loading, readOnly],
  );

  const reason = useMemo(
    () =>
      resolveFieldReason({
        blocker,
        fallback: reasonFallback,
        mode: reasonMode,
        reasonId,
      }),
    [blocker, reasonFallback, reasonId, reasonMode],
  );

  if (getFieldState) {
    return {
      blocker,
      isBlocked: blocker.isBlocked,
      fieldState: getFieldState(baseFieldState),
      reasonContent: reason.reasonContent,
      ariaDescribedBy: reason.ariaDescribedBy,
    };
  }

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    fieldState: baseFieldState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
