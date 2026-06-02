from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from app.config import Config

# 1. Inizializzazione globale delle estensioni del Database
db = SQLAlchemy()
migrate = Migrate()

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

    return app