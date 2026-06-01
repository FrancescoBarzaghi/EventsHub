from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    
    # Configurazione CORS super estesa per Codespaces
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
        "supports_credentials": True
    }})
    
    # Intercettiamo le richieste OPTIONS a livello globale prima che arrivino ai blueprint
    @app.before_request
    def handle_options_preflight():
        if request.method == "OPTIONS":
            response = make_response()
            response.headers.add("Access-Control-Allow-Origin", "*")
            response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Accept")
            response.headers.add("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
            return response

    # Configurazione di base per Flask
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'eventhub_super_secret_key_123')
    
    # CONFIGURAZIONE KEYCLOAK PER FLASK-JWT-EXTENDED
    KEYCLOAK_INTERNAL_URL = "http://keycloak:8080"
    REALM_NAME = "EventHub"
    
    app.config["JWT_ALGORITHM"] = "RS256"
    app.config["JWT_JWKS_URI"] = f"{KEYCLOAK_INTERNAL_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"
    
    jwt = JWTManager(app)
    
    # REGISTRAZIONE BLUEPRINT
    from app.routes.auth import auth_bp
    from app.routes.events import events_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(events_bp, url_prefix='/api/events')

    @app.route('/')
    def index():
        return {"message": "EventHub Backend API is running (CORS Fix Active)!"}, 200

    return app