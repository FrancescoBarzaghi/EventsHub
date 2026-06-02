import os
from dotenv import load_dotenv

# Forza la ricerca del file .env partendo dalla cartella corrente
load_dotenv()

# --- ELABORAZIONE STRINGA DI CONNESSIONE ---
raw_db_url = os.environ.get('DATABASE_URL')

# Debug temporaneo
print("--- [DEBUG] DATABASE_URL caricato:", raw_db_url)

if raw_db_url:
    # Se hai incollato l'URI di Aiven che inizia con mysql://, lo correggiamo per PyMySQL
    if raw_db_url.startswith("mysql://"):
        raw_db_url = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
else:
    # Fallback di sicurezza
    raw_db_url = 'sqlite:///fallback_local.db'

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'eventhub_super_secret_key_123')
    
    # --- CONFIGURAZIONE DATABASE (AIVEN MYSQL) ---
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Configurazione SSL corretta per PyMySQL richiesto da Aiven
    SQLALCHEMY_ENGINE_OPTIONS = {
        "connect_args": {
            "ssl": {
                "check_hostname": False
            }
        }
    }

    # --- CONFIGURAZIONE KEYCLOAK (JWT) ---
    # Sostituito il vecchio fallback 'http://keycloak:8080' con 'http://127.0.0.1:8080'
    KEYCLOAK_INTERNAL_URL = os.environ.get('KEYCLOAK_INTERNAL_URL', 'http://127.0.0.1:8080')
    REALM_NAME = os.environ.get('REALM_NAME', 'EventHub')
    
    JWT_ALGORITHM = "RS256"
    JWT_JWKS_URI = f"{KEYCLOAK_INTERNAL_URL}/realms/{REALM_NAME}/protocol/openid-connect/certs"

    # --- CONFIGURAZIONE UPLOAD LOCALE LOCANDINE ---
    UPLOAD_FOLDER = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'static', 'uploads')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    MAX_CONTENT_LENGTH = 5 * 1024 * 1024  # 5MB