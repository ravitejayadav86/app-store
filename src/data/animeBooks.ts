export interface AnimeBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  readUrl: string;
  category: string;
  status: "Latest" | "Trending" | "Classic";
  type?: "Manga" | "Movie Book";
}

export const ANIME_BOOKS: AnimeBook[] = [
  // --- POPULAR MANGA ---
  {
    id: "manga_onepiece",
    title: "One Piece",
    author: "Eiichiro Oda",
    description: "Follow Monkey D. Luffy and his swashbuckling crew in their search for the ultimate treasure, the One Piece.",
    coverUrl: "/books/onepiece.png",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100020",
    category: "Action / Adventure",
    status: "Latest",
    type: "Manga"
  },
  {
    id: "manga_jjk",
    title: "Jujutsu Kaisen",
    author: "Gege Akutami",
    description: "A boy swallows a cursed talisman - the finger of a demon - and becomes cursed himself.",
    coverUrl: "/books/jjk.png",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100034",
    category: "Supernatural / Action",
    status: "Trending",
    type: "Manga"
  },
  {
    id: "manga_chainsawman",
    title: "Chainsaw Man",
    author: "Tatsuki Fujimoto",
    description: "Denji is a teenage boy living with a Chainsaw Devil named Pochita.",
    coverUrl: "/books/chainsawman.png",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100037",
    category: "Dark Fantasy",
    status: "Trending",
    type: "Manga"
  },
  {
    id: "manga_spyxfamily",
    title: "Spy x Family",
    author: "Tatsuya Endo",
    description: "A spy on an undercover mission gets married and adopts a child as part of his cover.",
    coverUrl: "/books/spyxfamily.png",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100056",
    category: "Comedy / Spy",
    status: "Classic",
    type: "Manga"
  },

  // --- ANIME MOVIE BOOKS / LIGHT NOVELS ---
  {
    id: "movie_yourname",
    title: "Your Name.",
    author: "Makoto Shinkai",
    description: "Mitsuha and Taki are two total strangers living completely different lives. But when Mitsuha makes a wish, they become connected.",
    coverUrl: "/books/yourname.png",
    readUrl: "https://global.bookwalker.jp/de6c7c4e5e-6e4b-4f5e-8e4b-6e4b4f5e8e4b/",
    category: "Romance / Sci-Fi",
    status: "Classic",
    type: "Movie Book"
  },
  {
    id: "movie_weathering",
    title: "Weathering With You",
    author: "Makoto Shinkai",
    description: "High school student Hodaka runs away to Tokyo and meets Hina, a girl who can control the weather.",
    coverUrl: "/books/weathering.png",
    readUrl: "https://global.bookwalker.jp/de6c7c4e5e-6e4b-4f5e-8e4b-6e4b4f5e8e4b/",
    category: "Fantasy / Romance",
    status: "Classic",
    type: "Movie Book"
  },
  {
    id: "movie_suzume",
    title: "Suzume",
    author: "Makoto Shinkai",
    description: "A 17-year-old girl named Suzume helps a mysterious young man close doors from the other side that are releasing disasters.",
    coverUrl: "/books/suzume.png",
    readUrl: "https://global.bookwalker.jp/de6c7c4e5e-6e4b-4f5e-8e4b-6e4b4f5e8e4b/",
    category: "Adventure / Fantasy",
    status: "Latest",
    type: "Movie Book"
  },
  {
    id: "movie_asilentvoice",
    title: "A Silent Voice",
    author: "Yoshitoki Oima",
    description: "The story revolves around Shoya Ishida, a former bully, and Shoko Nishimiya, a deaf girl he bullied in elementary school.",
    coverUrl: "/books/asilentvoice.png",
    readUrl: "https://global.bookwalker.jp/de6c7c4e5e-6e4b-4f5e-8e4b-6e4b4f5e8e4b/",
    category: "Drama / Slice of Life",
    status: "Classic",
    type: "Movie Book"
  },
  {
    id: "movie_pancreas",
    title: "I Want to Eat Your Pancreas",
    author: "Yoru Sumino",
    description: "An aloof high school student discovers a diary in a hospital waiting room, belonging to his popular classmate Sakura Yamauchi.",
    coverUrl: "/books/yourname.png", // Fallback to yourname for others if failed
    readUrl: "https://global.bookwalker.jp/de6c7c4e5e-6e4b-4f5e-8e4b-6e4b4f5e8e4b/",
    category: "Drama / Romance",
    status: "Classic",
    type: "Movie Book"
  },
  {
    id: "movie_jjk0",
    title: "Jujutsu Kaisen 0",
    author: "Gege Akutami",
    description: "The prequel to the hit series. Yuta Okkotsu is haunted by the spirit of his childhood friend Rika.",
    coverUrl: "/books/jjk.png",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100034",
    category: "Action / Supernatural",
    status: "Classic",
    type: "Movie Book"
  }
];
