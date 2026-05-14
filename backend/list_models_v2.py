import os
from google import genai
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

try:
    print("Listing models...")
    for model in client.models.list():
        print(f"Model Name: {model.name}")
        # print(f"Full Model Info: {model}")
except Exception as e:
    print(f"ERROR: {e}")
