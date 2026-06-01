from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt, jwt_required

def token_required(required_role=None):
    """
    Decoratore ottimizzato per proteggere le rotte di Flask.
    Verifica il JWT tramite Flask-JWT-Extended ed estrae i ruoli da Keycloak.
    """
    def decorator(f):
        @wraps(f)
        @jwt_required()  # Verifica automaticamente firma, scadenza e validità del token Bearer
        def decorated(*args, **kwargs):
            try:
                # Recupera tutti i dati (claims) decodificati dal JWT attuale
                decoded_token = get_jwt()
                
                # Estrae i ruoli del Realm di Keycloak (es. 'user', 'organizer')
                realm_access = decoded_token.get("realm_access", {})
                user_roles = realm_access.get("roles", [])
                
                # Se è richiesto un ruolo specifico, verifica che l'utente lo possieda
                if required_role and required_role not in user_roles:
                    return jsonify({"error": "Accesso negato: permessi insufficienti!"}), 403
                
                # Salva i dati dell'utente nel contesto della richiesta (mantiene la tua logica originale)
                request.user_info = decoded_token

            except Exception as e:
                return jsonify({"error": f"Errore di autorizzazione: {str(e)}"}), 500

            return f(*args, **kwargs)
        return decorated
    return decorator