from database import SessionLocal
from models import App

db = SessionLocal()
apps = db.query(App).all()

placeholder_apps = []
good_apps = []

for app in apps:
    icon = app.icon_url or ""
    if not icon or "ui-avatars" in icon or icon.strip() == "":
        placeholder_apps.append((app.id, app.name, app.category, icon))
    else:
        good_apps.append((app.id, app.name, icon[:60]))

print(f"\n=== GOOD ICONS ({len(good_apps)}) ===")
for aid, name, icon in good_apps:
    print(f"  [{aid}] {name} -> {icon}")

print(f"\n=== PLACEHOLDER / MISSING ICONS ({len(placeholder_apps)}) ===")
for aid, name, cat, icon in placeholder_apps:
    print(f"  [{aid}] {name} (cat:{cat}) -> {icon[:60]}")

print(f"\nTotal: {len(apps)} apps | Good: {len(good_apps)} | Needs fix: {len(placeholder_apps)}")
db.close()
