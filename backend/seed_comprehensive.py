from database import SessionLocal
from models import App
import random

real_icons = [
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg",
    "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    "https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/f3/Zoom_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg",
    "https://upload.wikimedia.org/wikipedia/commons/6/6b/Discord_logo_white.svg",
    "https://upload.wikimedia.org/wikipedia/en/2/23/Subway_Surfers_icon.png",
    "https://upload.wikimedia.org/wikipedia/en/e/e0/Candy_Crush_Saga_icon.png",
    "https://upload.wikimedia.org/wikipedia/en/3/30/PUBG_Mobile_logo.png",
    "https://upload.wikimedia.org/wikipedia/en/a/a2/Free_Fire_logo.png",
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon.svg",
    "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
    "https://upload.wikimedia.org/wikipedia/en/9/91/Clash_of_Clans_icon.png",
    "https://upload.wikimedia.org/wikipedia/en/5/5d/Genshin_Impact_logo.png",
    "https://upload.wikimedia.org/wikipedia/commons/1/1b/Duolingo_logo_%282019%29.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    "https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png",
    "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png",
    "https://upload.wikimedia.org/wikipedia/en/b/bd/Reddit_logo_2023.svg",
    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
]

def update_icons():
    with SessionLocal() as db:
        apps = db.query(App).all()
        for app in apps:
            # Assign a random real icon
            app.icon_url = random.choice(real_icons)
            # Also update name/developer to something real if it looks generic (optional)
            # But let's just do icons for now as requested.
        db.commit()
        print(f"Updated icons for {len(apps)} apps!")

if __name__ == "__main__":
    update_icons()
