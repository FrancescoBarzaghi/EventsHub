import json
from datetime import datetime
from typing import Any

import requests
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from jwt.algorithms import RSAAlgorithm
from app.config import Config

# 1. Inizializzazione globale delle estensioni del Database
db = SQLAlchemy()
migrate = Migrate()

_SAMPLE_EVENTS = [
    {
        "title": "Festival Jazz Italiano 2026",
        "description": "Concerto all'aperto con i più grandi artisti jazz nazionali e internazionali.",
        "date": "2026-09-12 20:00:00",
        "location": "Milano",
        "category": "Musica",
        "price": 45.0,
        "total_slots": 220,
        "available_slots": 180,
        "image_path": "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800"
    },
    {
        "title": "Conferenza Tech Future 2026",
        "description": "Due giorni di talk e networking dedicati all'intelligenza artificiale e ai nuovi modelli digitali.",
        "date": "2026-08-05 09:30:00",
        "location": "Roma",
        "category": "Tecnologia",
        "price": 120.0,
        "total_slots": 350,
        "available_slots": 280,
        "image_path": "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800"
    },
    {
        "title": "Workshop Cucina Vegana Milano",
        "description": "Laboratorio pratico con chef professionisti per imparare ricette vegane creative.",
        "date": "2026-07-22 18:00:00",
        "location": "Milano",
        "category": "Gastronomia",
        "price": 75.0,
        "total_slots": 60,
        "available_slots": 46,
        "image_path": "https://images.unsplash.com/photo-1495197359483-fbfff26f2e24?w=800"
    },
    {
        "title": "Mostra Arte Contemporanea Venezia",
        "description": "Una selezione di opere contemporanee da artisti emergenti e affermati.",
        "date": "2026-10-01 11:00:00",
        "location": "Venezia",
        "category": "Arte",
        "price": 0.0,
        "total_slots": 200,
        "available_slots": 200,
        "image_path": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
    },
    {
        "title": "Maratona di Roma 2026",
        "description": "Una giornata di sport e solidarietà attraverso le vie storiche della Capitale.",
        "date": "2026-11-07 08:00:00",
        "location": "Roma",
        "category": "Sport",
        "price": 50.0,
        "total_slots": 500,
        "available_slots": 412,
        "image_path": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"
    },
    {
        "title": "Teatro: La Traviata Verona",
        "description": "Una serata lirica nell'antico anfiteatro di Verona con cast internazionale.",
        "date": "2026-09-30 21:00:00",
        "location": "Verona",
        "category": "Teatro",
        "price": 95.0,
        "total_slots": 180,
        "available_slots": 150,
        "image_path": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
    }
]

_SAMPLE_ORGANIZER = {
    "id": "seed_organizer_default",
    "username": "seed_organizer",
    "email": "seed_organizer@eventshub.local",
    "role": "organizer"
}

_jwks_cache: dict[str, dict[str, Any]] = {}


def _load_jwks(jwks_uri: str) -> dict[str, Any]:
    cached = _jwks_cache.get(jwks_uri)
    if cached and cached.get("cache_ts"):
        return cached["jwks"]

    response = requests.get(jwks_uri, timeout=5)
    response.raise_for_status()
    jwks = response.json()
    _jwks_cache[jwks_uri] = {"jwks": jwks, "cache_ts": True}
    return jwks


def _get_rsa_key_from_jwks(unverified_headers: dict[str, Any], jwks_uri: str) -> str:
    kid = unverified_headers.get("kid")
    if not kid:
        raise RuntimeError("JWT header missing 'kid' for JWKS lookup")

    jwks = _load_jwks(jwks_uri)
    for jwk in jwks.get("keys", []):
        if jwk.get("kid") == kid:
            pubkey = RSAAlgorithm.from_jwk(json.dumps(jwk))
            pem = pubkey.public_bytes(Encoding.PEM, PublicFormat.SubjectPublicKeyInfo)
            return pem.decode('utf-8')

    raise RuntimeError(f"JWKS key with kid={kid} not found")


def seed_default_local_events(app):
    from app.models import Event, User

    if not app.config['SQLALCHEMY_DATABASE_URI'].startswith('sqlite:///') and not app.config.get('SEED_SAMPLE_DATA'):
        return

    with app.app_context():
        db.create_all()

        if Event.query.count() > 0:
            return

        organizer = db.session.get(User, _SAMPLE_ORGANIZER['id'])
        if not organizer:
            organizer = User(
                id=_SAMPLE_ORGANIZER['id'],
                username=_SAMPLE_ORGANIZER['username'],
                email=_SAMPLE_ORGANIZER['email'],
                role=_SAMPLE_ORGANIZER['role']
            )
            db.session.add(organizer)
            db.session.commit()

        for event_data in _SAMPLE_EVENTS:
            if Event.query.filter_by(title=event_data['title']).first():
                continue
            event = Event(
                title=event_data['title'],
                description=event_data['description'],
                date=datetime.fromisoformat(event_data['date']),
                location=event_data['location'],
                category=event_data['category'],
                price=event_data['price'],
                total_slots=event_data['total_slots'],
                available_slots=event_data['available_slots'],
                image_path=event_data['image_path'],
                organizer_id=_SAMPLE_ORGANIZER['id']
            )
            db.session.add(event)

        db.session.commit()


