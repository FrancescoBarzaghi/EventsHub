from functools import wraps
from flask import request, jsonify
import jwt
import requests

# Configurazione Keycloak basata sul Realm creato
KEYCLOAK_URL = "http://keycloak:8080/realms/EventHub"
# Recuperiamo le chiavi pubbliche di Keycloak per verificare la firma del JWT senza fare una richiesta HTTP per ogni singola chiamata
try:
    jwks_url = f"{KEYCLOAK_URL}/protocol/openid-connect/certs"
    jwks = requests.get(jwks_url).json()
except Exception as e:
    jwks = None

def get_public_key(token):
    """Estrae la chiave pubblica corretta dal set JWKS di Keycloak usando il 'kid' del token."""
    unverified_header = jwt.get_unverified_header(token)
    kid = unverified_header.get("kid")
    
    for key in jwks.get("keys", []):
        if key["kid"] == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(key)
    raise Exception("Chiave pubblica non trovata nel JWKS di Keycloak.")

def token_required(required_role=None):
    """Decoratore per proteggere le rotte di Flask verificando il JWT e i ruoli di Keycloak."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            # Controlla se il token è presente nell'header Authorization
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization'].split(" ")
                if len(auth_header) == 2 and auth_header[0] == "Bearer":
                    token = auth_header[1]

            if not token:
                return jsonify({"error": "Token mancante o non valido!"}), 401

            try:
                # Decodifica e verifica il token usando la chiave pubblica di Keycloak
                public_key = get_public_key(token)
                # Spesso nello sviluppo locale l'audience può differire, 
                # la disattiviamo temporaneamente per evitare blocchi stringenti in dev
                decoded_token = jwt.decode(
                    token, 
                    public_key, 
                    algorithms=["RS256"], 
                    options={"verify_aud": False}
                )
                
                # Estrae i ruoli del Realm dal token di Keycloak
                realm_access = decoded_token.get("realm_access", {})
                user_roles = realm_access.get("roles", [])
                
                # Se è richiesto un ruolo specifico, verifica che l'utente lo possieda
                if required_role and required_role not in user_roles:
                    return jsonify({"error": "Accesso negato: permessi insufficienti!"}), 403
                
                # Salva i dati dell'utente (es. username o id) nel contesto della richiesta se servono ai controller
                request.user_info = decoded_token

            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Il token è scaduto!"}), 401
            except jwt.InvalidTokenError as e:
                return jsonify({"error": f"Token non valido: {str(e)}"}), 401
            except Exception as e:
                return jsonify({"error": f"Errore di autenticazione: {str(e)}"}), 500

            return f(*args, **kwargs)
        return decorated
    return decorator