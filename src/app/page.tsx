import HomeClient from "./HomeClient";
import api from "@/lib/api";

export const revalidate = 60; // Regenerate this page every 60 seconds

export default async function Page() {
  let initialApps = [];
  try {
    // This runs ON THE SERVER, sending pre-rendered HTML to the user instantly!
    const res = await api.get("/apps/");
    initialApps = res.data.slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch initial apps on server:", error);
  }

  return <HomeClient initialApps={initialApps} />;
}
