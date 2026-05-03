import { DEFAULT_GUARDED_SCOPE } from "../constants";
import { assertNever } from "./assert";
import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedFieldBlockedState,
  GuardedFieldState,
  GuardedGroupState,
  GuardedLinkState,
  GuardedScope,
} from "../types";

function mergeWithBlockedFlag(
  value: boolean | undefined,
  isBlocked: boolean,
): boolean {
  return (value ?? false) || isBlocked;
}

export function normalizeGuardedScope(
  scope?: GuardedScope,
): ReadonlyArray<string> {
  if (scope === undefined) {
    return [DEFAULT_GUARDED_SCOPE];
  }

  if (typeof scope === "string") {
    return [scope];
  }

  return scope;
}

export function resolveGuardedActionState(params: {
  blockedState: GuardedActionBlockedState;
  isBlocked: boolean;
  disabled?: boolean;
  loading?: boolean;
}): GuardedActionState {
  const { blockedState, disabled, isBlocked, loading } = params;

  switch (blockedState) {
    case "disabled": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);
      return {
        disabled: resolvedDisabled,
        loading: loading === true,
        ariaBusy: undefined,
        ariaDisabled: resolvedDisabled ? true : undefined,
      };
    }
    case "loading": {
      const resolvedLoading = mergeWithBlockedFlag(loading, isBlocked);
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);
      return {
        disabled: resolvedDisabled,
        loading: resolvedLoading,
        ariaBusy: resolvedLoading ? true : undefined,
        ariaDisabled: resolvedDisabled ? true : undefined,
      };
    }
    case "none":
      return {
        disabled: disabled === true,
        loading: loading === true,
        ariaBusy: loading === true ? true : undefined,
        ariaDisabled: disabled === true ? true : undefined,
      };
    default:
      return assertNever(blockedState, "GuardedActionBlockedState");
  }
}

export function resolveGuardedFieldState(params: {
  blockedState: GuardedFieldBlockedState;
  isBlocked: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
}): GuardedFieldState {
  const { blockedState, disabled, isBlocked, loading, readOnly } = params;

  switch (blockedState) {
    case "disabled": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);
      return {
        disabled: resolvedDisabled,
        readOnly: readOnly === true,
        loading: loading === true,
        ariaBusy: loading === true ? true : undefined,
        ariaDisabled: resolvedDisabled ? true : undefined,
        ariaReadOnly: readOnly === true ? true : undefined,
      };
    }
    case "readOnly": {
      const resolvedReadOnly = mergeWithBlockedFlag(readOnly, isBlocked);
      return {
        disabled: disabled === true,
        readOnly: resolvedReadOnly,
        loading: loading === true,
        ariaBusy: loading === true ? true : undefined,
        ariaDisabled: disabled === true ? true : undefined,
        ariaReadOnly: resolvedReadOnly ? true : undefined,
      };
    }
    case "loading": {
      const resolvedDisabled = mergeWithBlockedFlag(disabled, isBlocked);
      const resolvedLoading = mergeWithBlockedFlag(loading, isBlocked);
      return {
        disabled: resolvedDisabled,
        readOnly: readOnly === true,
        loading: resolvedLoading,
        ariaBusy: resolvedLoading ? true : undefined,
        ariaDisabled: resolvedDisabled ? true : undefined,
        ariaReadOnly: readOnly === true ? true : undefined,
      };
    }
    case "none":
      return {
        disabled: disabled === true,
        readOnly: readOnly === true,
        loading: loading === true,
        ariaBusy: loading === true ? true : undefined,
        ariaDisabled: disabled === true ? true : undefined,
        ariaReadOnly: readOnly === true ? true : undefined,
      };
    default:
      return assertNever(blockedState, "GuardedFieldBlockedState");
  }
}

export function resolveGuardedLinkState(params: {
  isBlocked: boolean;
  disabled?: boolean;
  removeFromTabOrder?: boolean;
}): GuardedLinkState {
  const isDisabled = params.disabled === true || params.isBlocked;

  return {
    ariaDisabled: isDisabled ? true : undefined,
    tabIndex: isDisabled && params.removeFromTabOrder === true ? -1 : undefined,
    onClickShouldPrevent: isDisabled,
  };
}

export function resolveGuardedGroupState(
  isBlocked: boolean,
): GuardedGroupState {
  return {
    ariaBusy: isBlocked ? true : undefined,
    ariaDisabled: isBlocked ? true : undefined,
  };
}
