"""
update_icons.py
===============
Assigns real, high-quality icon URLs to every app in the PandaStore database.
Run from the `backend/` directory:  python update_icons.py
"""

from database import SessionLocal
from models import App

# ── Icon map: exact app name → icon URL ──────────────────────────────────────
ICON_MAP = {
    # ── User-created apps ──────────────────────────────────────────────────
    "Apexchess":    "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
    "NumOracle":    "https://upload.wikimedia.org/wikipedia/commons/2/21/Simple_icon_number.svg",
    "Ishq Jalakar Dhurandhar": "https://upload.wikimedia.org/wikipedia/commons/4/40/Music_note_nicu_bucule%C8%9B_01.svg",

    # ── Productivity / Web Tools ───────────────────────────────────────────
    "Notion Web":    "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
    "Photopea":      "https://www.photopea.com/promo/icon512.png",
    "Excalidraw":    "https://excalidraw.com/apple-touch-icon.png",
    "Google Keep":   "https://upload.wikimedia.org/wikipedia/commons/e/e9/Google_Keep_icon_%282020%29.svg",
    "Spotify Web":   "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "Figma":         "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    "CodePen":       "https://upload.wikimedia.org/wikipedia/commons/a/a5/Codepen.io_logo_2012.svg",
    "Vercel":        "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
    "StackBlitz":    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Blitz_logo.svg/512px-Blitz_logo.svg.png",
    "Snapdrop":      "https://snapdrop.net/images/logo-192.png",
    "Canva":         "https://upload.wikimedia.org/wikipedia/commons/b/bb/Canva_Logo.png",
    "TinyWow":       "https://tinywow.com/img/logo.png",
    "Draw.io":       "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Diagrams.net_Logo.svg/512px-Diagrams.net_Logo.svg.png",
    "Vocal Remover": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Microphone_icon.svg",
    "Squoosh":       "https://squoosh.app/c/favicon-32x32.png",
    "12ft Ladder":   "https://12ft.io/favicon.ico",
    "Temp Mail":     "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg",
    "WolframAlpha":  "https://upload.wikimedia.org/wikipedia/commons/4/44/Wolfram_Language_Logo_2016.svg",
    "Monkeytype":    "https://monkeytype.com/favicon.ico",
    "Fast.com":      "https://fast.com/static/favicon.ico",

    # ── Games – Browser ──────────────────────────────────────────────────
    "2048":                "https://upload.wikimedia.org/wikipedia/commons/1/18/2048_logo.svg",
    "Slither.io":          "https://slither.io/favicon.ico",
    "Wordle":              "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Wordle_196_example.svg/320px-Wordle_196_example.svg.png",
    "Krunker.io":          "https://krunker.io/img/icon.png",
    "Little Alchemy 2":    "https://littlealchemy2.com/static/img/touch-icon-512.png",
    "Cookie Clicker":      "https://orteil.dashnet.org/cookieclicker/img/favicon.ico",
    "Agar.io":             "https://agar.io/favicon.ico",
    "Hextris":             "https://hextris.io/favicon.ico",
    "GeoGuessr":           "https://www.geoguessr.com/images/logo.svg",
    "Chess.com":           "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09z.png",
    "Tetris Web":          "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Tetris_logo.svg/512px-Tetris_logo.svg.png",
    "Skribbl.io":          "https://skribbl.io/res/favicon.png",
    "Friday Night Funkin'":"https://upload.wikimedia.org/wikipedia/commons/7/7d/Friday_Night_Funkin%27_game_logo_%28no_shadow%29.svg",
    "Survivor.io Web":     "https://play-lh.googleusercontent.com/xFHBxB3MqBQqJoqKiGFGS4iNVHh6xFLM3zFiJiH8e0-Q3JZxlI0L2EJoU4aN6gqhPw=s256",
    "Chrome Dino":         "https://upload.wikimedia.org/wikipedia/commons/f/f0/Google_Chrome_icon_%28September_2014%29.svg",
    "Flappy Bird HTML5":   "https://upload.wikimedia.org/wikipedia/en/5/52/Flappy_bird_nes.jpg",
    "Cut the Rope":        "https://upload.wikimedia.org/wikipedia/en/8/8e/Cut_the_Rope_iOS_icon.png",
    "Pac-Man Google":      "https://upload.wikimedia.org/wikipedia/commons/a/a1/Pac-Man_Spr%C3%A4ch.png",
    "Smash Karts":         "https://smashkarts.io/favicon.ico",
    "Shell Shockers":      "https://shellshock.io/img/shellshockers_icon.png",

    # ── Games – Mobile / AAA ─────────────────────────────────────────────
    "Battlegrounds Mobile India (BGMI)": "https://upload.wikimedia.org/wikipedia/en/a/a0/Battlegrounds_Mobile_India_logo.png",
    "Free Fire MAX":        "https://upload.wikimedia.org/wikipedia/en/a/a2/Free_Fire_logo.png",
    "Call of Duty: Mobile": "https://upload.wikimedia.org/wikipedia/en/c/c9/Call_of_Duty_Mobile_icon.png",
    "PUBG MOBILE":          "https://upload.wikimedia.org/wikipedia/en/3/30/PUBG_Mobile_logo.png",
    "Genshin Impact":       "https://upload.wikimedia.org/wikipedia/en/5/5d/Genshin_Impact_logo.png",
    "Asphalt 9: Legends":   "https://play-lh.googleusercontent.com/VSwHvxmHqSoNZMPjkJcMgKqAQ3E8R1mWqCNUH3Z2PGf8gHuYg9BtHEL15sSbU0mnlg=s256",
    "Diablo Immortal":      "https://upload.wikimedia.org/wikipedia/en/6/66/Diablo_Immortal_Logo.png",
    "Shadowgun Legends":    "https://play-lh.googleusercontent.com/o-I_Csy5V7ONAB2IhfzOkWoiMDPnGdl2JxS5hGS0UxSWTwWQVqQQBzgbTR_1U55Fgfc=s256",
    "Modern Combat 5":      "https://play-lh.googleusercontent.com/VjOnBrCrPcUGIbg1gNEiDjlXAtLiHaOL7vlBHw3zRyqbFR5a_b-Jlk9V5V0eiXNcng=s256",
    "ARK: Survival Evolved":"https://upload.wikimedia.org/wikipedia/en/1/1a/ARK_-_Survival_Evolved_logo.png",
    "Into the Dead 2":      "https://play-lh.googleusercontent.com/DLvqZTOdp45JQEHl2xZaVOEi-oHEqLPmWJ28QafZ0j0tJA3J10mxJYXzI0d8AjOPFQ=s256",
    "Mortal Kombat":        "https://upload.wikimedia.org/wikipedia/commons/0/0e/MK_Logo_by_PD.png",
    "Injustice 2":          "https://upload.wikimedia.org/wikipedia/en/0/06/Injustice_2_cover_art.jpg",
    "MARVEL Contest of Champions": "https://play-lh.googleusercontent.com/I-QiNSwvJ4v2j-R0u2lgEjMzSVWb_n-gqT6QyHN1_lqg1JN4nZfCf3RdYLt-S8TJFg=s256",
    "Honkai: Star Rail":    "https://upload.wikimedia.org/wikipedia/en/8/8a/Honkai-_Star_Rail_coverart.jpg",
    "Real Racing 3":        "https://play-lh.googleusercontent.com/U_HaKDsRuUUJSwU15rq3-VJAnBqHn45Bz6lJ_RD93xvOLc8rVKuN7e_0vZF7B3bpw=s256",
    "Need for Speed No Limits": "https://play-lh.googleusercontent.com/rUyZFP7atMZMTzSkyLLOqpkHSfuiHrj0_vxEXqh_nXMfRLdivSX1u9FbI3fAQ-JxYg=s256",
    "eFootball 2024":       "https://upload.wikimedia.org/wikipedia/en/e/ef/EFootball_2023_logo.jpg",
    "Wuthering Waves":      "https://upload.wikimedia.org/wikipedia/en/d/d8/Wuthering_Waves_game_icon.jpg",
    "Arena Breakout":       "https://play-lh.googleusercontent.com/2QLLyCDaTMaEHXL7LWlc4lcBH6DLFSQkNiE-FIPbzuDCsxRmpqD38NSwHK_Z2i2blA=s256",

    # ── Already seeded (from seed_playstore.py) – keep their icons ────────
    "WhatsApp Messenger":   "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    "Instagram":            "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "Subway Surfers":       "https://upload.wikimedia.org/wikipedia/en/2/23/Subway_Surfers_icon.png",
    "Spotify: Music and Podcasts": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "Netflix":              "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "Clash of Clans":       "https://upload.wikimedia.org/wikipedia/en/9/91/Clash_of_Clans_icon.png",
    "TikTok":               "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "Candy Crush Saga":     "https://upload.wikimedia.org/wikipedia/en/e/e0/Candy_Crush_Saga_icon.png",
    "Duolingo: Language Lessons": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Duolingo_logo_%282019%29.svg",
    "Among Us":             "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
}

