import asyncio
from database import engine, SessionLocal
from models import App
from sqlalchemy.orm import Session
import json

app_data = [
    {
        "name": "WhatsApp Messenger",
        "description": "Simple. Reliable. Private.",
        "category": "Utilities",
        "developer": "WhatsApp LLC",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
    },
    {
        "name": "Instagram",
        "description": "Bring you closer to the people and things you love.",
        "category": "Productivity",
        "developer": "Instagram",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
    },
    {
        "name": "Subway Surfers",
        "description": "Dash as fast as you can! Dodge the oncoming trains!",
        "category": "Games",
        "developer": "SYBO Games",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/en/2/23/Subway_Surfers_icon.png"
    },
    {
        "name": "Spotify: Music and Podcasts",
        "description": "Listen to your favorite music and podcasts.",
        "category": "Productivity", # changed from music to productivity so it shows up in main store
        "developer": "Spotify AB",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg"
    },
    {
        "name": "Netflix",
        "description": "Watch TV shows and movies recommended just for you.",
        "category": "Productivity",
        "developer": "Netflix, Inc.",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
    },
    {
        "name": "Clash of Clans",
        "description": "Epic combat strategy game. Build your village, train your troops & go to battle!",
        "category": "Games",
        "developer": "Supercell",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/en/9/91/Clash_of_Clans_icon.png"
    },
    {
        "name": "TikTok",
        "description": "TikTok is THE destination for mobile videos.",
        "category": "Productivity",
        "developer": "TikTok Pte. Ltd.",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg"
    },
    {
        "name": "Candy Crush Saga",
        "description": "Play this sweet match 3 puzzle game!",
        "category": "Games",
        "developer": "King",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/en/e/e0/Candy_Crush_Saga_icon.png"
    },
    {
        "name": "Duolingo: Language Lessons",
        "description": "Learn English, Spanish, French, German, Italian, and more languages for free.",
        "category": "Development",
        "developer": "Duolingo",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Duolingo_logo_%282019%29.svg"
    },
    {
        "name": "Among Us",
        "description": "Join your crewmates in a multiplayer game of teamwork and betrayal!",
        "category": "Games",
        "developer": "Innersloth LLC",
        "price": 0.0,
        "icon_url": "https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg"
    }
]

def seed_db():
    with SessionLocal() as db:
        # We can either delete all apps or just add new ones
        for data in app_data:
            # Check if app exists
            existing_app = db.query(App).filter(App.name == data["name"]).first()
            if existing_app:
                existing_app.icon_url = data["icon_url"]
                existing_app.category = data["category"]
            else:
                new_app = App(
                    name=data["name"],
                    description=data["description"],
                    category=data["category"],
                    developer=data["developer"],
                    price=data["price"],
                    icon_url=data["icon_url"],
                    is_approved=True,
                    is_active=True
                )
                db.add(new_app)
        db.commit()
        print("Database seeded with Play Store apps!")

if __name__ == "__main__":
    seed_db()
