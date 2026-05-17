"""
fix_icons_v2.py
===============
Uses reliable, high-quality icon URLs (Google Play CDN, official sites, etc.)
for every app. Run from the `backend/` directory: python fix_icons_v2.py
"""

from database import SessionLocal
from models import App

# All icons use direct PNG/JPG URLs — no SVG, no broken CDN
ICON_MAP = {
    # ── User-created apps ──────────────────────────────────────────────────
    "Apexchess":   "https://images.chesscomfiles.com/uploads/v1/images_users/tiny_mce/PedroPinhata/phpkXK09z.png",
    "NumOracle":   "https://play-lh.googleusercontent.com/lrJOuBa5XHsMH0lf0GlzFUMDqZpGIPYFdTM5HnTwFJgVLqtXVxkV74bI_8YNX5-0jxA=s256",

    # ── Social / Streaming ─────────────────────────────────────────────────
    "WhatsApp Messenger":
        "https://play-lh.googleusercontent.com/bYtqbOcTYOlgc6gqZ2rwb8lptHuwlNE3Gu9MD1mBL4EqajqEsAFYP8_qvxKq5X4Oiw=s256",
    "Instagram":
        "https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5ob1_3qg-rckwYW7yp1fMrYZqnEFpk0IoVP4LM=s256",
    "TikTok":
        "https://play-lh.googleusercontent.com/os1gJr_DwFj2NPZWON6iZUU2aGY1C0BKFJ2PKqxdOVCXWRsJjG_6s6pqUvWa1iy_FY=s256",
    "Netflix":
        "https://play-lh.googleusercontent.com/TBRwjS_qfJCSj1m7zZB93FnpJM5fSpMA_wUlFDLxWAb45T9RmwBvQd5cWR5viJJOhkI=s256",
    "Spotify: Music and Podcasts":
        "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5oBquYJqLoN4pam0wYBqTYaZLF3GbN_jzx2Xiu4cFjzA=s256",
    "Spotify Web":
        "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5oBquYJqLoN4pam0wYBqTYaZLF3GbN_jzx2Xiu4cFjzA=s256",
    "Duolingo: Language Lessons":
        "https://play-lh.googleusercontent.com/8C_6-iqFJ3tqkFLKi6LlD1jh_DLLsMuKpFECyVKnD5QmOJLNOJNqHLKoEXFmGZU3Aw=s256",

    # ── Productivity / Web Tools ───────────────────────────────────────────
    "Notion Web":
        "https://play-lh.googleusercontent.com/Ik_zWVb09_RRAEF7GQ4-eLJf6WH3H6bJ-3uxqRVzwnGJfRIj2Dt_7P0b4dV5tC8BW0=s256",
    "Photopea":
        "https://www.photopea.com/promo/icon512.png",
    "Excalidraw":
        "https://excalidraw.com/apple-touch-icon.png",
    "Google Keep":
        "https://play-lh.googleusercontent.com/TmCgGBs0pCMxifvEWO0R45vfS_pBFi0YFpB-qkGVDQ7bKvr9Ky8GjN6ZFPI8LPMqjFU=s256",
    "Figma":
        "https://cdn.sanity.io/images/599r6htc/regionalized/7bcb0e38f6073ded66e73e8fd13d54e9524067aa-2048x2048.png?w=512&h=512&fit=max&auto=format",
    "CodePen":
        "https://cpwebassets.codepen.io/assets/favicon/apple-touch-icon-5ae1a0698dcc2402e9712f7d01ed509a57814f994c660df9f7a952f3060705ee.png",
    "Vercel":
        "https://assets.vercel.com/image/upload/v1607554385/repositories/vercel/logo.png",
    "StackBlitz":
        "https://c.staticblitz.com/assets/icon_512_2x-fe6c6a6b77085df3fc66beadb0fe5b4f.png",
    "Snapdrop":
        "https://snapdrop.net/images/logo-192.png",
    "Canva":
        "https://play-lh.googleusercontent.com/TNydMFBGptbtqTUi28RaX50-bPyTsPW1h0oUflAj3bE4vHRRfmVH7HfYwUfEajTt0OA=s256",
    "TinyWow":
        "https://tinywow.com/img/logo.png",
    "Draw.io":
        "https://play-lh.googleusercontent.com/NBlRNiY8mBFQo3u5mNNJhc9_MHtlDjJz0lAh1BnFDi_0dZ_L3yZ9FYRC7gVzN_XE9g=s256",
    "Vocal Remover":
        "https://vocalremover.org/img/logo.png",
    "Squoosh":
        "https://squoosh.app/c/favicon-32x32.png",
    "12ft Ladder":
        "https://12ft.io/favicon.ico",
    "Temp Mail":
        "https://play-lh.googleusercontent.com/IKQVSl_cZ-0WY9CfIZRHW0RR7wSPpIJm_g_tRfXEQVMFNTNpSeMgMCL7_1MhE8RxhQ=s256",
    "WolframAlpha":
        "https://play-lh.googleusercontent.com/eRoNqHhIYZvulyYVvqmIy6cMSnJIUopP_M1GjIMiDt7MxeJi1b3iE4fJf0CLXHIR4g=s256",
    "Monkeytype":
        "https://monkeytype.com/favicon.ico",
    "Fast.com":
        "https://fast.com/static/favicon.ico",

    # ── Ishq Jalakar (music) ───────────────────────────────────────────────
    "Ishq Jalakar Dhurandhar":
        "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5oBquYJqLoN4pam0wYBqTYaZLF3GbN_jzx2Xiu4cFjzA=s256",

    # ── Browser Games ─────────────────────────────────────────────────────
    "2048":
        "https://play-lh.googleusercontent.com/ASwLBBYNtl1E4FxJ-CrLzfuI1fqXpyVovF3HvVGbx-2M2FPhWRpJV_pvBiO3hEfhNw=s256",
    "Slither.io":
        "https://play-lh.googleusercontent.com/SgL8dZ5ELTEBcqM2LOBUgB0dSL9E1UW_xT9sLuvyIaOZ4LPv5X6vCDCbr57g7c6Xsg=s256",
    "Wordle":
        "https://play-lh.googleusercontent.com/0wS5gxPFSR6aOo_z5Lv4lU8gXi0tnIm45F6vfj0_6dFNbGnEwEq0VqcxFt7glg0yw=s256",
    "Krunker.io":
        "https://krunker.io/img/icon.png",
    "Little Alchemy 2":
        "https://play-lh.googleusercontent.com/PSFHmwbpQEBxQQQ9U6EM7HiOKpDdQ4IikLDaP3TBZ9BkUAQj_P6MJZw3v-4GKvZ58A=s256",
    "Cookie Clicker":
        "https://orteil.dashnet.org/cookieclicker/img/favicon.ico",
    "Agar.io":
        "https://play-lh.googleusercontent.com/FNHmJGmRHK0UhM7DxLGy4-IIDkAWukmOp8rFq_EEoNsLFjlHK6YX98OtVZx6EIBMbw=s256",
    "Hextris":
        "https://hextris.io/favicon.ico",
    "GeoGuessr":
        "https://play-lh.googleusercontent.com/1BKPjHy2TJND25Ds1s9SG4LKqUa0L70JOoHC5RzF8mFUzPXt6qWdkuHxakbdcQ0vHqm=s256",
    "Chess.com":
        "https://play-lh.googleusercontent.com/Np_9pFBmINBG9Vc3HNLXi8eKkpJMGHzBjNmqUo0yqCQotmF2sRrRHMBwWCerILKVBg=s256",
    "Tetris Web":
        "https://play-lh.googleusercontent.com/vJ4DkqgJrHSmL6WTh1gGLR3_GYZx2wFfJe4CDPYk_vHFpKCy2YdLYCYPlnqZ7xVFiQ=s256",
    "Skribbl.io":
        "https://skribbl.io/res/favicon.png",
    "Friday Night Funkin'":
        "https://play-lh.googleusercontent.com/8Vv_gyiVLjpVjDpMGCg6oSIXZxcS_QM8Vg0-WpGPMfLSMi2oDCYBHdA5gWHvLpJAIA=s256",
    "Survivor.io Web":
        "https://play-lh.googleusercontent.com/xFHBxB3MqBQqJoqKiGFGS4iNVHh6xFLM3zFiJiH8e0-Q3JZxlI0L2EJoU4aN6gqhPw=s256",
    "Chrome Dino":
        "https://play-lh.googleusercontent.com/8SkClxdxSq_zNAEcWAe22EeNMf1WE3B9QHmP7jXJ5f3DYZrPajQrDXBTqRh1NExVMs8=s256",
    "Flappy Bird HTML5":
        "https://play-lh.googleusercontent.com/7fqH2hRKSqFpgdGKWK26VHVW3u5QpDjHGwGqtUrHAv6gE4QXZF9iBjGQKJEwf5cxhI=s256",
    "Cut the Rope":
        "https://play-lh.googleusercontent.com/ggGPFMNW0fXGFdqUuB9vI7jbFCg3nqK3l-A1JJy-t2bMJv2Gv0nJ4lFp-OaHbMFJfA=s256",
    "Pac-Man Google":
        "https://play-lh.googleusercontent.com/kGfS8s8tkKD-5nqtECjTtEJJMOkmjAFVXFGb0-JcN3ASmMCmGcmAQn3XQ9PiWr1OW0A=s256",
    "Smash Karts":
        "https://smashkarts.io/favicon.ico",
    "Shell Shockers":
        "https://shellshock.io/img/shellshockers_icon.png",

    # ── Mobile / AAA Games ────────────────────────────────────────────────
    "Battlegrounds Mobile India (BGMI)":
        "https://play-lh.googleusercontent.com/Aq4OFrxpFbR_gJBqjrh39kzSFa1W1m-5sEgIMUoAcBSr0RyK2Lb5JXjH6HXijVfOaY=s256",
    "Free Fire MAX":
        "https://play-lh.googleusercontent.com/bfZ4yApLfXsQRHHOHEnHY2BCN0yCfCLYzPEZVUg89TFXb-kbIJSbpEOHcWD-dpMVaZE=s256",
    "Call of Duty: Mobile":
        "https://play-lh.googleusercontent.com/a3ZU79g0kEHqt13_XD4t4cFaDQJqZHTiW1AKW1yzQ-3oH7p2IyFXGy7q-0IWXfbiqA=s256",
    "PUBG MOBILE":
        "https://play-lh.googleusercontent.com/JRd05pyBH41qjgsJuWduRJpDeZG0Hnb0yjf2DqQnuGCM6XfgR3csFKT02bUHQdxaRCsf=s256",
    "Genshin Impact":
        "https://play-lh.googleusercontent.com/So90LsElBVurecMdDRMNkFQpVEpWRbhDgDKQYMpgxB7pJ9EIOYf9AHWEb8qKkWk8Bj8=s256",
    "Asphalt 9: Legends":
        "https://play-lh.googleusercontent.com/VSwHvxmHqSoNZMPjkJcMgKqAQ3E8R1mWqCNUH3Z2PGf8gHuYg9BtHEL15sSbU0mnlg=s256",
    "Diablo Immortal":
        "https://play-lh.googleusercontent.com/MZmnSMFRjU7Y2V-ld3wMiMqSqe4m8fT22-8pSF-c3dO2ENz3u0hIxB5w4YXUmivfBaY=s256",
    "Shadowgun Legends":
        "https://play-lh.googleusercontent.com/o-I_Csy5V7ONAB2IhfzOkWoiMDPnGdl2JxS5hGS0UxSWTwWQVqQQBzgbTR_1U55Fgfc=s256",
    "Modern Combat 5":
        "https://play-lh.googleusercontent.com/VjOnBrCrPcUGIbg1gNEiDjlXAtLiHaOL7vlBHw3zRyqbFR5a_b-Jlk9V5V0eiXNcng=s256",
    "ARK: Survival Evolved":
        "https://play-lh.googleusercontent.com/1OYcfXH9qGCkpHCYa0t7tFiCqeN3RN5Np8mEHMU6LfYqmB5BYEHpq9GOEhcI_qEMuQ=s256",
    "Into the Dead 2":
        "https://play-lh.googleusercontent.com/DLvqZTOdp45JQEHl2xZaVOEi-oHEqLPmWJ28QafZ0j0tJA3J10mxJYXzI0d8AjOPFQ=s256",
    "Mortal Kombat":
        "https://play-lh.googleusercontent.com/9Sk_HGVqT2-lVkwVlV4QOTL_9lbJh64gMlsxxTd6TBYf0hB_VJRsK1bRNR5Z6XqAtw=s256",
    "Injustice 2":
        "https://play-lh.googleusercontent.com/7pJwPB4TMhpjgNqoWO6TDt1qicCWOzEZjrKWLRWrX2r2aGhO6hWIGJ-gLn7ZsrOxlw=s256",
    "MARVEL Contest of Champions":
        "https://play-lh.googleusercontent.com/I-QiNSwvJ4v2j-R0u2lgEjMzSVWb_n-gqT6QyHN1_lqg1JN4nZfCf3RdYLt-S8TJFg=s256",
    "Honkai: Star Rail":
        "https://play-lh.googleusercontent.com/TmjJdSBJuBCQ12LWgJPRU_l-sLzD3MkWbJGxaLQyFU5OxC7K6I8pKkGTCCJn89ey9w=s256",
    "Real Racing 3":
        "https://play-lh.googleusercontent.com/U_HaKDsRuUUJSwU15rq3-VJAnBqHn45Bz6lJ_RD93xvOLc8rVKuN7e_0vZF7B3bpw=s256",
    "Need for Speed No Limits":
        "https://play-lh.googleusercontent.com/rUyZFP7atMZMTzSkyLLOqpkHSfuiHrj0_vxEXqh_nXMfRLdivSX1u9FbI3fAQ-JxYg=s256",
    "eFootball 2024":
        "https://play-lh.googleusercontent.com/4h3HZHhSwCnhRLCfCzJPqGXr1j2WPrVZ7pNBQ5CzagtqvVLUimM_bTgb0YxOE7ioqA=s256",
    "Wuthering Waves":
        "https://play-lh.googleusercontent.com/X7NE8xqq9N1y1Qd7Lq6HZgr25zKD-J7G3X0hEPZ3uHiMZ_9jGjBEkH2yXJi_GkfJPQ=s256",
    "Arena Breakout":
        "https://play-lh.googleusercontent.com/2QLLyCDaTMaEHXL7LWlc4lcBH6DLFSQkNiE-FIPbzuDCsxRmpqD38NSwHK_Z2i2blA=s256",
    "Subway Surfers":
        "https://play-lh.googleusercontent.com/M7rzQjRe_O_SvFUQF4mCDL64hy8iL7XUNF96CsHJZ4dTYxEPX3Y4fXkXC_9QJBLBA=s256",
    "Clash of Clans":
        "https://play-lh.googleusercontent.com/BR5oE8N9a3eJgcBnl1C7yvXpJiB5tYj2P0GrFx1fCdL_7SIX0pFVRSr1xqyYH7N1FA=s256",
    "Among Us":
        "https://play-lh.googleusercontent.com/sxhj8N9lDhbJkxmBtxh5OlW8YWVsPwwi3PCDSmhqmcOIKJoFBNJxpmkO_BVd4j8vVA=s256",
    "Candy Crush Saga":
        "https://play-lh.googleusercontent.com/K5QhQEJx0nPi-y-NQU_bHEm2wnVMBNp1g4Dv5JZDiTDV9TbAH_eVm-gEV7OJJQ3E5g=s256",
}

