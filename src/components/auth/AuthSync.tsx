"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import api from "@/lib/api";

export default function AuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const syncAuth = async () => {
      // If we have a session but no backend token in localStorage
      if (status === "authenticated" && session?.user && !localStorage.getItem("token")) {
        try {
          console.log("Syncing NextAuth session with backend...");
          const res = await api.post("/auth/oauth-login", {
            email: session.user.email,
            name: session.user.name,
          });

          if (res.data.access_token) {
            localStorage.setItem("token", res.data.access_token);
            console.log("Backend auth synchronized successfully.");
            // Optional: refresh page or trigger state update if needed
            window.location.reload(); 
          }
        } catch (error) {
          console.error("Failed to sync auth with backend:", error);
        }
      } 
      
      // Clear token if user is signed out in NextAuth
      if (status === "unauthenticated" && localStorage.getItem("token")) {
        console.log("Clearing backend token as NextAuth session is gone.");
        localStorage.removeItem("token");
      }
    };

    syncAuth();
  }, [session, status]);

  return null; // This component doesn't render anything
}
