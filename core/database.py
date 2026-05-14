from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "virtual_tryon")

client = MongoClient(MONGO_URL)

# Use the database name from .env
db = client[DB_NAME]

users_collection = db["users"]

print("✅ MongoDB Connected Successfully")