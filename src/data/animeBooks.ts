export interface AnimeBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  readUrl: string;
  category: string;
  status: "Latest" | "Trending" | "Classic";
}

export const ANIME_BOOKS: AnimeBook[] = [
  {
    id: "manga_onepiece",
    title: "One Piece",
    author: "Eiichiro Oda",
    description: "Follow Monkey D. Luffy and his swashbuckling crew in their search for the ultimate treasure, the One Piece.",
    coverUrl: "https://images.mangafreak.net/mangas/one_piece/one_piece_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100020",
    category: "Action / Adventure",
    status: "Latest"
  },
  {
    id: "manga_jjk",
    title: "Jujutsu Kaisen",
    author: "Gege Akutami",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.",
    coverUrl: "https://images.mangafreak.net/mangas/jujutsu_kaisen/jujutsu_kaisen_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100034",
    category: "Supernatural / Action",
    status: "Trending"
  },
  {
    id: "manga_chainsawman",
    title: "Chainsaw Man",
    author: "Tatsuki Fujimoto",
    description: "Denji is a teenage boy living with a Chainsaw Devil named Pochita.",
    coverUrl: "https://images.mangafreak.net/mangas/chainsaw_man/chainsaw_man_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100037",
    category: "Dark Fantasy",
    status: "Trending"
  },
  {
    id: "manga_spyxfamily",
    title: "Spy x Family",
    author: "Tatsuya Endo",
    description: "A spy on an undercover mission gets married and adopts a child as part of his cover.",
    coverUrl: "https://images.mangafreak.net/mangas/spy_x_family/spy_x_family_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100056",
    category: "Comedy / Spy",
    status: "Classic"
  },
  {
    id: "manga_oshinoko",
    title: "Oshi no Ko",
    author: "Aka Akasaka",
    description: "Dr. Goro is reborn as the son of the young starlet Ai Hoshino after her delusional stalker murders him.",
    coverUrl: "https://images.mangafreak.net/mangas/oshi_no_ko/oshi_no_ko_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100191",
    category: "Drama / Mystery",
    status: "Latest"
  },
  {
    id: "manga_mha",
    title: "My Hero Academia",
    author: "Kohei Horikoshi",
    description: "In a world where eighty percent of the population has some kind of super-powered 'Quirk'.",
    coverUrl: "https://images.mangafreak.net/mangas/my_hero_academia/my_hero_academia_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100017",
    category: "Superhero / Action",
    status: "Classic"
  },
  {
    id: "manga_dbz_super",
    title: "Dragon Ball Super",
    author: "Akira Toriyama / Toyotarou",
    description: "Having defeated Majin Boo, Goku is at last able to enjoy a peaceful life, but a new threat appears.",
    coverUrl: "https://images.mangafreak.net/mangas/dragon_ball_super/dragon_ball_super_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100012",
    category: "Action / Sci-Fi",
    status: "Classic"
  },
  {
    id: "manga_kaiju8",
    title: "Kaiju No. 8",
    author: "Naoya Matsumoto",
    description: "A man working a job far removed from his childhood dreams gets wrapped up in an unexpected situation.",
    coverUrl: "https://images.mangafreak.net/mangas/kaiju_no_8/kaiju_no_8_1.jpg",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100110",
    category: "Action / Sci-Fi",
    status: "Trending"
  }
];
