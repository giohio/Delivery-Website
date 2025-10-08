import firebase_admin
from firebase_admin import credentials

# Load your Firebase service account key
# (download JSON from Firebase Console → Project Settings → Service Accounts)
cred = credentials.Certificate("firebase-service-account.json")

# Initialize Firebase app (only once globally)
firebase_admin.initialize_app(cred)
