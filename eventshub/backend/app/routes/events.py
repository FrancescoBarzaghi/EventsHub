from flask import Blueprint, jsonify, request
from app.decorators import token_required

events_bp = Blueprint('events', __name__)

# Rotta PUBBLICA: chiunque può vedere gli eventi
@events_bp.route('/api/events', methods=['GET'])
def get_events():
    return jsonify({"message": "Lista degli eventi pubblici"})

# Rotta PROTETTA (Solo Organizer o Admin possono creare eventi)
@events_bp.route('/api/events', methods=['POST'])
@token_required(required_role="organizer")
def create_event():
    # Se il codice arriva qui, Keycloak ha già garantito che l'utente è un organizer!
    current_user = request.user_info.get("preferred_username")
    return jsonify({
        "message": f"Evento creato con successo dall'organizzatore: {current_user}"
    }), 201