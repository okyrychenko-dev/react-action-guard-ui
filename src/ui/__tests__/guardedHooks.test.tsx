import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GuardedScopeProvider } from "../context";
import {
  useGuardedAction,
  useGuardedButton,
  useGuardedField,
  useGuardedGroup,
  useGuardedLink,
  useTopBlocker,
} from "../hooks";
import type { ReactNode } from "react";

describe("guarded ui hooks", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should expose the top blocker for a scope", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("low", {
        scope: "checkout",
        reason: "Low priority",
        priority: 1,
      });
      uiBlockingStoreApi.getState().addBlocker("high", {
        scope: "checkout",
        reason: "High priority",
        priority: 10,
      });
    });

    const { result } = renderHook(() => useTopBlocker("checkout"));

    expect(result.current.status).toBe("blocked");
    expect(result.current.topBlocker?.id).toBe("high");
    expect(result.current.reason).toBe("High priority");
  });

  it("should apply a global blocker to a scoped query", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("global-save", {
        reason: "Global save",
      });
    });

    const { result } = renderHook(() => useTopBlocker("checkout"));

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.topBlocker?.id).toBe("global-save");
  });

  it("should let guarded fields inherit scope from provider", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
        reason: "Saving profile",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () =>
        useGuardedField({
          blockedState: "readOnly",
          reasonMode: "helperText",
        }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.fieldState.readOnly).toBe(true);
    expect(result.current.reasonContent).toBe("Saving profile");
  });

  it("should let guarded actions inherit scope from provider", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("submit", {
        scope: "profile",
        reason: "Submitting profile",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () => useGuardedAction({ blockedState: "loading" }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.actionState.disabled).toBe(true);
    expect(result.current.actionState.loading).toBe(true);
  });

  it("should let explicit scope override provider scope", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "billing",
      });
    });

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => (
      <GuardedScopeProvider scope="profile">{children}</GuardedScopeProvider>
    );

    const { result } = renderHook(
      () => useGuardedButton({ scope: "billing" }),
      { wrapper },
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.buttonState.disabled).toBe(true);
  });

  it("should expose guarded group state", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("group-save", {
        scope: "settings",
        reason: "Saving settings",
      });
    });

    const { result } = renderHook(() =>
      useGuardedGroup({
        scope: "settings",
        reasonMode: "description",
        reasonId: "settings-blocked-reason",
      }),
    );

    expect(result.current.isBlocked).toBe(true);
    expect(result.current.groupState.ariaBusy).toBe(true);
    expect(result.current.groupState.ariaDisabled).toBe(true);
    expect(result.current.ariaDescribedBy).toBe("settings-blocked-reason");
    expect(result.current.reasonContent).toBe("Saving settings");
  });

  it("should expose visible guarded button reason without aria description", () => {
    act(() => {
      uiBlockingStoreApi.getState().addBlocker("save", {
        scope: "profile",
        reason: "Saving profile",
      });
    });

    const { result } = renderHook(() =>
      useGuardedButton({
        scope: "profile",
        reasonMode: "visible",
        reasonId: "profile-blocked-reason",
      }),
    );

    expect(result.current.reasonContent).toBe("Saving profile");
    expect(result.current.ariaDescribedBy).toBeUndefined();
  });

  it("should prevent guarded link clicks while blocked", () => {
    const handleClick = vi.fn();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("navigation", {
        scope: "navigation",
      });
    });

    function GuardedLinkExample(): ReactNode {
      const { linkState, onClick } = useGuardedLink({
        scope: "navigation",
        onClick: handleClick,
      });

      return (
        <a
          href="/next"
          aria-disabled={linkState.ariaDisabled}
          onClick={onClick}
        >
          Next
        </a>
      );
    }

    render(<GuardedLinkExample />);

    expect(fireEvent.click(screen.getByRole("link", { name: "Next" }))).toBe(
      false,
    );
    expect(handleClick).not.toHaveBeenCalled();
  });
});
