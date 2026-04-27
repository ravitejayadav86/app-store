import re
import urllib.request
import urllib.parse
import json
import time

filepath = "src/data/teluguMovies.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

pattern = re.compile(r'(title:\s*"([^"]+)",[\s\S]*?audioUrl:\s*)"([^"]+)"')

def repl(m):
    prefix = m.group(1)
    song_title = m.group(2)
    old_url = m.group(3)
    
    if "itunes.apple.com" in old_url:
        return m.group(0)
        
    clean_title = re.sub(r'\(.*?\)', '', song_title).strip()
    query = clean_title + " telugu"
    encoded = urllib.parse.quote_plus(query)
    url = f"https://itunes.apple.com/search?term={encoded}&media=music&limit=1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5).read()
        data = json.loads(res)
        if data['results'] and 'previewUrl' in data['results'][0]:
            preview = data['results'][0]['previewUrl']
            print(f"Found: {song_title}")
            return f'{prefix}"{preview}"'
    except Exception as e:
        pass
        
    print(f"Missed: {song_title}")
    return m.group(0)

new_content = pattern.sub(repl, content)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)
print("Done")