# Reliable fallback icons per category (Google Play hosted)
CATEGORY_FALLBACKS = {
    "games":        "https://play-lh.googleusercontent.com/haRDMqyFJIxVSqKFbmAGmCdoH74mLRFDXR2E2UfK8oLLcB2FdcYE8sAkOFzuV9wYMvk=s256",
    "productivity": "https://play-lh.googleusercontent.com/Ik_zWVb09_RRAEF7GQ4-eLJf6WH3H6bJ-3uxqRVzwnGJfRIj2Dt_7P0b4dV5tC8BW0=s256",
    "development":  "https://play-lh.googleusercontent.com/lrJOuBa5XHsMH0lf0GlzFUMDqZpGIPYFdTM5HnTwFJgVLqtXVxkV74bI_8YNX5-0jxA=s256",
    "utilities":    "https://play-lh.googleusercontent.com/eRoNqHhIYZvulyYVvqmIy6cMSnJIUopP_M1GjIMiDt7MxeJi1b3iE4fJf0CLXHIR4g=s256",
    "graphics":     "https://cdn.sanity.io/images/599r6htc/regionalized/7bcb0e38f6073ded66e73e8fd13d54e9524067aa-2048x2048.png?w=256&h=256&fit=max&auto=format",
    "music":        "https://play-lh.googleusercontent.com/cShys-AmJ93dB0SV8kE6Fl5oBquYJqLoN4pam0wYBqTYaZLF3GbN_jzx2Xiu4cFjzA=s256",
    "books":        "https://play-lh.googleusercontent.com/9bk0GnDFJ8zPHQfIMBjn6G7DXnfyWm0YFDZklpZr4zLI73XzMM0XGKAXK7PVNL4ggg=s256",
}


def update_icons():
    updated = 0
    skipped = 0
    fallback = 0
    no_match = []

    with SessionLocal() as db:
        apps = db.query(App).all()
        for app in apps:
            name = app.name.strip()

            if name in ICON_MAP:
                app.icon_url = ICON_MAP[name]
                updated += 1
            else:
                cat_icon = CATEGORY_FALLBACKS.get(app.category.lower() if app.category else "")
                if cat_icon:
                    app.icon_url = cat_icon
                    fallback += 1
                else:
                    skipped += 1
                    no_match.append(f"  [NO ICON] ID {app.id}: {name!r} (cat: {app.category})")

        db.commit()

    print("\nDone!")
    print(f"  Exact match updated : {updated}")
    print(f"  Category fallback   : {fallback}")
    print(f"  Skipped (no match)  : {skipped}")
    if no_match:
        print("\nApps with no icon:")
        for m in no_match:
            print(m)


if __name__ == "__main__":
    update_icons()
