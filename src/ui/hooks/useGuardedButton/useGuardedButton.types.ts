import type {
  GuardedActionBlockedState,
  GuardedActionState,
  GuardedReasonProps,
  GuardedScopeProps,
  UseTopBlockerReturn,
} from "../../types";

export interface UseGuardedButtonParams<TButtonState = GuardedActionState>
  extends GuardedScopeProps, GuardedReasonProps {
  blockedState?: GuardedActionBlockedState;
  disabled?: boolean;
  loading?: boolean;
  getButtonState?: (state: GuardedActionState) => TButtonState;
}

export interface UseGuardedButtonReturn<TButtonState = GuardedActionState> {
  blocker: UseTopBlockerReturn;
  isBlocked: boolean;
  buttonState: TButtonState;
  reasonContent: string | null;
  ariaDescribedBy?: string;
}
