import { useMemo } from "react";
import { useResolvedGuardedScope } from "../../context";
import { useTopBlocker } from "../useTopBlocker";
import type { GuardedFieldReasonMode, GuardedReasonMode } from "../../types";
import type {
  UseGuardedControlParams,
  UseGuardedControlReturn,
  UseMappedGuardedControlParams,
  UseUnmappedGuardedControlParams,
} from "./useGuardedControl.types";

export function useGuardedControl<
  TBaseState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode =
    GuardedReasonMode,
>(
  params: UseUnmappedGuardedControlParams<TBaseState, TReasonMode>,
): UseGuardedControlReturn<TBaseState>;
export function useGuardedControl<
  TBaseState,
  TControlState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode =
    GuardedReasonMode,
>(
  params: UseMappedGuardedControlParams<TBaseState, TControlState, TReasonMode>,
): UseGuardedControlReturn<TControlState>;
export function useGuardedControl<
  TBaseState,
  TControlState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode =
    GuardedReasonMode,
>(
  params: UseGuardedControlParams<TBaseState, TControlState, TReasonMode>,
): UseGuardedControlReturn<TBaseState | TControlState>;
export function useGuardedControl<
  TBaseState,
  TControlState = TBaseState,
  TReasonMode extends GuardedReasonMode | GuardedFieldReasonMode =
    GuardedReasonMode,
>(
  params: UseGuardedControlParams<TBaseState, TControlState, TReasonMode>,
): UseGuardedControlReturn<TBaseState | TControlState> {
  const {
    getControlState,
    reasonFallback,
    reasonId,
    reasonMode,
    resolveReason,
    resolveState,
    scope,
  } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);

  const baseState = useMemo(
    () => resolveState(blocker.isBlocked),
    [blocker.isBlocked, resolveState],
  );

  const controlState = useMemo(
    () => (getControlState ? getControlState(baseState) : baseState),
    [baseState, getControlState],
  );

  const reason = useMemo(
    () =>
      resolveReason({
        blocker,
        fallback: reasonFallback,
        mode: reasonMode,
        reasonId,
      }),
    [blocker, reasonFallback, reasonId, reasonMode, resolveReason],
  );

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    controlState,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
