import os
import re
import json
import scrapy
from dotenv import load_dotenv

load_dotenv()

def clean_text(x: str) -> str:
    return re.sub(r"\s+", " ", (x or "")).strip()

class Movies2025Spider(scrapy.Spider):
    name = "movies_2025"
    allowed_domains = ["editorial.rottentomatoes.com", "rottentomatoes.com"]

    def start_requests(self):
        seed = os.getenv(
            "SEED_URL",
            "https://editorial.rottentomatoes.com/guide/best-2025-movies-every-certified-fresh/"
        )
        yield scrapy.Request(seed, callback=self.parse_seed)

    def parse_seed(self, response):
        links = set()

        for href in response.css("a::attr(href)").getall():
            if href and "/m/" in href and "rottentomatoes.com" in href:
                links.add(response.urljoin(href))
            elif href and href.startswith("/m/"):
                links.add("https://www.rottentomatoes.com" + href)

        links = sorted(list(links))
        self.logger.info(f"Seed: found {len(links)} movie links")

        max_movies = int(os.getenv("MAX_MOVIES", "30"))
        for url in links[:max_movies]:
            yield scrapy.Request(url, callback=self.parse_movie)

    def parse_movie(self, response):
        url = response.url

        # ---- title (reliable) ----
        raw_title = (
            response.css("meta[property='og:title']::attr(content)").get()
            or response.css("title::text").get()
        )
        title = clean_text(raw_title)
        if title and "|" in title:
            title = clean_text(title.split("|")[0])

        # ---- scores from JSON-LD (best-effort) ----
        tomatometer = None
        audience = None

        def to_int(x):
            try:
                return int(x)
            except Exception:
                return None

        ld_scripts = response.css('script[type="application/ld+json"]::text').getall()
        for s in ld_scripts:
            s = (s or "").strip()
            if not s:
                continue
            try:
                data = json.loads(s)
            except Exception:
                continue

            nodes = data if isinstance(data, list) else [data]
            for node in nodes:
                if not isinstance(node, dict):
                    continue
                ar = node.get("aggregateRating")
                if isinstance(ar, dict) and tomatometer is None:
                    tomatometer = to_int(ar.get("ratingValue"))

        # ---- Audience score (Popcornmeter) from embedded JSON ----
        if audience is None:
            m = re.search(r'"audienceScore"\s*:\s*\{.*?"score"\s*:\s*"?(\d{1,3})"?', response.text, flags=re.DOTALL)
            if m:
                audience = to_int(m.group(1))



        yield {
            "title": title or None,
            "url": url,
            "tomatometer": tomatometer,
            "audience_score": audience,
            "year_target": 2025,
            "audience_score": audience,
            "source": "rottentomatoes",
        }

