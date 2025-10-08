from flask import jsonify
from db import get_db_connection
import psycopg2.extras

from .auth import auth_bp

def register_routes(app):

    @app.route("/healthz")
    def healthz():
        return jsonify({"ok": True, "service": "delivery-backend-flask"})

    @app.route("/healthz/db")
    def healthz_db():
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=__import__("psycopg2.extras").extras.RealDictCursor)
            cur.execute("SELECT current_database() AS db, current_schema() AS schema, NOW() AS now;")
            row = cur.fetchone()
            cur.close()
            conn.close()
            return jsonify({"ok": True, "db": row["db"], "schema": row["schema"], "now": row["now"]})
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500
    

    # roles test route (from earlier, optional)

    @app.route("/roles")
    def get_roles():
        try:
            conn = get_db_connection()
            cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute("SELECT * FROM app.roles;")
            rows = cur.fetchall()
            cur.close(); conn.close()
            return jsonify(rows)
        except Exception as e:
            return jsonify({"ok": False, "error": str(e)}), 500

    # REGISTER AUTH BLUEPRINT
    app.register_blueprint(auth_bp)
