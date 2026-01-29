FROM python:3.12-slim

WORKDIR /app

# deps system (souvent utiles pour lxml)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

COPY . /app

# requirements (si tu en as un)
# sinon on installe direct scrapy + pymongo + dotenv
RUN pip install --no-cache-dir scrapy pymongo python-dotenv

CMD ["python", "-m", "scrapy", "list"]

