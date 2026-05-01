import {
  type BlockerInfo,
  type StoredBlocker,
  useResolvedStoreApi,
} from "@okyrychenko-dev/react-action-guard";
import { useStore } from "zustand";
import { DEFAULT_GUARDED_SCOPE } from "../../constants";
import { normalizeGuardedScope } from "../../utils";
import type { GuardedScope, UseTopBlockerReturn } from "../../types";

interface BlockerScopeSnapshot {
  scope?: StoredBlocker["scope"];
}

function blockerAffectsScope(
  blocker: BlockerScopeSnapshot,
  checkedScopes: ReadonlyArray<string>,
): boolean {
  if (blocker.scope === undefined || blocker.scope === DEFAULT_GUARDED_SCOPE) {
    return true;
  }

  const blockerScopes = normalizeGuardedScope(blocker.scope);
  return checkedScopes.some((scope) => blockerScopes.includes(scope));
}

function toBlockerInfo(id: string, blocker: StoredBlocker): BlockerInfo {
  const { timeoutId: _timeoutId, ...publicBlocker } = blocker;
  return { id, ...publicBlocker };
}

export function useTopBlocker(scope?: GuardedScope): UseTopBlockerReturn {
  const store = useResolvedStoreApi();
  const activeBlockers = useStore(store, (state) => state.activeBlockers);
  const checkedScopes = normalizeGuardedScope(scope);
  const blockers: Array<BlockerInfo> = [];

  for (const [id, blocker] of activeBlockers) {
    if (blockerAffectsScope(blocker, checkedScopes)) {
      blockers.push(toBlockerInfo(id, blocker));
    }
  }

  blockers.sort((first, second) => second.priority - first.priority);

  const topBlocker = blockers.length === 0 ? null : blockers[0];

  return {
    status: topBlocker === null ? "idle" : "blocked",
    isBlocked: topBlocker !== null,
    blockers,
    topBlocker,
    reason: topBlocker === null ? null : topBlocker.reason,
  };
}
