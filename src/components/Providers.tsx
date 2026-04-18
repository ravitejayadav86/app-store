"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import api from "@/lib/api";

function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    const syncToken = async () => {
      if (session?.user?.email) {
        const existingToken = localStorage.getItem("token");
        if (!existingToken) {
          try {
            const res = await api.post("/auth/oauth-login", {
              email: session.user.email,
              name: session.user.name,
            });
            localStorage.setItem("token", res.data.access_token);
          } catch (err) {
            console.error("Failed to sync OAuth token", err);
          }
        }
      }
    };
    syncToken();
  }, [session?.user?.email]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}