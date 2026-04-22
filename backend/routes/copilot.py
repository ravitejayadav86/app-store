from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models
from pydantic import BaseModel

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    links: list[dict]

@router.post("/ask", response_model=ChatResponse)
def ask_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    msg = req.message.lower()
    reply = "I'm Panda AI! I can help you find apps, games, music, books, or help you publish your own creations. What are you looking for?"
    links = []

    # Help / Support / Publish
    if any(w in msg for w in ["publish", "upload", "create", "developer", "how to make"]):
        reply = "I can definitely help with that! PandaStore is an open platform for creators. You can upload your Apps, Games, Music, or Books via our Publisher Portal."
        links.append({"text": "Go to Publisher Portal", "url": "/publisher"})
        return ChatResponse(reply=reply, links=links)
        
    if any(w in msg for w in ["help", "support", "contact", "admin", "issue"]):
        reply = "Need assistance? You can check our Support page or ask the community for help."
        links.append({"text": "Support Hub", "url": "/support"})
        links.append({"text": "Community", "url": "/community"})
        return ChatResponse(reply=reply, links=links)

    # Categories Search
    category = None
    if any(w in msg for w in ["game", "games", "play", "racing", "action", "puzzle", "rpg", "shooter"]):
        category = "Games"
    elif any(w in msg for w in ["music", "song", "audio", "track", "beat", "album"]):
        category = "Music"
    elif any(w in msg for w in ["book", "read", "novel", "ebook", "story"]):
        category = "Books"
    elif any(w in msg for w in ["app", "productivity", "tool", "utility", "social"]):
        category = "Productivity" 

    if category or "find" in msg or "search" in msg or "show me" in msg:
        query = db.query(models.App).filter(models.App.status == 'published')
        
        if category:
            if category == "Productivity":
                query = query.filter(models.App.category.notin_(["Games", "Music", "Books"]))
            else:
                query = query.filter(models.App.category == category)
                
        # Basic keyword extraction
        stop_words = ["find", "show", "search", "best", "good", "some", "the", "that", "this", "me", "a", "an", "for", "with"]
        words = [w for w in msg.split() if len(w) > 2 and w not in stop_words]
        
        for w in words:
            query = query.filter(
                (models.App.name.ilike(f"%{w}%")) |
                (models.App.description.ilike(f"%{w}%")) |
                (models.App.category.ilike(f"%{w}%"))
            )
            
        results = query.limit(3).all()
        
        if results:
            reply = f"I found some great options in the store that match what you're looking for! Here are the top {len(results)} results:"
            for r in results:
                url = f"/apps/{r.id}"
                if r.category == "Games": url = f"/game/{r.id}"
                elif r.category == "Music": url = f"/music" # Simple redirect for now
                elif r.category == "Books": url = f"/books"
                links.append({"text": r.name, "url": url})
        else:
            if category:
                # Fallback to top 3 in category
                fallback = db.query(models.App).filter(models.App.status == 'published')
                if category == "Productivity":
                    fallback = fallback.filter(models.App.category.notin_(["Games", "Music", "Books"]))
                else:
                    fallback = fallback.filter(models.App.category == category)
                    
                fallback_results = fallback.limit(3).all()
                if fallback_results:
                    reply = f"I couldn't find exact matches for your words, but here are some of the best {category} we have!"
                    for r in fallback_results:
                        url = f"/apps/{r.id}"
                        if r.category == "Games": url = f"/game/{r.id}"
                        elif r.category == "Music": url = f"/music"
                        elif r.category == "Books": url = f"/books"
                        links.append({"text": r.name, "url": url})
                else:
                    reply = f"I'm sorry, I couldn't find any {category} in the store right now."
            else:
                reply = "I couldn't find any apps matching your exact request. Try searching for a broader category like 'games' or 'music'!"

    return ChatResponse(reply=reply, links=links)
