from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import get_jwt, jwt_required
from app import db
from app.models import User

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
                
                # Estrae i ruoli del Realm di Keycloak (es. 'user', 'organizer', 'admin')
                realm_access = decoded_token.get("realm_access", {})
                user_roles = realm_access.get("roles", [])
                
                # Se è richiesto un ruolo specifico, verifica che l'utente lo possieda.
                # Nota: Il ruolo 'admin' ha accesso super-user e scavalca le restrizioni inferiori.
                if required_role and required_role not in user_roles and 'admin' not in user_roles:
                    return jsonify({"error": f"Accesso negato: richiesto ruolo '{required_role}'!"}), 403

                # Se il token è valido, assicuriamoci che l'utente esista anche nel DB locale.
                current_user_id = decoded_token.get("sub")
                if current_user_id:
                    local_user = db.session.get(User, current_user_id)
                    if not local_user:
                        username = decoded_token.get("preferred_username") or decoded_token.get("name") or current_user_id
                        email = decoded_token.get("email") or f"{current_user_id}@keycloak.local"
                        local_user = User(
                            id=current_user_id,
                            username=username,
                            email=email,
                            role='user'
                        )
                        db.session.add(local_user)
                        db.session.commit()

                # Salva i dati dell'utente nel contesto della richiesta (usato nei controller delle rotte)
                request.user_info = decoded_token

            except Exception as e:
                return jsonify({"error": f"Errore interno di autorizzazione: {str(e)}"}), 500

            return f(*args, **kwargs)
        return decorated
    return decorator