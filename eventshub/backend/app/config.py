import os
from dotenv import load_dotenv

# Carica le variabili dal file backend/.env
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'eventhub_super_secret_key_123')
    
    # --- CONFIGURAZIONE DATABASE (AIVEN MYSQL) ---
    raw_db_url = os.environ.get('DATABASE_URL')
    
    # Fix del prefisso del dialetto per SQLAlchemy
    if raw_db_url and raw_db_url.startswith("mysql://"):
        raw_db_url = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
        
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Forza l'uso di SSL nativo richiesto da Aiven tramite connect_args
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "fake_user_agent": True  # Dice a PyMySQL di attivare il contesto SSL standard senza certificato locale alternativo
            }
        }
    }

    # --- CONFIGURAZIONE KEYCLOAK (JWT) ---
    KEYCLOAK_INTERNAL_URL = os.environ.get('KEYCLOAK_INTERNAL_URL', 'http://keycloak:8080')
    REALM_NAME = os.environ.get('REALM_NAME', 'EventHub')
    
    JWT_ALGORITHM = "RS256"
    JWT_JWKS_URI = f"{KEYCLOAK_INTERNAL_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"

    # --- CONFIGURAZIONE UPLOAD LOCALE LOCANDINE ---
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static/uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # Limite di sicurezza di 5MB per file