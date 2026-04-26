"use client";

import { useEffect, useState } from "react";
import { useRealtime, useRealtimeEvent } from "@/hooks/useRealtime";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function GlobalRealtimeListener() {
  const [userId,   setUserId]   = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user ID to connect to the correct WS channel
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUserId(res.data.id);
        setUsername(res.data.username);
      } catch (err) {
        // Not logged in or error
      }
    };
    
    fetchUser();
    
    // Also listen for auth-synced event to re-fetch if needed
    window.addEventListener("auth-synced", fetchUser);
    return () => window.removeEventListener("auth-synced", fetchUser);
  }, []);

  useRealtime(userId || undefined);

  // Listen for global NOTIFICATION events
  useRealtimeEvent(userId || undefined, "NOTIFICATION", (data) => {
    console.log("Global Notification Received:", data);
    toast(data.title || "Notification", {
      description: data.message,
      action: {
        label: "View",
        onClick: () => {
          if (data.title === "New Message") {
             router.push("/messages");
          } else {
             router.push("/profile/notifications");
          }
        },
      },
    });
  });

  // Show toast for incoming messages — never for the sender's own messages
  useRealtimeEvent(userId || undefined, "NEW_MESSAGE", (data) => {
    // Skip if this message was sent by the current user
    if (data.sender_username === username) return;

    // Skip if already viewing that conversation
    const path = window.location.pathname;
    if (path.includes(`/messages/${data.sender_username}`)) return;

    toast(`Message from @${data.sender_username}`, {
      description: data.content || "📎 Attachment",
      action: {
        label: "Reply",
        onClick: () => router.push(`/messages/${data.sender_username}`),
      },
    });
  });

  return null; // This component doesn't render anything
}
