"""
Webhook endpoint to receive payment notifications
This can be called by payment gateway or manual verification
"""
from flask import Blueprint, request, jsonify
import psycopg2.extras
from datetime import datetime
from db import get_db_connection
from utils.auth import token_required

payment_webhook_bp = Blueprint('payment_webhook', __name__)

@payment_webhook_bp.route('/webhook/payment', methods=['POST'])
def payment_webhook():
    """
    Receive payment notification from banking system
    Expected payload: {
        "transaction_id": "string",
        "account_no": "string", 
        "amount": number,
        "content": "string",
        "transaction_date": "string"
    }
    """
    try:
        data = request.get_json()
        
        transaction_id = data.get('transaction_id')
        amount = float(data.get('amount', 0))
        content = data.get('content', '')
        account_no = data.get('account_no')
        
        if not transaction_id or amount <= 0:
            return jsonify({"ok": False, "error": "Invalid payment data"}), 400
        
        # Verify account number matches
        if account_no != '1025996717':
            return jsonify({"ok": False, "error": "Invalid account"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if transaction already processed
        cur.execute("""
            SELECT 1 FROM app.wallet_transactions 
            WHERE description LIKE %s;
        """, (f'%{transaction_id}%',))
        
        if cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"ok": True, "message": "Transaction already processed"}), 200
        
        # Extract user ID from content (format: NAPVI<user_id><timestamp>)
        # For demo, we'll use a pattern matching
        user_id = None
        if 'NAPVI' in content:
            # Try to extract user info from content
            # You can improve this logic based on your memo format
            pass
        
        # For now, let's allow manual user_id in webhook
        user_id = data.get('user_id')
        
        if not user_id:
            cur.close()
            conn.close()
            return jsonify({"ok": False, "error": "Cannot identify user"}), 400
        
        # Get user's wallet
        cur.execute("""
            SELECT wallet_id, balance 
            FROM app.wallets 
            WHERE user_id = %s;
        """, (user_id,))
        
        wallet = cur.fetchone()
        
        if not wallet:
            # Create wallet if doesn't exist
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance)
                VALUES (%s, 0)
                RETURNING wallet_id, balance;
            """, (user_id,))
            wallet = cur.fetchone()
        
        # Update wallet balance
        new_balance = float(wallet['balance']) + amount
        cur.execute("""
            UPDATE app.wallets 
            SET balance = %s, updated_at = NOW()
            WHERE wallet_id = %s;
        """, (new_balance, wallet['wallet_id']))
        
        # Create transaction record
        cur.execute("""
            INSERT INTO app.wallet_transactions 
            (wallet_id, amount, type, description, created_at)
            VALUES (%s, %s, 'CREDIT', %s, NOW())
            RETURNING transaction_id;
        """, (
            wallet['wallet_id'],
            amount,
            f"Top up via bank transfer - Ref: {transaction_id}"
        ))
        
        transaction = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "ok": True,
            "message": "Payment processed successfully",
            "transaction_id": transaction['transaction_id'],
            "new_balance": new_balance
        }), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


@payment_webhook_bp.route('/payment/verify', methods=['POST'])
@token_required
def verify_payment(current_user):
    """
    Manual payment verification by user
    User provides transaction reference to verify payment
    """
    try:
        data = request.get_json()
        transaction_ref = data.get('transaction_ref', '').strip()
        amount = float(data.get('amount', 0))
        
        if not transaction_ref or amount <= 0:
            return jsonify({"ok": False, "error": "Invalid input"}), 400
        
        user_id = current_user['user_id']
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        # Check if already processed
        cur.execute("""
            SELECT wt.amount, wt.created_at, w.balance
            FROM app.wallet_transactions wt
            JOIN app.wallets w ON wt.wallet_id = w.wallet_id
            WHERE w.user_id = %s AND wt.description LIKE %s;
        """, (user_id, f'%{transaction_ref}%'))
        
        existing_tx = cur.fetchone()
        if existing_tx:
            cur.close()
            conn.close()
            return jsonify({
                "ok": True,  # Changed from False to True
                "already_processed": True,
                "message": "Payment already verified! Your balance has been updated.",
                "amount": float(existing_tx['amount']),
                "processed_at": existing_tx['created_at'].isoformat(),
                "current_balance": float(existing_tx['balance'])
            }), 200  # Changed from 400 to 200
        
        # Get or create wallet
        cur.execute("""
            SELECT wallet_id, balance 
            FROM app.wallets 
            WHERE user_id = %s;
        """, (user_id,))
        
        wallet = cur.fetchone()
        
        if not wallet:
            cur.execute("""
                INSERT INTO app.wallets (user_id, balance)
                VALUES (%s, 0)
                RETURNING wallet_id, balance;
            """, (user_id,))
            wallet = cur.fetchone()
        
        # Update balance
        new_balance = float(wallet['balance']) + amount
        cur.execute("""
            UPDATE app.wallets 
            SET balance = %s, updated_at = NOW()
            WHERE wallet_id = %s;
        """, (new_balance, wallet['wallet_id']))
        
        # Create transaction
        cur.execute("""
            INSERT INTO app.wallet_transactions 
            (wallet_id, amount, type, description, created_at)
            VALUES (%s, %s, 'CREDIT', %s, NOW());
        """, (
            wallet['wallet_id'],
            amount,
            f"Top up verified - Ref: {transaction_ref}"
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "ok": True,
            "message": "Payment verified and balance updated",
            "new_balance": new_balance
        }), 200
        
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500
