from flask import Flask, jsonify, send_from_directory
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
from routes.user import user_bp
from routes.courier import courier_bp
from routes.upload import upload_bp
from routes.coupons import coupons_bp
from routes.payment_webhook import payment_webhook_bp
from routes.api_keys import api_keys_bp
from routes.external_api import external_api_bp
from routes import register_routes

load_dotenv(override=True)
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "change_me")
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

app.register_blueprint(auth_bp)
app.register_blueprint(orders_bp)
app.register_blueprint(deliveries_bp)
app.register_blueprint(payments_bp)
app.register_blueprint(wallets_bp)
app.register_blueprint(ratings_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(merchant_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(user_bp)
app.register_blueprint(courier_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(coupons_bp, url_prefix='/api')
app.register_blueprint(payment_webhook_bp, url_prefix='/api')
app.register_blueprint(api_keys_bp)
app.register_blueprint(external_api_bp)

# Register health and db check routes
register_routes(app)

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def serve_upload(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    port_value = os.getenv("PORT")
    try:
        port = int(port_value) if port_value else 5000
    except ValueError:
        port = 5000
    app.run(port=port, debug=True)
