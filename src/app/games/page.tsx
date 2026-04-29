import GamesClient from "./GamesClient";
import api from "@/lib/api";

export const revalidate = 60; // Regenerate this page every 60 seconds

export default async function GamesPage() {
  let initialGames = [];
  try {
    const res = await api.get("/apps/");
    initialGames = res.data.filter((app: any) => 
      app.category.toLowerCase() === "games" || 
      app.category.toLowerCase() === "game"
    );
  } catch (error) {
    console.error("Failed to fetch games on server:", error);
  }

  return <GamesClient initialGames={initialGames} />;
}
