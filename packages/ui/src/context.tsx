import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Claim } from "@pcn-js/core";
import { ClaimsManager } from "@pcn-js/core";

type ClaimsContextValue = {
  claims: Record<string, Claim>;
  manager: ClaimsManager | null;
};

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export type ClaimsProviderProps = {
  /** Optional ClaimsManager. When provided, provider syncs state from manager and subscribes to onChange. */
  manager?: ClaimsManager;
  /** Initial claims map (used when manager is not provided, or as initial state before manager syncs). */
  initialClaims?: Record<string, Claim>;
  children: ReactNode;
};

/**
 * Provides claims to the tree. Use either a `ClaimsManager` (so that
 * `manager.ingest(toolName, result)` updates the map and re-renders) or
 * a static `initialClaims` map.
 */
export function ClaimsProvider({
  manager,
  initialClaims = {},
  children,
}: ClaimsProviderProps) {
  const [claims, setClaims] = useState<Record<string, Claim>>(() =>
    manager ? manager.getAll() : initialClaims
  );

  useEffect(() => {
    if (!manager) return;
    const sync = () => setClaims(manager.getAll());
    sync();
    manager.onChange = sync;
    return () => {
      manager.onChange = undefined;
    };
  }, [manager]);

  const value = useMemo<ClaimsContextValue>(
    () => ({ claims, manager: manager ?? null }),
    [claims, manager]
  );

  return (
    <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>
  );
}

/**
 * Returns the current claims map and optional ClaimsManager from context.
 * Throws if used outside ClaimsProvider.
 */
export function useClaims(): Record<string, Claim> {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx.claims;
}

/**
 * Returns the ClaimsManager from context, if one was passed to ClaimsProvider.
 * Use this to call manager.ingest(toolName, result) when tool results arrive.
 */
export function useClaimsManager(): ClaimsManager | null {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaimsManager must be used within ClaimsProvider");
  return ctx.manager;
}

/**
 * Returns a single claim by id, or undefined.
 */
export function useClaim(id: string): Claim | undefined {
  const claims = useClaims();
  return claims[id];
}
