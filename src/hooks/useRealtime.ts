"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://pandas-store-api.onrender.com";

type EventCallback = (data: any) => void;

export function useRealtime(userId?: number) {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<EventCallback>>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let reconnectTimer: ReturnType<typeof setTimeout>;
    let intentionalClose = false;

    const connect = () => {
      try {
        const url = `${WS_URL}/social/ws/${userId}`;
        const ws = new WebSocket(url);
        socketRef.current = ws;

        ws.onopen = () => {
          console.log("Connected to Realtime Server");
          setIsConnected(true);
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            const type = data.type;
            if (type && listenersRef.current.has(type)) {
              listenersRef.current.get(type)!.forEach((cb) => {
                try { cb(data); } catch (e) { console.error("Event handler error:", e); }
              });
            }
          } catch (e) {
            console.error("Failed to parse WS message", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (!intentionalClose) {
            console.log("Disconnected from Realtime Server. Reconnecting...");
            reconnectTimer = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (err) => {
          console.error("WebSocket Error:", err);
        };
      } catch (err) {
        console.error("WebSocket connection failed:", err);
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      intentionalClose = true;
      clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [userId]);

  /**
   * useEvent — a proper React hook for subscribing to WebSocket events.
   * Must be called at the top level of a component (not inside callbacks).
   */
  const useEvent = useCallback((type: string, callback: EventCallback) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
      const stableCallback: EventCallback = (data) => callbackRef.current(data);

      if (!listenersRef.current.has(type)) {
        listenersRef.current.set(type, new Set());
      }
      listenersRef.current.get(type)!.add(stableCallback);

      return () => {
        listenersRef.current.get(type)?.delete(stableCallback);
        if (listenersRef.current.get(type)?.size === 0) {
          listenersRef.current.delete(type);
        }
      };
    }, [type]);
  }, []);

  /**
   * sendEvent — Allows sending a message through the shared WebSocket connection
   */
  const sendEvent = useCallback((data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
      return true;
    }
    return false;
  }, []);

  return { isConnected, useEvent, sendEvent };
}
