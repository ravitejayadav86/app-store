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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/onepiece/images/a/af/Volume_1.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/be/Volume_1.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/chainsaw-man/images/3/36/Volume_1.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/spy-x-family/images/e/ea/Volume_1.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/kiminonawa/images/4/4b/Your_Name_Novel_Cover.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/weatheringwithyou/images/5/5e/Weathering_With_You_Novel_Cover.jpg&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/suzume-no-tojimari/images/3/3d/Suzume_Novel_Cover.jpg&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/koenokatachi/images/a/a2/Volume_1.png&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/kimisui/images/3/31/Volume_1.jpg&w=400&h=600&fit=cover",
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
    coverUrl: "https://images.weserv.nl/?url=https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d4/Volume_0.png&w=400&h=600&fit=cover",
    readUrl: "https://mangaplus.shueisha.co.jp/titles/100034",
    category: "Action / Supernatural",
    status: "Classic",
    type: "Movie Book"
  }
];
