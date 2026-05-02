from database import SessionLocal
from models import App

# Mapping of correct icons
CORRECT_MAPPING = {
    "WhatsApp Messenger": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    "Instagram": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg",
    "Facebook": "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg",
    "Messenger": "https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg",
    "TikTok": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    "Telegram": "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg",
    "Snapchat": "https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg",
    "YouTube": "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    "Netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    "Spotify: Music and Podcasts": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    "Subway Surfers": "https://upload.wikimedia.org/wikipedia/en/2/23/Subway_Surfers_icon.png",
    "Candy Crush Saga": "https://upload.wikimedia.org/wikipedia/en/e/e0/Candy_Crush_Saga_icon.png",
    "PUBG MOBILE": "https://upload.wikimedia.org/wikipedia/en/3/30/PUBG_Mobile_logo.png",
    "Free Fire": "https://upload.wikimedia.org/wikipedia/en/a/a2/Free_Fire_logo.png",
    "Roblox": "https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon.svg",
    "Among Us": "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg",
    "Clash of Clans": "https://upload.wikimedia.org/wikipedia/en/9/91/Clash_of_Clans_icon.png",
    "Genshin Impact": "https://upload.wikimedia.org/wikipedia/en/5/5d/Genshin_Impact_logo.png",
    "Duolingo: Language Lessons": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Duolingo_logo_%282019%29.svg",
    "LinkedIn": "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    "Amazon Shopping": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    "Reddit": "https://upload.wikimedia.org/wikipedia/en/b/bd/Reddit_logo_2023.svg"
}

def cleanup():
    with SessionLocal() as db:
        apps = db.query(App).all()
        for app in apps:
            found = False
            for name, icon in CORRECT_MAPPING.items():
                if name.lower() in app.name.lower():
                    app.icon_url = icon
                    found = True
                    break
            if not found:
                # Revert to generated icon or None
                app.icon_url = f"https://ui-avatars.com/api/?name={app.name.replace(' ', '+')}&background=random&color=fff&size=256"
        db.commit()
        print("Cleaned up mismatched icons and kept only the correct ones.")

if __name__ == "__main__":
    cleanup()
