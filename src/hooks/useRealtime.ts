"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://pandas-store-api.onrender.com";

type EventCallback = (data: any) => void;

// ─── Global singleton per userId ─────────────────────────────────────────────
// Keeps ONE WebSocket open even if multiple components call useRealtime().
interface WsState {
  ws: WebSocket;
  listeners: Map<string, Set<EventCallback>>;
  refCount: number;
  pingTimer: ReturnType<typeof setInterval> | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  reconnectDelay: number; // ms — exponential backoff
  intentionalClose: boolean;
}

const connections = new Map<number, WsState>();

function getOrCreate(userId: number): WsState {
  if (connections.has(userId)) {
    const state = connections.get(userId)!;
    state.refCount++;
    return state;
  }
  const state: WsState = {
    ws: null as any,
    listeners: new Map(),
    refCount: 1,
    pingTimer: null,
    reconnectTimer: null,
    reconnectDelay: 1000,
    intentionalClose: false,
  };
  connections.set(userId, state);
  connectSocket(userId, state);
  return state;
}

function connectSocket(userId: number, state: WsState) {
  try {
    const ws = new WebSocket(`${WS_URL}/social/ws/${userId}`);
    state.ws = ws;

    ws.onopen = () => {
      state.reconnectDelay = 1000; // reset backoff on success

      // Dispatch to a special "CONNECTION" type so hooks can track status
      dispatch(state, "CONNECTION", { connected: true });

      // Heartbeat — send PING every 25s to keep the server from timing us out
      state.pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "PING" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "PONG") return; // ignore heartbeat responses

        // Normalise: the backend sends "MESSAGE" from WS but some handlers listen for "NEW_MESSAGE"
        if (data.type === "MESSAGE") {
          dispatch(state, "MESSAGE", data);
          dispatch(state, "NEW_MESSAGE", data); // fire both so legacy handlers work
        } else if (data.type) {
          dispatch(state, data.type, data);
        }
      } catch {
        // ignore unparseable frames
      }
    };

    ws.onclose = () => {
      dispatch(state, "CONNECTION", { connected: false });
      if (state.pingTimer) { clearInterval(state.pingTimer); state.pingTimer = null; }

      if (!state.intentionalClose && connections.has(userId)) {
        // Exponential backoff: 1s → 2s → 4s → … → 30s max
        state.reconnectDelay = Math.min(state.reconnectDelay * 2, 30_000);
        state.reconnectTimer = setTimeout(() => connectSocket(userId, state), state.reconnectDelay);
      }
    };

    ws.onerror = () => {
      // onclose fires after onerror so reconnect is handled there
    };
  } catch {
    state.reconnectDelay = Math.min(state.reconnectDelay * 2, 30_000);
    state.reconnectTimer = setTimeout(() => connectSocket(userId, state), state.reconnectDelay);
  }
}

function dispatch(state: WsState, type: string, data: any) {
  state.listeners.get(type)?.forEach((cb) => {
    try { cb(data); } catch (e) { console.error("WS event handler error:", e); }
  });
}

function releaseSocket(userId: number) {
  const state = connections.get(userId);
  if (!state) return;
  state.refCount--;
  if (state.refCount <= 0) {
    state.intentionalClose = true;
    if (state.pingTimer) clearInterval(state.pingTimer);
    if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
    state.ws?.close();
    connections.delete(userId);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRealtime(userId?: number) {
  const [isConnected, setIsConnected] = useState(false);
  // Bumped each time a userId successfully connects so useEvent effects re-fire
  const [connectedVersion, setConnectedVersion] = useState(0);
  const stateRef = useRef<WsState | null>(null);

  useEffect(() => {
    if (!userId) return;
    const state = getOrCreate(userId);
    stateRef.current = state;

    // Track current connection state
    setIsConnected(state.ws?.readyState === WebSocket.OPEN);
    // Bump version so that useEvent effects re-register their listeners
    setConnectedVersion((v) => v + 1);

    const onConnection = (data: { connected: boolean }) => setIsConnected(data.connected);
    if (!state.listeners.has("CONNECTION")) state.listeners.set("CONNECTION", new Set());
    state.listeners.get("CONNECTION")!.add(onConnection);

    return () => {
      state.listeners.get("CONNECTION")?.delete(onConnection);
      releaseSocket(userId);
      stateRef.current = null;
    };
  }, [userId]);

  /**
   * useEvent — subscribe to a WebSocket event type.
   * Must be called at the top level of a component (React hook rules).
   *
   * `connectedVersion` is included in the dep array so this effect re-runs
   * after userId loads and stateRef.current is populated.
   */
  const useEvent = useCallback((type: string, callback: EventCallback) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const state = stateRef.current;
      if (!state) return;

      const stableCb: EventCallback = (data) => callbackRef.current(data);
      if (!state.listeners.has(type)) state.listeners.set(type, new Set());
      state.listeners.get(type)!.add(stableCb);

      return () => {
        state.listeners.get(type)?.delete(stableCb);
        if (state.listeners.get(type)?.size === 0) state.listeners.delete(type);
      };
    // connectedVersion triggers re-registration after userId resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, connectedVersion]);
  // connectedVersion must be in the outer closure for the dep array above
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedVersion]);

  /**
   * sendEvent — send a message through the shared WebSocket.
   */
  const sendEvent = useCallback((data: any): boolean => {
    const state = stateRef.current;
    if (state?.ws?.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { isConnected, useEvent, sendEvent };
}

