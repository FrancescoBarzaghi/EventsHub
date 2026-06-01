from flask import Blueprint, request, jsonify
import requests

auth_bp = Blueprint('auth', __name__)

# URL INTERNO: Usato da Flask per parlare direttamente con Keycloak dentro Docker
KEYCLOAK_INTERNAL_URL = "http://keycloak:8080"

# URL PUBBLICO: Quello di GitHub Codespaces (tienilo qui per riferimento se ti servirà)
KEYCLOAK_PUBLIC_URL = "https://reimagined-space-fishstick-976977wq669vf7r4r-8080.app.github.dev"

REALM_NAME = "EventHub"
CLIENT_ID = "eventhub-frontend"

KEYCLOAK_ADMIN_USER = "admin" 
KEYCLOAK_ADMIN_PASSWORD = "admin"

def get_admin_token():
    """Recupera il token di amministrazione usando la rete interna di Docker"""
    url = f"{KEYCLOAK_INTERNAL_URL}/realms/master/protocol/openid-connect/token"
    payload = {
        'grant_type': 'password',
        'client_id': 'admin-cli',
        'username': KEYCLOAK_ADMIN_USER,
        'password': KEYCLOAK_ADMIN_PASSWORD
    }
    try:
        # verify=False evita problemi con i certificati SSL interni di Docker
        response = requests.post(url, data=payload, verify=False, timeout=10)
        if response.status_code == 200:
            return response.json().get('access_token')
        print(f"Errore get_admin_token: Status {response.status_code} - {response.text}")
        return None
    except Exception as e:
        print(f"Eccezione in get_admin_token: {str(e)}")
        return None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'user') # Se non passato, default a 'user'

    if not email or not password or not username:
        return jsonify({"message": "Dati mancanti obbligatori"}), 400

    name_parts = name.split(' ', 1) if name else ["", ""]
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # 1. Ottieni il token admin tramite rotta interna
    admin_token = get_admin_token()
    if not admin_token:
        return jsonify({"message": "Impossibile autenticarsi su Keycloak come Admin internamente"}), 500

    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # 2. Payload utente
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
                "temporary": False
            }
        ]
    }

    # 3. Creazione utente tramite rotta interna
    create_user_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{REALM_NAME}/users"
    try:
        response = requests.post(create_user_url, json=user_payload, headers=headers, verify=False, timeout=10)
    except Exception as e:
        return jsonify({"message": f"Errore di connessione interna a Keycloak: {str(e)}"}), 500

    if response.status_code == 201:
        # 4. Cerca l'ID dell'utente appena creato
        search_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{REALM_NAME}/users?username={username}"
        search_res = requests.get(search_url, headers=headers, verify=False)
        
        if search_res.status_code == 200 and len(search_res.json()) > 0:
            user_id = search_res.json()[0]['id']
            
            # 5. Recupera il ruolo dal Realm
            role_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{REALM_NAME}/roles/{role}"
            role_res = requests.get(role_url, headers=headers, verify=False)
            
            if role_res.status_code == 200:
                role_data = role_res.json()
                
                # 6. Assegna il ruolo all'utente
                assign_role_url = f"{KEYCLOAK_INTERNAL_URL}/admin/realms/{REALM_NAME}/users/{user_id}/role-mappings/realm"
                requests.post(assign_role_url, json=[role_data], headers=headers, verify=False)

        return jsonify({"message": "Utente registrato con successo su Keycloak!"}), 201
    
    elif response.status_code == 409:
        return jsonify({"message": "Un utente con questa email o username esiste già."}), 409
    else:
        return jsonify({"message": "Errore durante la creazione dell'utente su Keycloak", "details": response.text}), response.status_code