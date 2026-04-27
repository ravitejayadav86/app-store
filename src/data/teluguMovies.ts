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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e2/d4/ab/e2d4abcf-00d5-637f-f2e9-4302142a210c/mzaf_3520722784703485852.plus.aac.p.m4a",
        coverUrl: "/movies/pushpa2.png",
        color: "#c21807",
      },
      {
        id: "p2_2",
        title: "Sooseki (The Couple Song)",
        artist: "Shreya Ghoshal",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/b2/c1/cf/b2c1cf81-5d68-5450-9259-579369c2bd1e/mzaf_9958239383362182746.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ce/fb/ed/cefbed1c-c98f-f202-b0bb-8e10ac894d90/mzaf_148736713310840851.plus.aac.p.m4a",
        coverUrl: "/movies/kalki.png",
        color: "#ff9800",
      },
      {
        id: "kalki_2",
        title: "Theme of Kalki",
        artist: "Santhosh Narayanan",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ce/fb/ed/cefbed1c-c98f-f202-b0bb-8e10ac894d90/mzaf_148736713310840851.plus.aac.p.m4a",
        coverUrl: "/movies/kalki.png",
        color: "#ff9800",
      },
      {
        id: "kalki_3",
        title: "Ta Takkara",
        artist: "Sanjith Hegde",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/26/05/25/26052518-bee4-d0e5-ca2b-dd83d84e2244/mzaf_1776691534809931425.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/9d/b8/64/9db8645e-72d2-9cd6-d32d-7138c1067311/mzaf_10992358533592329006.plus.aac.p.m4a",
        coverUrl: "/movies/devara.png",
        color: "#1e3a8a",
      },
      {
        id: "devara_2",
        title: "Chuttamalle",
        artist: "Shilpa Rao",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/53/70/0c/53700c23-87a7-e050-11ca-4b1bd52d2d2f/mzaf_9309538996740184890.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/90/4a/9e/904a9ebe-2a18-cef5-6aa0-66b0a1f3ef27/mzaf_18338442870179445556.plus.aac.p.m4a",
        coverUrl: "/movies/guntur.png",
        color: "#b91c1c",
      },
      {
        id: "guntur_2",
        title: "Kurchi Madathapetti",
        artist: "Sri Krishna, Sahithi Chaganti",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/03/95/c3/0395c3a4-368a-3aa5-06f8-f9e0ebd553a4/mzaf_1960951393962288235.plus.aac.p.m4a",
        coverUrl: "/movies/guntur.png",
        color: "#b91c1c",
      },
      {
        id: "guntur_3",
        title: "Oh My Baby",
        artist: "Shilpa Rao",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9e/94/6e/9e946e41-659d-683b-005a-9d6f69928682/mzaf_10522353924985926036.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/07/0d/6f/070d6ff9-e580-e0ed-3912-6e11cd6a19ad/mzaf_14366492279575630968.plus.aac.p.m4a",
        coverUrl: "/movies/hanuman.png",
        color: "#fb923c",
      },
      {
        id: "hanu_2",
        title: "Anjanadri Theme",
        artist: "GowraHari",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/e0/cf/06/e0cf0677-59a8-d8b7-cf63-615c590e7944/mzaf_739583847676876537.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/e6/bf/c3/e6bfc3be-9b47-44d0-bc94-0ec1075f620c/mzaf_990870702817603099.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/5f/2f/a5/5f2fa5b8-2d45-8ba5-d55b-c835dec31f9c/mzaf_12474314080829075882.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a1/9b/71/a19b7115-ea35-8ef6-e942-54219c906a85/mzaf_6435775000797646916.plus.aac.p.m4a",
        coverUrl: "/movies/tillu.jpg",
        color: "#8b5cf6",
      },
      {
        id: "tillu_2",
        title: "Radhika",
        artist: "Ram Miriyala",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/08/45/32/084532ff-9fe5-20d7-2b92-c727605ba84e/mzaf_12087408536112666275.plus.aac.p.m4a",
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
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/47/ba/be/47babefd-7192-a697-b077-f50a62e35970/mzaf_3372001148200964191.plus.aac.p.m4a",
        coverUrl: "/movies/gamechanger.jpg",
        color: "#059669",
      },
      {
        id: "gc_2",
        title: "Raa Macha Macha",
        artist: "Nakash Aziz",
        audioUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/82/73/59/827359ca-9422-1382-3e43-6acfc7a6dabc/mzaf_6578831686159995674.plus.aac.p.m4a",
        coverUrl: "/movies/gamechanger.jpg",
        color: "#059669",
      },
    ],
  },
];