def create_app():
    app = Flask(__name__)
    
    # 2. Carica tutte le configurazioni (Aiven + Keycloak) dal file config.py
    app.config.from_object(Config)
    
    # 3. Collega SQLAlchemy e Migrate all'app Flask
    db.init_app(app)
    migrate.init_app(app, db)
    
    # Configurazione CORS estesa per Codespaces/Docker
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    }})
    
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With, Accept"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    # 4. Inizializza il gestore dei JWT di Keycloak
    jwt = JWTManager(app)

    @jwt.decode_key_loader
    def load_jwt_decode_key(unverified_headers, unverified_claims):
        jwks_uri = app.config.get('JWT_JWKS_URI')
        app.logger.debug('JWT decode key loader called, jwks_uri=%s, kid=%s', jwks_uri, unverified_headers.get('kid'))
        app.logger.debug('Unverified headers: %s', unverified_headers)
        app.logger.debug('Unverified claims: %s', unverified_claims)
        if jwks_uri:
            try:
                key = _get_rsa_key_from_jwks(unverified_headers, jwks_uri)
                app.logger.debug('JWT decode public key loaded from JWKS, kid=%s', unverified_headers.get('kid'))
                return key
            except Exception as e:
                app.logger.error('Impossibile caricare la chiave JWKS: %s', e)
                raise RuntimeError(f"Impossibile caricare la chiave JWKS: {e}")

        # Fallback: usa JWT_PUBLIC_KEY o SECRET_KEY se JWKS non è configurato.
        return app.config.get('JWT_PUBLIC_KEY') or app.config.get('SECRET_KEY')
    
    # 5. REGISTRAZIONE BLUEPRINT
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    from app.routes.tickets import tickets_bp  
    from app.routes.reviews import reviews_bp  # <--- AGGIUNTO
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')  
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')  # <--- AGGIUNTO

    @app.route('/')
    def index():
        return {"message": "EventHub Backend API is running (CORS & Aiven DB Active)!"}, 200

    # === ENDPOINT DI DEBUG ===
    @app.route('/api/debug/token', methods=['GET', 'POST', 'OPTIONS'])
    def debug_token():
        """Endpoint di debug per verificare il token ricevuto"""
        if request.method == 'OPTIONS':
            return "", 204
        
        auth_header = request.headers.get('Authorization', '')
        print(f"\n🔍 DEBUG /api/debug/token:")
        print(f"   Authorization header: {auth_header[:50]}..." if auth_header else "   Authorization header: MANCANTE")
        print(f"   All headers: {dict(request.headers)}\n")
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]
                print(f"   Token ricevuto (primi 50 caratteri): {token[:50]}...")
                
                # Prova a decodificare il token (senza verificare la firma)
                try:
                    from jwt import decode as jwt_decode
                    decoded = jwt_decode(token, options={"verify_signature": False})
                    print(f"   Token decodificato: {decoded}\n")
                    return jsonify({
                        "status": "Token ricevuto e decodificato",
                        "decoded": decoded,
                        "issuer": decoded.get("iss")
                    }), 200
                except Exception as e:
                    print(f"   Errore decodifica: {str(e)}\n")
                    return jsonify({"status": "Errore decodifica token", "error": str(e)}), 400
            else:
                return jsonify({"status": "Header formato non valido (atteso: 'Bearer <token>')"})
        else:
            return jsonify({"status": "Authorization header mancante"}), 401

    seed_default_local_events(app)

    # === JWT ERROR HANDLERS (debug) ===
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        app.logger.error('JWT invalid_token_loader invoked: %s', error_string)
        return jsonify({'msg': 'Invalid token', 'error': error_string}), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        app.logger.error('JWT unauthorized_loader invoked: %s', error_string)
        return jsonify({'msg': 'Missing or invalid Authorization header', 'error': error_string}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        app.logger.error('JWT expired_token_loader invoked; header=%s payload=%s', jwt_header, jwt_payload)
        return jsonify({'msg': 'Token expired'}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        app.logger.error('JWT revoked_token_loader invoked; header=%s payload=%s', jwt_header, jwt_payload)
        return jsonify({'msg': 'Token revoked'}), 401

    return app