import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as api from '@/api/players';
import { ApiError } from '@/api/client';
import type { Player, PlayerFormValues } from '@/types';

type Status = 'loading' | 'ready' | 'error';

type PlayersContextValue = {
  players: Player[];
  status: Status;
  error: string | null;
  refreshing: boolean;
  refresh: (options?: { silent?: boolean }) => Promise<void>;
  create: (values: PlayerFormValues) => Promise<Player>;
  update: (id: number, values: PlayerFormValues) => Promise<Player>;
  remove: (id: number) => Promise<void>;
  getCached: (id: number) => Player | undefined;
};

const PlayersContext = createContext<PlayersContextValue | null>(null);

/** Keeps the list in the same order the API uses, so local edits do not jump around. */
function sortByName(players: Player[]) {
  return [...players].sort((a, b) => a.full_name.localeCompare(b.full_name));
}

export function PlayersProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Guards against a slow first load resolving after a newer one.
  const inFlight = useRef<AbortController | null>(null);

  const refresh = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    if (silent) setRefreshing(true);
    else setStatus((current) => (current === 'ready' ? current : 'loading'));

    try {
      const data = await api.listPlayers(undefined, controller.signal);
      if (controller.signal.aborted) return;
      setPlayers(sortByName(data));
      setError(null);
      setStatus('ready');
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof ApiError ? err.message : 'Something went wrong while loading players.');
      setStatus('error');
    } finally {
      if (!controller.signal.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    return () => inFlight.current?.abort();
  }, [refresh]);

  // Each mutation trusts the record the API echoes back, so the list always
  // reflects what was actually stored rather than what we hoped was stored.
  const create = useCallback(async (values: PlayerFormValues) => {
    const created = await api.createPlayer(values);
    setPlayers((current) => sortByName([...current, created]));
    setStatus('ready');
    setError(null);
    return created;
  }, []);

  const update = useCallback(async (id: number, values: PlayerFormValues) => {
    const updated = await api.updatePlayer(id, values);
    setPlayers((current) => sortByName(current.map((p) => (p.id === id ? updated : p))));
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    await api.deletePlayer(id);
    setPlayers((current) => current.filter((p) => p.id !== id));
  }, []);

  const getCached = useCallback((id: number) => players.find((p) => p.id === id), [players]);

  const value = useMemo(
    () => ({ players, status, error, refreshing, refresh, create, update, remove, getCached }),
    [players, status, error, refreshing, refresh, create, update, remove, getCached],
  );

  return <PlayersContext.Provider value={value}>{children}</PlayersContext.Provider>;
}

export function usePlayers() {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error('usePlayers must be used inside <PlayersProvider>.');
  }
  return context;
}
