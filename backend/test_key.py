import os
from google import genai
from dotenv import load_dotenv

load_dotenv()
api_key = "AIzaSyB4mZGENFlI2RkiUavcSw3GhIJD3auDdLs"

client = genai.Client(api_key=api_key)

try:
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents="Hello, respond with 'Success' if you can read this."
    )
    print(f"RESULT: {response.text.strip()}")
except Exception as e:
    print(f"ERROR: {e}")
