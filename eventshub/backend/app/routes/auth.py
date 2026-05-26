from flask import Blueprint, request, jsonify
import requests

auth_bp = Blueprint('auth', __name__)

# Configurazione Keycloak di amministrazione
KEYCLOAK_URL = "https://reimagined-space-fishstick-976977wq669vf7r4r-8080.app.github.dev"
REALM_NAME = "EventHub"
CLIENT_ID = "eventhub-frontend"

# NOTA: Per creare utenti, Flask deve autenticarsi come amministratore di Keycloak.
# Assicurati di usare le credenziali ADMIN principali del tuo Keycloak (Master/Admin)
KEYCLOAK_ADMIN_USER = "admin" 
KEYCLOAK_ADMIN_PASSWORD = "admin" # Sostituisci con la tua password admin se diversa

def get_admin_token():
    """Recupera il token di amministrazione per gestire gli utenti su Keycloak"""
    url = f"{KEYCLOAK_URL}/realms/master/protocol/openid-connect/token"
    payload = {
        'grant_type': 'password',
        'client_id': 'admin-cli',
        'username': KEYCLOAK_ADMIN_USER,
        'password': KEYCLOAK_ADMIN_PASSWORD
    }
    response = requests.post(url, data=payload, verify=False)
    if response.status_code == 200:
        return response.json().get('access_token')
    return None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Estraiamo i dati inviati dal tuo form Angular
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role') # 'user' o 'organizer'

    if not email or not password or not username:
        return jsonify({"message": "Dati mancanti obbligatori"}), 400

    # Separaiamo il nome e il cognome in modo basico se presenti
    name_parts = name.split(' ', 1) if name else ["", ""]
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # 1. Ottieni il token admin per fare operazioni su Keycloak
    admin_token = get_admin_token()
    if not admin_token:
        return jsonify({"message": "Impossibile autenticarsi su Keycloak come Admin"}), 500

    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # 2. Prepariamo il payload per creare l'utente su Keycloak
    user_payload = {
        "username": username,
        "email": email,
        "enabled": True,
        "firstName": first_name,
        "lastName": last_name,
        "credentials": [
            {
                "type": "password",
                "value": password,
                "temporary": False # L'utente non dovrà cambiarla al primo accesso
            }
        ]
    }

    # 3. Chiamata API a Keycloak per creare l'anagrafica
    create_user_url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    response = requests.post(create_user_url, json=user_payload, headers=headers, verify=False)

    if response.status_code == 201:
        # L'utente è stato creato! Ora dobbiamo assegnargli il ruolo (user o organizer)
        
        # Recuperiamo l'ID dell'utente appena creato (Keycloak lo restituisce nell'header Location)
        # Oppure facciamo una rapida ricerca per username
        search_url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users?username={username}"
        search_res = requests.get(search_url, headers=headers, verify=False)
        
        if search_res.status_code == 200 and len(search_res.json()) > 0:
            user_id = search_res.json()[0]['id']
            
            # Recuperiamo l'ID del ruolo dal Realm (es: 'user' o 'organizer')
            role_url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role}"
            role_res = requests.get(role_url, headers=headers, verify=False)
            
            if role_res.status_code == 200:
                role_data = role_res.json()
                
                # Assegniamo il ruolo all'utente su Keycloak
                assign_role_url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}/role-mappings/realm"
                requests.post(assign_role_url, json=[role_data], headers=headers, verify=False)

        return jsonify({"message": "Utente registrato con successo su Keycloak!"}), 201
    
    elif response.status_code == 409:
        return jsonify({"message": "Un utente con questa email o username esiste già."}), 409
    else:
        return jsonify({"message": "Errore durante la creazione dell'utente su Keycloak", "details": response.text}), response.status_code