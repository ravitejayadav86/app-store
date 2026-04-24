from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import models
from pydantic import BaseModel
import re

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    links: list[dict]

def get_app_links(query_result):
    links = []
    for r in query_result:
        url = f"/apps/{r.id}"
        if r.category == "Games": url = f"/game/{r.id}"
        elif r.category == "Music": url = f"/music"
        elif r.category == "Books": url = f"/books"
        links.append({"text": r.name, "url": url})
    return links

@router.post("/ask", response_model=ChatResponse)
def ask_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    msg = req.message.lower()
    
    # Advanced intent matching
    if any(w in msg for w in ["hello", "hi", "hey", "greetings"]):
        return ChatResponse(
            reply="Hello! I'm Panda AI, your personal guide to the PandaStore universe. I can help you discover amazing apps, troubleshoot issues, or show you how to publish your own creations. What's on your mind?",
            links=[{"text": "Explore Apps", "url": "/apps"}, {"text": "Discover Games", "url": "/games"}]
        )

    if any(w in msg for w in ["publish", "upload", "create", "developer", "submit", "make an app"]):
        return ChatResponse(
            reply="Awesome! PandaStore loves creators. To share your work with the world, head over to the Publisher Portal. You can upload Apps, Games, Music, and Books directly. We even support external URLs for web apps!",
            links=[{"text": "Go to Publisher Portal", "url": "/publisher"}, {"text": "View Your Profile", "url": "/profile"}]
        )

    if any(w in msg for w in ["help", "support", "contact", "admin", "issue", "bug", "broken", "fix"]):
        return ChatResponse(
            reply="I'm here to help! If you're experiencing issues or need guidance, you can visit our Support Hub or ask the community. Our admins are also actively monitoring the platform.",
            links=[{"text": "Support Hub", "url": "/support"}, {"text": "Community Discussions", "url": "/community"}]
        )
        
    if any(w in msg for w in ["message", "chat", "dm", "inbox"]):
        return ChatResponse(
            reply="Want to connect with others? Your inbox is fully end-to-end encrypted. You can chat securely with any other user on PandaStore.",
            links=[{"text": "Open Messages", "url": "/messages"}, {"text": "Find People", "url": "/community"}]
        )

    if any(w in msg for w in ["settings", "profile", "account", "password", "theme", "dark mode"]):
        return ChatResponse(
            reply="You can customize your PandaStore experience in the Settings panel. From there, you can change your avatar, update your bio, toggle dark mode, and manage security.",
            links=[{"text": "Account Settings", "url": "/settings"}, {"text": "View Profile", "url": "/profile"}]
        )

    if any(w in msg for w in ["what is pandastore", "about", "who are you"]):
        return ChatResponse(
            reply="PandaStore is the ultimate digital marketplace and social hub! It's not just an app store—it's a community where you can discover games, listen to music, read books, and connect with developers directly. And I'm Panda AI, the intelligence powering your experience here.",
            links=[{"text": "Discover Trending", "url": "/discover"}, {"text": "Community", "url": "/community"}]
        )

    # Categories Search
    category = None
    if any(w in msg for w in ["game", "games", "play", "racing", "action", "puzzle", "rpg", "shooter"]):
        category = "Games"
    elif any(w in msg for w in ["music", "song", "audio", "track", "beat", "album", "listen"]):
        category = "Music"
    elif any(w in msg for w in ["book", "read", "novel", "ebook", "story", "literature"]):
        category = "Books"
    elif any(w in msg for w in ["app", "productivity", "tool", "utility", "social", "software"]):
        category = "Productivity" 

    if category or any(w in msg for w in ["find", "search", "show", "looking", "want"]):
        query = db.query(models.App).filter(models.App.status == 'published')
        
        if category:
            if category == "Productivity":
                query = query.filter(models.App.category.notin_(["Games", "Music", "Books"]))
            else:
                query = query.filter(models.App.category == category)
                
        # Basic keyword extraction
        stop_words = ["find", "show", "search", "best", "good", "some", "the", "that", "this", "me", "a", "an", "for", "with", "want", "looking"]
        words = [w for w in re.findall(r'\w+', msg) if len(w) > 2 and w not in stop_words]
        
        for w in words:
            query = query.filter(
                (models.App.name.ilike(f"%{w}%")) |
                (models.App.description.ilike(f"%{w}%")) |
                (models.App.category.ilike(f"%{w}%"))
            )
            
        results = query.limit(4).all()
        
        if results:
            reply = f"I found some fantastic options matching your request! Here are the top {len(results)} results from the store:"
            return ChatResponse(reply=reply, links=get_app_links(results))
        else:
            if category:
                fallback = db.query(models.App).filter(models.App.status == 'published')
                if category == "Productivity":
                    fallback = fallback.filter(models.App.category.notin_(["Games", "Music", "Books"]))
                else:
                    fallback = fallback.filter(models.App.category == category)
                    
                fallback_results = fallback.limit(3).all()
                if fallback_results:
                    reply = f"I couldn't find exact matches for those specific words, but here are some of the most popular {category} on PandaStore right now:"
                    return ChatResponse(reply=reply, links=get_app_links(fallback_results))
                else:
                    return ChatResponse(reply=f"I'm sorry, our shelves for {category} are currently empty. Check back later!", links=[])
            else:
                return ChatResponse(
                    reply="I couldn't find any specific items matching your request. Try searching for a broader category like 'action games', 'productivity apps', or 'electronic music'!",
                    links=[{"text": "Browse All Categories", "url": "/discover"}]
                )

    return ChatResponse(
        reply="I'm not quite sure how to help with that specific request. I can help you find apps, games, music, or books, and I can guide you through using PandaStore's features like publishing or messaging.",
        links=[{"text": "Discover Apps", "url": "/discover"}, {"text": "Support", "url": "/support"}]
    )
