import { type MouseEvent, useCallback } from "react";
import { useResolvedGuardedScope } from "../../context";
import { resolveActionReason, resolveGuardedLinkState } from "../../utils";
import { useTopBlocker } from "../useTopBlocker";
import type {
  UseGuardedLinkParams,
  UseGuardedLinkReturn,
} from "./useGuardedLink.types";

export function useGuardedLink<
  TElement extends HTMLElement = HTMLAnchorElement,
>(params: UseGuardedLinkParams<TElement> = {}): UseGuardedLinkReturn<TElement> {
  const {
    disabled,
    onClick,
    reasonFallback,
    reasonId,
    reasonMode = "hidden",
    removeFromTabOrder,
    scope,
    stopPropagationWhenBlocked,
  } = params;
  const resolvedScope = useResolvedGuardedScope(scope);
  const blocker = useTopBlocker(resolvedScope);

  const linkState = resolveGuardedLinkState({
    disabled,
    isBlocked: blocker.isBlocked,
    removeFromTabOrder,
  });

  const handleClick = useCallback(
    (e: MouseEvent<TElement>) => {
      if (linkState.onClickShouldPrevent) {
        e.preventDefault();

        if (stopPropagationWhenBlocked === true) {
          e.stopPropagation();
        }

        return;
      }

      onClick?.(e);
    },
    [linkState.onClickShouldPrevent, onClick, stopPropagationWhenBlocked],
  );

  const reason = resolveActionReason({
    blocker,
    fallback: reasonFallback,
    mode: reasonMode,
    reasonId,
  });

  return {
    blocker,
    isBlocked: blocker.isBlocked,
    linkState,
    onClick: handleClick,
    reasonContent: reason.reasonContent,
    ariaDescribedBy: reason.ariaDescribedBy,
  };
}
