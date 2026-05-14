from flask import Flask, jsonify, request
from flasgger import Swagger
import os

app = Flask(__name__)

# Konfigurasi Swagger
swagger = Swagger(app, template={
    "swagger": "2.0",
    "info": {
        "title": "Sistem Booking Ruangan API (Modern)",
        "description": "Dokumentasi API yang telah diperbarui untuk Sistem Booking Ruangan (Django Backend). \n\n"
                       "Perubahan Terbaru:\n"
                       "- Unifikasi field Nama menjadi 'full_name'\n"
                       "- Penghapusan field redundant (company, department, city)\n"
                       "- Fitur Verifikasi Pembayaran & Admin Stats",
        "version": "1.1.0",
        "contact": {
            "name": "Admin Sistem",
            "email": "admin@booking.com"
        }
    },
    "host": "localhost:8000", # Pointing to Django Backend for direct testing if possible
    "basePath": "/",
    "schemes": ["http"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header menggunakan Bearer. Contoh: Bearer <token>"
        }
    }
})

# ==================== AUTH & PROFILE ====================
@app.route('/api/auth/register/', methods=['POST'])
def register():
    """Registrasi User Baru
    ---
    tags: [Auth]
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            username: {type: string}
            email: {type: string}
            password: {type: string}
            full_name: {type: string}
            phone_number: {type: string}
    responses:
      201: {description: User berhasil dibuat}
    """
    return jsonify({"status": "success"})

@app.route('/api/auth/token/', methods=['POST'])
def login():
    """Login & Dapatkan Token JWT
    ---
    tags: [Auth]
    parameters:
      - name: body
        in: body
        required: true
        schema:
          properties:
            username: {type: string}
            password: {type: string}
    responses:
      200: {description: Login berhasil, mengembalikan access & refresh token}
    """
    return jsonify({"access": "token", "refresh": "token"})

@app.route('/api/auth/profile/', methods=['GET', 'PATCH'])
def profile():
    """Manajemen Profil (Full Name, Avatar, dll)
    ---
    tags: [Profile]
    security: [{Bearer: []}]
    responses:
      200: {description: Detail profil user}
    """
    return jsonify({"full_name": "User Name", "email": "user@email.com"})

# ==================== ROOMS ====================
@app.route('/api/rooms/', methods=['GET'])
def rooms():
    """Daftar Ruangan & Filter
    ---
    tags: [Rooms]
    parameters:
      - name: search
        in: query
        type: string
      - name: capacity
        in: query
        type: integer
    responses:
      200: {description: List ruangan}
    """
    return jsonify([])

@app.route('/api/rooms/{id}/', methods=['GET'])
def room_detail(id):
    """Detail Ruangan
    ---
    tags: [Rooms]
    responses:
      200: {description: Detail lengkap ruangan}
    """
    return jsonify({"id": id})

# ==================== BOOKINGS ====================
@app.route('/api/bookings/', methods=['GET', 'POST'])
def booking_list():
    """List Booking (User) atau Buat Booking Baru
    ---
    tags: [Bookings]
    security: [{Bearer: []}]
    responses:
      200: {description: List booking user}
    """
    return jsonify([])

@app.route('/api/bookings/my_bookings/', methods=['GET'])
def my_bookings():
    """Daftar Booking milik User saat ini (Plus Invoice)
    ---
    tags: [Bookings]
    security: [{Bearer: []}]
    responses:
      200: {description: List booking dengan status terbaru}
    """
    return jsonify([])

@app.route('/api/bookings/{id}/approve/', methods=['POST'])
def approve_booking(id):
    """Admin: Setujui Booking
    ---
    tags: [Admin Actions]
    security: [{Bearer: []}]
    responses:
      200: {description: Booking disetujui, Invoice digenerate}
    """
    return jsonify({"message": "Booking approved"})

@app.route('/api/bookings/admin_stats/', methods=['GET'])
def admin_stats():
    """Admin: Statistik Ringkasan (Users, Rooms, Revenue)
    ---
    tags: [Admin Actions]
    security: [{Bearer: []}]
    responses:
      200: {description: Statistik real-time sistem}
    """
    return jsonify({"total_revenue": 0, "total_users": 0})

# ==================== PAYMENTS ====================
@app.route('/api/payments/', methods=['GET', 'POST'])
def payments():
    """List Pembayaran atau Upload Bukti Pembayaran
    ---
    tags: [Payments]
    security: [{Bearer: []}]
    responses:
      200: {description: Data pembayaran}
    """
    return jsonify([])

@app.route('/api/payments/{id}/verify/', methods=['POST'])
def verify_payment(id):
    """Admin: Verifikasi Pembayaran User
    ---
    tags: [Admin Actions]
    security: [{Bearer: []}]
    responses:
      200: {description: Pembayaran diverifikasi, Booking dikonfirmasi}
    """
    return jsonify({"status": "verified", "verified_by_name": "Admin Name"})

# ==================== REVIEWS & NOTIFS ====================
@app.route('/api/reviews/', methods=['GET', 'POST'])
def reviews():
    """Lihat Review Ruangan atau Tambah Review Baru
    ---
    tags: [Reviews]
    responses:
      200: {description: Daftar review}
    """
    return jsonify([])

@app.route('/api/notifications/unread_count/', methods=['GET'])
def notif_unread():
    """Jumlah Notifikasi Belum Dibaca
    ---
    tags: [Notifications]
    security: [{Bearer: []}]
    responses:
      200: {description: Menampilkan angka unread_count}
    """
    return jsonify({"unread_count": 0})

@app.route('/')
def home():
    return '''
    <body style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; margin: 0;">
        <div style="background: white; padding: 3rem; border-radius: 2rem; shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); text-align: center; border: 1px solid #e2e8f0;">
            <h1 style="color: #1e293b; margin-bottom: 0.5rem;">🚀 API Documentation</h1>
            <p style="color: #64748b; margin-bottom: 2rem;">Sistem Booking Ruangan (Django Backend)</p>
            <a href="/apidocs" style="display: inline-block; background: #2563eb; color: white; padding: 0.75rem 2rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; transition: background 0.2s;">📄 Buka Swagger UI</a>
            <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; font-size: 0.875rem; color: #94a3b8;">
                Backend: <code style="background: #f1f5f9; padding: 0.2rem 0.5rem; border-radius: 0.4rem;">http://localhost:8000/api/</code>
            </div>
        </div>
    </body>
    '''

if __name__ == '__main__':
    # Pastikan DEBUG=False saat di-deploy ke server publik
    app.run(host='0.0.0.0', port=5001, debug=True)