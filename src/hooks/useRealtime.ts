"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://pandas-store-api.onrender.com";

type EventCallback = (data: any) => void;

// ─── Global singleton per userId ─────────────────────────────────────────────
interface WsState {
  ws: WebSocket | null;
  listeners: Map<string, Set<EventCallback>>;
  refCount: number;
  pingTimer: any;
  reconnectTimer: any;
  reconnectDelay: number;
  intentionalClose: boolean;
  connected: boolean;
}

const connections = new Map<number, WsState>();

function getOrCreateState(userId: number): WsState {
  let state = connections.get(userId);
  if (!state) {
    state = {
      ws: null,
      listeners: new Map(),
      refCount: 0,
      pingTimer: null,
      reconnectTimer: null,
      reconnectDelay: 1000,
      intentionalClose: false,
      connected: false,
    };
    connections.set(userId, state);
  }
  return state;
}

function connectSocket(userId: number, state: WsState) {
  if (state.ws || state.intentionalClose) return;

  try {
    const ws = new WebSocket(`${WS_URL}/social/ws/${userId}`);
    state.ws = ws;

    ws.onopen = () => {
      state.connected = true;
      state.reconnectDelay = 1000;
      dispatch(state, "CONNECTION", { connected: true });
      
      state.pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "PING" }));
        }
      }, 25_000);
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "PONG") return;
        
        // Broadcast by type
        if (data.type) {
          dispatch(state, data.type, data);
        }
        
        // Special normalization for messages
        if (data.type === "MESSAGE" || (data.content && !data.type)) {
          dispatch(state, "NEW_MESSAGE", data);
        }
      } catch (e) {}
    };

    ws.onclose = () => {
      state.connected = false;
      state.ws = null;
      dispatch(state, "CONNECTION", { connected: false });
      
      if (state.pingTimer) { clearInterval(state.pingTimer); state.pingTimer = null; }
      
      if (!state.intentionalClose && connections.has(userId)) {
        state.reconnectDelay = Math.min(state.reconnectDelay * 2, 30_000);
        state.reconnectTimer = setTimeout(() => connectSocket(userId, state), state.reconnectDelay);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  } catch (e) {
    state.ws = null;
    state.reconnectDelay = Math.min(state.reconnectDelay * 2, 30_000);
    state.reconnectTimer = setTimeout(() => connectSocket(userId, state), state.reconnectDelay);
  }
}

function dispatch(state: WsState, type: string, data: any) {
  state.listeners.get(type)?.forEach((cb) => {
    try { cb(data); } catch (e) { console.error(`WS handler err [${type}]:`, e); }
  });
}

/**
 * useRealtime hook - Manages the connection lifecycle
 */
export function useRealtime(userId?: number) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const state = getOrCreateState(userId);
    state.refCount++;
    state.intentionalClose = false;
    
    setIsConnected(state.connected);

    if (!state.ws && !state.reconnectTimer) {
      connectSocket(userId, state);
    }

    const onConn = (data: any) => setIsConnected(data.connected);
    if (!state.listeners.has("CONNECTION")) state.listeners.set("CONNECTION", new Set());
    state.listeners.get("CONNECTION")!.add(onConn);

    return () => {
      state.listeners.get("CONNECTION")?.delete(onConn);
      state.refCount--;
      
      if (state.refCount <= 0) {
        state.intentionalClose = true;
        if (state.pingTimer) clearInterval(state.pingTimer);
        if (state.reconnectTimer) clearTimeout(state.reconnectTimer);
        if (state.ws) {
          state.ws.close();
          state.ws = null;
        }
        connections.delete(userId);
      }
    };
  }, [userId]);

  const sendEvent = useCallback((data: any) => {
    if (!userId) return false;
    const state = connections.get(userId);
    if (state?.ws?.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, [userId]);

  return { isConnected, sendEvent };
}

/**
 * useRealtimeEvent hook - Registers a listener for a specific event type
 */
export function useRealtimeEvent(userId: number | undefined, type: string, callback: EventCallback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!userId) return;

    const state = getOrCreateState(userId);
    const handler: EventCallback = (data) => cbRef.current(data);
    
    if (!state.listeners.has(type)) state.listeners.set(type, new Set());
    state.listeners.get(type)!.add(handler);

    return () => {
      state.listeners.get(type)?.delete(handler);
    };
  }, [userId, type]);
}
