import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

class MongoPipeline:
    def open_spider(self, spider):
        uri = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017")
        db_name = os.getenv("MONGODB_DB", "rt2025")
        col_name = os.getenv("MONGODB_COLLECTION", "movies")

        self.client = MongoClient(uri)
        self.db = self.client[db_name]
        self.col = self.db[col_name]
        self.col.create_index("url", unique=True)

        spider.logger.info(f"[Mongo] connected: db={db_name} col={col_name}")

    def close_spider(self, spider):
        if hasattr(self, "client"):
            self.client.close()

    def process_item(self, item, spider):
        doc = dict(item)

        # Upsert by url (avoid duplicates)
        if doc.get("url"):
            self.col.update_one({"url": doc["url"]}, {"$set": doc}, upsert=True)
        else:
            self.col.insert_one(doc)

        return item

