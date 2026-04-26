"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/hooks/useRealtime";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export function GlobalRealtimeListener() {
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch current user ID to connect to the correct WS channel
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setUserId(res.data.id);
      } catch (err) {
        // Not logged in or error
      }
    };
    
    fetchUser();
    
    // Also listen for auth-synced event to re-fetch if needed
    window.addEventListener("auth-synced", fetchUser);
    return () => window.removeEventListener("auth-synced", fetchUser);
  }, []);

  const { useEvent } = useRealtime(userId || undefined);

  // Listen for global NOTIFICATION events
  useEvent("NOTIFICATION", (data) => {
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
    
    // Play a subtle sound if possible (optional)
  });

  // Listen for NEW_MESSAGE events to show chat notifications
  useEvent("NEW_MESSAGE", (data) => {
    // Don't show toast if we are already on the chat page for this user
    if (window.location.pathname.includes(`/messages/${data.sender_username}`)) {
        return;
    }

    toast(`Message from @${data.sender_username}`, {
      description: data.content,
      action: {
        label: "Reply",
        onClick: () => router.push(`/messages/${data.sender_username}`),
      },
    });
  });

  return null; // This component doesn't render anything
}
