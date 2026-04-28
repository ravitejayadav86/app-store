export interface MovieMeta {
  id: string;
  title: string;
  composer: string;
  coverUrl: string;
  color: string;
  saavnQuery: string; // query sent to JioSaavn search
}

export const TELUGU_MOVIES: MovieMeta[] = [
  {
    id: "pushpa2",
    title: "Pushpa 2: The Rule",
    composer: "Devi Sri Prasad",
    coverUrl: "/movies/pushpa2.png",
    color: "#c21807",
    saavnQuery: "Pushpa 2 The Rule Telugu DSP",
  },
  {
    id: "kalki",
    title: "Kalki 2898 AD",
    composer: "Santhosh Narayanan",
    coverUrl: "/movies/kalki.png",
    color: "#ff9800",
    saavnQuery: "Kalki 2898 AD Telugu Santhosh Narayanan",
  },
  {
    id: "devara",
    title: "Devara: Part 1",
    composer: "Anirudh Ravichander",
    coverUrl: "/movies/devara.png",
    color: "#1e3a8a",
    saavnQuery: "Devara Part 1 Telugu Anirudh",
  },
  {
    id: "guntur",
    title: "Guntur Kaaram",
    composer: "Thaman S",
    coverUrl: "/movies/guntur.png",
    color: "#b91c1c",
    saavnQuery: "Guntur Kaaram Telugu Thaman",
  },
  {
    id: "hanuman",
    title: "Hanu-Man",
    composer: "GowraHari",
    coverUrl: "/movies/hanuman.png",
    color: "#fb923c",
    saavnQuery: "Hanu-Man Telugu GowraHari",
  },
  {
    id: "salaar",
    title: "Salaar: Ceasefire",
    composer: "Ravi Basrur",
    coverUrl: "/movies/salaar.png",
    color: "#374151",
    saavnQuery: "Salaar Ceasefire Telugu Ravi Basrur",
  },
  {
    id: "tillu",
    title: "Tillu Square",
    composer: "Ram Miriyala",
    coverUrl: "/movies/tillu.jpg",
    color: "#8b5cf6",
    saavnQuery: "Tillu Square Telugu Ram Miriyala",
  },
  {
    id: "gamechanger",
    title: "Game Changer",
    composer: "Thaman S",
    coverUrl: "/movies/gamechanger.jpg",
    color: "#059669",
    saavnQuery: "Game Changer Telugu Ram Charan Thaman",
  },
  {
    id: "rrr",
    title: "RRR",
    composer: "M.M. Keeravani",
    coverUrl: "/movies/rrr.jpg",
    color: "#dc2626",
    saavnQuery: "RRR Telugu Naatu Naatu Keeravani",
  },
  {
    id: "baahubali2",
    title: "Baahubali 2: The Conclusion",
    composer: "M.M. Keeravani",
    coverUrl: "/movies/baahubali2.jpg",
    color: "#d97706",
    saavnQuery: "Baahubali 2 Telugu Keeravani",
  },
  {
    id: "alavaikuntha",
    title: "Ala Vaikunthapurramuloo",
    composer: "Thaman S",
    coverUrl: "/movies/alavaikuntha.jpg",
    color: "#7c3aed",
    saavnQuery: "Ala Vaikunthapurramuloo Telugu Thaman",
  },
  {
    id: "uppena",
    title: "Uppena",
    composer: "Devi Sri Prasad",
    coverUrl: "/movies/uppena.jpg",
    color: "#0ea5e9",
    saavnQuery: "Uppena Telugu Devi Sri Prasad",
  },
];
