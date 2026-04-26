from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, func
from database import get_db
import models
from pydantic import BaseModel
import re
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    reply: str
    links: list[dict]

# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_app_links(apps, max_results: int = 5) -> list[dict]:
    links = []
    for a in apps[:max_results]:
        cat = (a.category or "").lower()
        if cat == "games":
            url = f"/games/{a.id}"
        elif cat == "music":
            url = f"/music/{a.id}"
        elif cat == "books":
            url = f"/books/{a.id}"
        else:
            url = f"/apps/{a.id}"
        links.append({"text": a.name, "url": url})
    return links

STOP_WORDS = {
    "find", "show", "search", "best", "good", "some", "the", "that", "this",
    "me", "a", "an", "for", "with", "want", "looking", "give", "list", "get",
    "any", "all", "can", "you", "have", "are", "what", "how", "do", "does",
    "please", "i", "is", "there", "in", "on", "at", "of", "to",
}

def keyword_filter(msg: str) -> list[str]:
    return [w for w in re.findall(r'\w+', msg.lower()) if len(w) > 2 and w not in STOP_WORDS]

def search_apps(db: Session, keywords: list[str] = None, category: str = None,
                sort_by: str = "downloads", limit: int = 5):
    """Search published apps with optional keyword and category filters."""
    q = db.query(models.App).filter(models.App.is_approved == True, models.App.is_active == True)

    if category:
        if category == "__not_games_music_books__":
            q = q.filter(models.App.category.notin_(["Games", "Music", "Books"]))
        else:
            q = q.filter(func.lower(models.App.category) == category.lower())

    if keywords:
        from sqlalchemy import or_
        conditions = []
        for kw in keywords[:4]:  # limit to 4 keywords to avoid over-filtering
            conditions.append(models.App.name.ilike(f"%{kw}%"))
            conditions.append(models.App.description.ilike(f"%{kw}%"))
            conditions.append(models.App.developer.ilike(f"%{kw}%"))
        q = q.filter(or_(*conditions))

    if sort_by == "price_asc":
        q = q.order_by(models.App.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(models.App.price.desc())
    elif sort_by == "newest":
        q = q.order_by(models.App.created_at.desc())
    else:
        # Default: most downloaded
        download_sub = (
            db.query(models.Purchase.app_id, func.count(models.Purchase.id).label("dl_count"))
            .group_by(models.Purchase.app_id)
            .subquery()
        )
        q = q.outerjoin(download_sub, models.App.id == download_sub.c.app_id)
        q = q.order_by(func.coalesce(download_sub.c.dl_count, 0).desc())

    return q.limit(limit).all()


def nav_links(pages: list[tuple[str, str]]) -> list[dict]:
    return [{"text": t, "url": u} for t, u in pages]


# ─── Intent handlers ─────────────────────────────────────────────────────────

def handle_greeting(msg: str):
    return {
        "reply": (
            "Hey there! 👋 I'm **Panda AI**, your intelligent guide to PandaStore. "
            "I can help you:\n"
            "• 🔍 Discover apps, games, music & books\n"
            "• 🚀 Publish and manage your own creations\n"
            "• 💬 Navigate the community and messages\n"
            "• ⚙️ Configure your account settings\n\n"
            "What can I help you with today?"
        ),
        "links": nav_links([("Explore Apps", "/discover"), ("Trending Games", "/games")])
    }


def handle_about(msg: str):
    return {
        "reply": (
            "**PandaStore** is a next-gen digital marketplace and social platform!\n\n"
            "🏪 **Store** — Download apps, games, music, and books\n"
            "👥 **Community** — Follow creators, send messages, join discussions\n"
            "🚀 **Publisher Portal** — Ship your own apps and content to millions\n"
            "🐼 **Panda AI** — That's me! I'm built to help you get the most out of PandaStore.\n\n"
            "Everything is in one place — no subscriptions needed to explore!"
        ),
        "links": nav_links([("Discover Now", "/discover"), ("Publisher Portal", "/publisher")])
    }


def handle_publish(msg: str):
    steps = []
    if "how" in msg or "start" in msg or "begin" in msg:
        steps = (
            "Here's how to publish on PandaStore:\n\n"
            "1️⃣ Go to the **Publisher Portal**\n"
            "2️⃣ Click **New Upload** and choose your category\n"
            "3️⃣ Fill in details: name, description, icon, screenshots\n"
            "4️⃣ Upload your file (APK, ZIP, MP3, PDF, or URL)\n"
            "5️⃣ Submit for review — our team approves within 24h\n\n"
            "We support files up to **10 GB**! 🎉"
        )
    else:
        steps = (
            "Ready to go live? Head to the **Publisher Portal** where you can upload "
            "Apps, Games, Music, and Books. Large files up to 10GB are fully supported!"
        )
    return {
        "reply": steps,
        "links": nav_links([("Publisher Portal", "/publisher"), ("My Published Apps", "/publisher/my-apps")])
    }


def handle_pricing(msg: str):
    return {
        "reply": (
            "💰 **PandaStore Pricing:**\n\n"
            "• **Free apps** — Download instantly, no cost\n"
            "• **Paid apps** — Set your own price when publishing\n"
            "• **Publishing** — Always free for creators\n\n"
            "You can filter search results by price. Want me to show you free apps in a specific category?"
        ),
        "links": nav_links([("Browse Free Apps", "/discover"), ("Paid Games", "/games")])
    }


def handle_account(msg: str):
    if any(w in msg for w in ["password", "reset", "forgot"]):
        reply = "You can reset your password from the **Settings** page under Security. If you signed in with Google or GitHub, your password is managed by that provider."
        links = nav_links([("Account Settings", "/settings")])
    elif any(w in msg for w in ["avatar", "photo", "picture", "profile picture"]):
        reply = "You can update your profile picture from your **Profile** page. Click the avatar to upload a new image!"
        links = nav_links([("My Profile", "/profile")])
    elif any(w in msg for w in ["delete", "deactivate"]):
        reply = "To delete or deactivate your account, please visit Settings > Account or reach out to support."
        links = nav_links([("Settings", "/settings"), ("Support", "/support")])
    elif any(w in msg for w in ["bio", "username", "name"]):
        reply = "You can update your bio and username from your profile page. Click **Edit Profile** to make changes."
        links = nav_links([("Edit Profile", "/profile")])
    else:
        reply = "Your account settings are all in one place — theme, avatar, bio, security and more. What would you like to change?"
        links = nav_links([("Account Settings", "/settings"), ("My Profile", "/profile")])
    return {"reply": reply, "links": links}


def handle_theme(msg: str):
    return {
        "reply": (
            "🌙 PandaStore supports **Light** and **Dark** modes!\n\n"
            "Toggle your theme in **Settings → Appearance**. "
            "The app also respects your system preference by default."
        ),
        "links": nav_links([("Settings", "/settings")])
    }


def handle_messages(msg: str):
    return {
        "reply": (
            "💬 PandaStore messages are **end-to-end encrypted**.\n\n"
            "• Send text messages to any user\n"
            "• Share images, videos, and files up to 500MB\n"
            "• Real-time delivery with read receipts ✓✓\n"
            "• Get notified instantly when someone messages you\n\n"
            "Find people in the Community Hub or search by username!"
        ),
        "links": nav_links([("Open Messages", "/messages"), ("Find People", "/community")])
    }


def handle_community(msg: str):
    return {
        "reply": (
            "🌍 The **Community Hub** is where PandaStore comes alive!\n\n"
            "• Follow creators and see their latest uploads\n"
            "• Like and review apps\n"
            "• Send direct messages to anyone\n"
            "• Discover trending developers\n\n"
            "It's the best way to stay connected to what's happening on the platform."
        ),
        "links": nav_links([("Community Hub", "/community"), ("Messages", "/messages")])
    }


def handle_support(msg: str):
    if any(w in msg for w in ["bug", "broken", "crash", "error", "not working"]):
        reply = (
            "Sorry to hear something's not working! 😟 Here's what you can do:\n\n"
            "1. Try refreshing the page\n"
            "2. Clear your browser cache\n"
            "3. Check your internet connection\n"
            "4. Submit a bug report via the **Support Hub**\n\n"
            "Our team is actively monitoring and will respond quickly!"
        )
    else:
        reply = (
            "I'm here to help! 🐼 You can:\n\n"
            "• Browse the **Support Hub** for FAQs\n"
            "• Ask a question in the **Community**\n"
            "• Contact our admin team directly\n\n"
            "What specific issue are you experiencing?"
        )
    return {
        "reply": reply,
        "links": nav_links([("Support Hub", "/support"), ("Community", "/community")])
    }


def handle_reviews(msg: str):
    return {
        "reply": (
            "⭐ **Reviews & Ratings on PandaStore:**\n\n"
            "• Leave a star rating (1-5) on any app page\n"
            "• Write a detailed review to help others decide\n"
            "• Reviews are visible to everyone\n"
            "• Developers can see and respond to feedback\n\n"
            "Your honest reviews help the community! Find an app and scroll to the Reviews section."
        ),
        "links": nav_links([("Discover Apps", "/discover")])
    }


def handle_download(msg: str):
    return {
        "reply": (
            "📥 **Downloading from PandaStore:**\n\n"
            "• Tap the **Get** or **Download** button on any app page\n"
            "• Free apps download instantly\n"
            "• Paid apps require completing the purchase first\n"
            "• Your downloads are saved in **Library → Downloads**\n\n"
            "All your past downloads are always accessible!"
        ),
        "links": nav_links([("My Library", "/library"), ("Discover", "/discover")])
    }


def handle_notifications(msg: str):
    return {
        "reply": (
            "🔔 **PandaStore Notifications:**\n\n"
            "• New messages from other users\n"
            "• App approval status from the admin team\n"
            "• New followers and community activity\n"
            "• Real-time updates — no refresh needed!\n\n"
            "Notifications appear as a bell icon in the top bar. Make sure to allow browser notifications for instant alerts even when the tab is in the background!"
        ),
        "links": nav_links([("Settings", "/settings")])
    }


def handle_search(msg: str, db: Session):
    """Generic search when we can't determine a category."""
    keywords = keyword_filter(msg)
    results = search_apps(db, keywords=keywords, limit=5)
    if results:
        return {
            "reply": f"I found **{len(results)} result(s)** matching your search! Here they are:",
            "links": get_app_links(results)
        }
    return {
        "reply": "I couldn't find anything matching that exactly. Try a broader term like 'action game', 'music player', or 'book reader'!",
        "links": nav_links([("Browse Everything", "/discover")])
    }


# ─── Main router ──────────────────────────────────────────────────────────────

@router.post("/ask", response_model=ChatResponse)
def ask_copilot(req: ChatRequest, db: Session = Depends(get_db)):
    msg = req.message.strip().lower()
    original = req.message.strip()
    ctx = req.context.lower()

    # ── Greetings ──────────────────────────────────────────────────────────
    if any(w in msg for w in ["hello", "hi", "hey", "greetings", "good morning",
                               "good evening", "good afternoon", "what's up", "howdy"]):
        r = handle_greeting(msg)
        return ChatResponse(**r)

    # ── About / What is PandaStore ──────────────────────────────────────────
    if any(p in msg for p in ["what is pandastore", "about pandastore", "tell me about",
                               "who are you", "what can you do", "what do you do"]):
        r = handle_about(msg)
        return ChatResponse(**r)

    # ── Publishing ──────────────────────────────────────────────────────────
    if any(w in msg for w in ["publish", "upload", "submit", "developer", "create app",
                               "make app", "release", "deploy", "launch", "ship"]):
        r = handle_publish(msg)
        return ChatResponse(**r)

    # ── Pricing / Cost / Free ───────────────────────────────────────────────
    if any(w in msg for w in ["price", "cost", "free", "paid", "payment", "cheap",
                               "expensive", "buy", "purchase", "money", "dollars"]):
        r = handle_pricing(msg)
        return ChatResponse(**r)

    # ── Account / Profile ───────────────────────────────────────────────────
    if any(w in msg for w in ["account", "profile", "password", "email", "username",
                               "avatar", "bio", "delete", "deactivate", "photo"]):
        r = handle_account(msg)
        return ChatResponse(**r)

    # ── Theme / Appearance ──────────────────────────────────────────────────
    if any(w in msg for w in ["theme", "dark mode", "light mode", "dark", "appearance",
                               "color scheme", "toggle"]):
        r = handle_theme(msg)
        return ChatResponse(**r)

    # ── Settings ────────────────────────────────────────────────────────────
    if any(w in msg for w in ["settings", "preference", "configure", "customise", "customize"]):
        return ChatResponse(
            reply="Everything about your account lives in Settings — theme, security, notifications, profile info, and more. What would you like to change?",
            links=nav_links([("Settings", "/settings"), ("Profile", "/profile")])
        )

    # ── Messaging ───────────────────────────────────────────────────────────
    if any(w in msg for w in ["message", "chat", "dm", "inbox", "send message",
                               "direct message", "talk to", "contact"]):
        r = handle_messages(msg)
        return ChatResponse(**r)

    # ── Community / Follow / Social ─────────────────────────────────────────
    if any(w in msg for w in ["community", "follow", "followers", "social", "hub",
                               "discussion", "network", "people", "users", "creator"]):
        r = handle_community(msg)
        return ChatResponse(**r)

    # ── Support / Help / Bug ────────────────────────────────────────────────
    if any(w in msg for w in ["help", "support", "contact", "admin", "issue", "bug",
                               "broken", "fix", "not working", "crash", "problem", "error"]):
        r = handle_support(msg)
        return ChatResponse(**r)

    # ── Reviews ─────────────────────────────────────────────────────────────
    if any(w in msg for w in ["review", "rating", "rate", "feedback", "stars",
                               "comment", "opinion"]):
        r = handle_reviews(msg)
        return ChatResponse(**r)

    # ── Downloads / Library ─────────────────────────────────────────────────
    if any(w in msg for w in ["download", "library", "my apps", "installed",
                               "purchases", "bought"]):
        r = handle_download(msg)
        return ChatResponse(**r)

    # ── Notifications ───────────────────────────────────────────────────────
    if any(w in msg for w in ["notification", "notify", "alert", "bell", "push"]):
        r = handle_notifications(msg)
        return ChatResponse(**r)

    # ── Login / Sign up / Auth ──────────────────────────────────────────────
    if any(w in msg for w in ["login", "sign in", "signin", "sign up", "signup",
                               "register", "log in", "logout", "log out", "google",
                               "github", "oauth"]):
        return ChatResponse(
            reply=(
                "🔐 **PandaStore Authentication:**\n\n"
                "• Sign in with **Google** or **GitHub** — one click, no password needed\n"
                "• Or use classic **email + password** registration\n"
                "• Your session stays active for 7 days automatically\n\n"
                "New here? Creating an account is completely free!"
            ),
            links=nav_links([("Sign In", "/login"), ("Register", "/register")])
        )

    # ── Trending / Popular / Best ────────────────────────────────────────────
    if any(w in msg for w in ["trending", "popular", "top", "best", "featured",
                               "recommended", "hot", "new", "latest", "recent"]):
        sort = "newest" if any(w in msg for w in ["new", "latest", "recent"]) else "downloads"
        results = search_apps(db, sort_by=sort, limit=5)
        cat_hint = "newest" if sort == "newest" else "most downloaded"
        if results:
            return ChatResponse(
                reply=f"🔥 Here are the {cat_hint} apps on PandaStore right now:",
                links=get_app_links(results)
            )
        return ChatResponse(
            reply="The store is warming up! Check back soon for trending content.",
            links=nav_links([("Discover", "/discover")])
        )

    # ── Category-aware search ────────────────────────────────────────────────
    category = None
    sort = "downloads"

    if any(w in msg for w in ["game", "games", "play", "gaming", "racing", "action",
                               "puzzle", "rpg", "shooter", "strategy", "arcade",
                               "adventure", "sport"]):
        category = "Games"
    elif any(w in msg for w in ["music", "song", "songs", "audio", "track", "beat",
                                 "album", "listen", "playlist", "artist", "mp3", "sound"]):
        category = "Music"
    elif any(w in msg for w in ["book", "books", "read", "novel", "ebook", "story",
                                 "literature", "pdf", "epub", "fiction", "non-fiction",
                                 "chapter"]):
        category = "Books"
    elif any(w in msg for w in ["app", "apps", "productivity", "tool", "utility",
                                 "social", "software", "application", "program", "android"]):
        category = "__not_games_music_books__"

    if any(w in msg for w in ["free", "no cost", "zero"]):
        sort = "price_asc"
    elif any(w in msg for w in ["new", "latest", "recent", "newest"]):
        sort = "newest"

    if category or any(w in msg for w in ["find", "search", "show", "looking",
                                           "want", "recommend", "suggest"]):
        keywords = keyword_filter(msg)
        results = search_apps(db, keywords=keywords, category=category, sort_by=sort, limit=5)

        if results:
            cat_label = category if category and category != "__not_games_music_books__" else "apps"
            return ChatResponse(
                reply=f"🎯 Found **{len(results)}** great {cat_label} for you:",
                links=get_app_links(results)
            )
        # Fallback: broaden search
        if category:
            fallback = search_apps(db, category=category, sort_by="downloads", limit=5)
            if fallback:
                cat_label = category if category != "__not_games_music_books__" else "apps"
                return ChatResponse(
                    reply=f"No exact matches, but here are the top {cat_label} on PandaStore:",
                    links=get_app_links(fallback)
                )
            cat_label = category if category != "__not_games_music_books__" else "this category"
            return ChatResponse(
                reply=f"The shelves for {cat_label} are empty right now. Check back soon!",
                links=nav_links([("Discover", "/discover")])
            )

        # Generic search fallback
        r = handle_search(msg, db)
        return ChatResponse(**r)

    # ── Thank you ─────────────────────────────────────────────────────────────
    if any(w in msg for w in ["thanks", "thank you", "thx", "cheers", "awesome", "great"]):
        return ChatResponse(
            reply="You're welcome! 🐼 I'm always here if you need anything else. Enjoy PandaStore!",
            links=nav_links([("Discover Apps", "/discover"), ("Community", "/community")])
        )

    # ── Bye / Exit ────────────────────────────────────────────────────────────
    if any(w in msg for w in ["bye", "goodbye", "see you", "later", "exit", "close"]):
        return ChatResponse(
            reply="See you around! 👋 Come back whenever you need help. Enjoy the store!",
            links=[]
        )

    # ── Generic keyword search as last resort ──────────────────────────────────
    keywords = keyword_filter(msg)
    if keywords:
        results = search_apps(db, keywords=keywords, limit=4)
        if results:
            return ChatResponse(
                reply=f"I searched the store and found **{len(results)} result(s)** that might be relevant:",
                links=get_app_links(results)
            )

    # ── Fallback ─────────────────────────────────────────────────────────────
    return ChatResponse(
        reply=(
            "Hmm, I'm not sure about that one! 🤔 Here are some things I can help with:\n\n"
            "🔍 **Discover** — Find apps, games, music, or books\n"
            "🚀 **Publish** — Upload and manage your own content\n"
            "💬 **Messages** — Chat securely with other users\n"
            "⚙️ **Account** — Settings, profile, theme\n"
            "🐛 **Support** — Report bugs or get help\n\n"
            "Try asking something like: *\"Show me free action games\"* or *\"How do I publish an app?\"*"
        ),
        links=nav_links([("Discover", "/discover"), ("Support", "/support")])
    )
