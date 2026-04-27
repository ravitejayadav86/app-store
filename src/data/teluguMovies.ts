import { Track } from "@/components/ui/MusicPlayer";

export interface MovieAlbum {
  id: string;
  title: string;
  composer: string;
  coverUrl: string;
  tracks: Track[];
}

// Since we don't have real MP3 links for these copyrighted songs,
// we use SoundHelix royalty-free tracks as placeholders for the audio.
export const TELUGU_MOVIES: MovieAlbum[] = [
  {
    id: "pushpa2",
    title: "Pushpa 2: The Rule",
    composer: "Devi Sri Prasad",
    coverUrl: "/movies/pushpa2.png",
    tracks: [
      {
        id: "p2_1",
        title: "Pushpa Pushpa",
        artist: "Devi Sri Prasad, Nakash Aziz",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverUrl: "/movies/pushpa2.png",
        color: "#c21807",
      },
      {
        id: "p2_2",
        title: "Sooseki (The Couple Song)",
        artist: "Shreya Ghoshal",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverUrl: "/movies/pushpa2.png",
        color: "#c21807",
      },
    ],
  },
  {
    id: "kalki",
    title: "Kalki 2898 AD",
    composer: "Santhosh Narayanan",
    coverUrl: "/movies/kalki.png",
    tracks: [
      {
        id: "kalki_1",
        title: "Bhairava Anthem",
        artist: "Diljit Dosanjh, Vijaynarain",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverUrl: "/movies/kalki.png",
        color: "#ff9800",
      },
      {
        id: "kalki_2",
        title: "Theme of Kalki",
        artist: "Santhosh Narayanan",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        coverUrl: "/movies/kalki.png",
        color: "#ff9800",
      },
      {
        id: "kalki_3",
        title: "Ta Takkara",
        artist: "Sanjith Hegde",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        coverUrl: "/movies/kalki.png",
        color: "#ff9800",
      },
    ],
  },
  {
    id: "devara",
    title: "Devara: Part 1",
    composer: "Anirudh Ravichander",
    coverUrl: "/movies/devara.png",
    tracks: [
      {
        id: "devara_1",
        title: "Fear Song",
        artist: "Anirudh Ravichander",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
        coverUrl: "/movies/devara.png",
        color: "#1e3a8a",
      },
      {
        id: "devara_2",
        title: "Chuttamalle",
        artist: "Shilpa Rao",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
        coverUrl: "/movies/devara.png",
        color: "#1e3a8a",
      },
      {
        id: "devara_3",
        title: "Daudi",
        artist: "Nakash Aziz",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        coverUrl: "/movies/devara.png",
        color: "#1e3a8a",
      },
    ],
  },
  {
    id: "guntur",
    title: "Guntur Kaaram",
    composer: "Thaman S",
    coverUrl: "/movies/guntur.png",
    tracks: [
      {
        id: "guntur_1",
        title: "Dum Masala",
        artist: "Sanjith Hegde, Thaman S",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
        coverUrl: "/movies/guntur.png",
        color: "#b91c1c",
      },
      {
        id: "guntur_2",
        title: "Kurchi Madathapetti",
        artist: "Sri Krishna, Sahithi Chaganti",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
        coverUrl: "/movies/guntur.png",
        color: "#b91c1c",
      },
      {
        id: "guntur_3",
        title: "Oh My Baby",
        artist: "Shilpa Rao",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
        coverUrl: "/movies/guntur.png",
        color: "#b91c1c",
      },
    ],
  },
  {
    id: "hanuman",
    title: "Hanu-Man",
    composer: "GowraHari, Anudeep Dev",
    coverUrl: "/movies/hanuman.png",
    tracks: [
      {
        id: "hanu_1",
        title: "Super Hero Hanuman",
        artist: "Sai Charan Bhaskaruni",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
        coverUrl: "/movies/hanuman.png",
        color: "#fb923c",
      },
      {
        id: "hanu_2",
        title: "Anjanadri Theme",
        artist: "GowraHari",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
        coverUrl: "/movies/hanuman.png",
        color: "#fb923c",
      },
    ],
  },
  {
    id: "salaar",
    title: "Salaar: Part 1 - Ceasefire",
    composer: "Ravi Basrur",
    coverUrl: "/movies/salaar.png",
    tracks: [
      {
        id: "salaar_1",
        title: "Sooreede",
        artist: "Harini Ivaturi",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
        coverUrl: "/movies/salaar.png",
        color: "#374151",
      },
      {
        id: "salaar_2",
        title: "Prathi Kadalo",
        artist: "Ravi Basrur",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
        coverUrl: "/movies/salaar.png",
        color: "#374151",
      },
      {
        id: "salaar_3",
        title: "Vinaraa",
        artist: "Sachin Basrur",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
        coverUrl: "/movies/salaar.png",
        color: "#374151",
      },
    ],
  },
  {
    id: "tillu",
    title: "Tillu Square",
    composer: "Ram Miriyala",
    coverUrl: "/movies/tillu.jpg",
    tracks: [
      {
        id: "tillu_1",
        title: "Ticket Eh Konkunda",
        artist: "Ram Miriyala",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverUrl: "/movies/tillu.jpg",
        color: "#8b5cf6",
      },
      {
        id: "tillu_2",
        title: "Radhika",
        artist: "Ram Miriyala",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverUrl: "/movies/tillu.jpg",
        color: "#8b5cf6",
      },
    ],
  },
  {
    id: "gamechanger",
    title: "Game Changer",
    composer: "Thaman S",
    coverUrl: "/movies/gamechanger.jpg",
    tracks: [
      {
        id: "gc_1",
        title: "Jaragandi",
        artist: "Daler Mehndi, Sunidhi Chauhan",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverUrl: "/movies/gamechanger.jpg",
        color: "#059669",
      },
      {
        id: "gc_2",
        title: "Raa Macha Macha",
        artist: "Nakash Aziz",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        coverUrl: "/movies/gamechanger.jpg",
        color: "#059669",
      },
    ],
  },
];
