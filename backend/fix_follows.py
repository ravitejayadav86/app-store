from database import SessionLocal
import models

def fix_follows():
    db = SessionLocal()
    try:
        # Update all follows where is_accepted might be NULL or False to True
        # This ensures legacy follows are visible
        follows = db.query(models.Follow).all()
        count = 0
        for f in follows:
            if f.is_accepted is None or f.is_accepted == False:
                f.is_accepted = True
                count += 1
        db.commit()
        print(f"Successfully updated {count} follow records to accepted status.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_follows()
