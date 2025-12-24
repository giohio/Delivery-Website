import firebase_admin
from firebase_admin import credentials
import os
import json
from dotenv import load_dotenv

load_dotenv()
creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
if not creds_json:
    raise RuntimeError("FIREBASE_CREDENTIALS_JSON is not set in environment")
try:
    service_account_info = json.loads(creds_json)
except json.JSONDecodeError as e:
    raise RuntimeError("FIREBASE_CREDENTIALS_JSON is not valid JSON") from e
cred = credentials.Certificate(service_account_info)

# Initialize Firebase app (only once globally)
firebase_admin.initialize_app(cred)