# ── Fallback icons by category ────────────────────────────────────────────────
CATEGORY_FALLBACKS = {
    "games":       "https://upload.wikimedia.org/wikipedia/commons/4/40/Game_icon.svg",
    "productivity":"https://upload.wikimedia.org/wikipedia/commons/a/a9/Google_Workspace_icon.svg",
    "development": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg",
    "utilities":   "https://upload.wikimedia.org/wikipedia/commons/f/f0/Oxygen480-apps-utilities-terminal.svg",
    "graphics":    "https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg",
    "music":       "https://upload.wikimedia.org/wikipedia/commons/4/40/Music_note_nicu_bucule%C8%9B_01.svg",
    "books":       "https://upload.wikimedia.org/wikipedia/commons/a/a4/Open_book_nae_02.svg",
}


def update_icons():
    updated = 0
    skipped = 0
    fallback = 0

    with SessionLocal() as db:
        apps = db.query(App).all()
        for app in apps:
            name = app.name.strip()

            if name in ICON_MAP:
                app.icon_url = ICON_MAP[name]
                updated += 1
            else:
                # Try a category-level fallback
                cat_icon = CATEGORY_FALLBACKS.get(app.category.lower())
                if cat_icon:
                    app.icon_url = cat_icon
                    fallback += 1
                else:
                    skipped += 1
                    print(f"  [NO ICON] ID {app.id}: {name!r} (category: {app.category})")

        db.commit()

    print(f"\nDone!")
    print(f"  Exact match updated : {updated}")
    print(f"  Category fallback   : {fallback}")
    print(f"  Skipped (no match)  : {skipped}")


if __name__ == "__main__":
    update_icons()
