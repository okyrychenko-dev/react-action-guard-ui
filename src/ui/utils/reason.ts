import type {
  GuardedFieldReasonMode,
  GuardedReasonMode,
  GuardedReasonResult,
  UseTopBlockerReturn,
} from "../types";

export function getGuardedReason(
  blocker: UseTopBlockerReturn,
  fallback?: string,
): string | null {
  return blocker.reason ?? fallback ?? null;
}

function resolveGuardedReason(params: {
  blocker: UseTopBlockerReturn;
  fallback?: string;
  mode: GuardedReasonMode | GuardedFieldReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  const reason = getGuardedReason(params.blocker, params.fallback);

  if (
    !params.blocker.isBlocked ||
    reason === null ||
    params.mode === "hidden"
  ) {
    return { ariaDescribedBy: undefined, reasonContent: null };
  }

  return {
    ariaDescribedBy:
      params.mode === "description" ? params.reasonId : undefined,
    reasonContent: reason,
  };
}

export function resolveActionReason(params: {
  blocker: UseTopBlockerReturn;
  fallback?: string;
  mode: GuardedReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  return resolveGuardedReason(params);
}

export function resolveFieldReason(params: {
  blocker: UseTopBlockerReturn;
  fallback?: string;
  mode: GuardedFieldReasonMode;
  reasonId?: string;
}): GuardedReasonResult {
  return resolveGuardedReason(params);
}
