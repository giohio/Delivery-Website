from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv
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
from routes import register_routes

load_dotenv(override=True)
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "change_me")
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(orders_bp)
app.register_blueprint(deliveries_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(wallets_bp)
app.register_blueprint(ratings_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(merchant_bp)
app.register_blueprint(admin_bp)  

# Register health and db check routes
register_routes(app)

if __name__ == "__main__":
    port_value = os.getenv("PORT")
    try:
        port = int(port_value) if port_value else 5000
    except ValueError:
        port = 5000
    app.run(port=port, debug=True)
