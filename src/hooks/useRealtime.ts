"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://pandas-store-api.onrender.com";

export function useRealtime(userId?: number) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      const url = `${WS_URL}/social/ws/${userId}`;
      const ws = new WebSocket(url);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Realtime Server");
        setIsConnected(true);
      };

      ws.onclose = () => {
        console.log("Disconnected from Realtime Server. Reconnecting...");
        setIsConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket Error:", err);
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, [userId]);

  const onEvent = (type: string, callback: (data: any) => void) => {
    useEffect(() => {
      const ws = socketRef.current;
      if (!ws) return;

      const handler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === type) {
            callback(data);
          }
        } catch (e) {
          console.error("Failed to parse WS message", e);
        }
      };

      ws.addEventListener("message", handler);
      return () => ws.removeEventListener("message", handler);
    }, [callback, type]);
  };

  return { isConnected, onEvent };
}
