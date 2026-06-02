import os
import urllib.parse
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# --- ELABORAZIONE STRINGA DI CONNESSIONE ---
raw_db_url = os.environ.get('DATABASE_URL')
if not raw_db_url:
    raise RuntimeError('DATABASE_URL non impostato. Verifica il file backend/.env in Codespaces.')

# Se l'URI Aiven usa mysql://, lo correggiamo per PyMySQL
raw_db_url = raw_db_url.replace("mysql://", "mysql+pymysql://", 1)
raw_db_url = raw_db_url.replace("ssl-mode=", "ssl_mode=")

engine_options = {}
if raw_db_url.startswith("mysql+pymysql://"):
    parsed = urllib.parse.urlparse(raw_db_url)
    query_params = urllib.parse.parse_qs(parsed.query)
    query_params.pop('ssl_mode', None)
    cleaned_query = urllib.parse.urlencode({k: v[0] for k, v in query_params.items()}, doseq=True)
    raw_db_url = urllib.parse.urlunparse(parsed._replace(query=cleaned_query))
    engine_options = {
        "connect_args": {
            "ssl": {
                "check_hostname": False
            }
        }
    }

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'eventhub_super_secret_key_123')
    SEED_SAMPLE_DATA = os.environ.get('SEED_SAMPLE_DATA', 'false').lower() in ('1', 'true', 'yes')
    
    # --- CONFIGURAZIONE DATABASE (AIVEN MYSQL) ---
    SQLALCHEMY_DATABASE_URI = raw_db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = engine_options

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