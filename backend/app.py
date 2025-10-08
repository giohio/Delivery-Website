from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import os
from db import get_db_connection
from routes.auth import auth_bp  # Add this import if register_routes is defined in routes.py
from routes.orders import orders_bp
from routes.deliveries import deliveries_bp
from routes.payments import payments_bp
from routes.wallets import wallets_bp
from routes.ratings import ratings_bp
from routes.notifications import notifications_bp
from routes.merchant import merchant_bp
from routes.admin import admin_bp  

app = Flask(__name__)

app.register_blueprint(auth_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(deliveries_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(wallets_bp)
app.register_blueprint(ratings_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(merchant_bp)
app.register_blueprint(admin_bp)  

if __name__ == "__main__":
    app.run(port=int(os.getenv("PORT", 5000)), debug=True)
