import urllib.request
import re

def get_poster(url, filename):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req).read().decode('utf-8')
        m = re.search(r'<img[^>]*src="//(upload\.wikimedia\.org/wikipedia/en/thumb/[^"]+)"', html)
        if m:
            img_url = "https://" + m.group(1).replace('/thumb', '').rsplit('/', 1)[0]
            print(f"Downloading {img_url} to {filename}")
            req_img = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_img) as response, open(filename, 'wb') as out_file:
                out_file.write(response.read())
        else:
            print(f"Failed to find poster in {url}")
    except Exception as e:
        print(f"Error processing {url}: {e}")

get_poster('https://en.wikipedia.org/wiki/Tillu_Square', 'public/movies/tillu.jpg')
get_poster('https://en.wikipedia.org/wiki/Game_Changer_(film)', 'public/movies/gamechanger.jpg')
