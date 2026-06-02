from flask import Blueprint, request, jsonify, current_app
import requests

auth_bp = Blueprint('auth', __name__)

# Credenziali Admin di Keycloak
KEYCLOAK_ADMIN_USER = "admin" 
KEYCLOAK_ADMIN_PASSWORD = "admin"

def get_admin_token():
    # Recupera l'URL interno corretto o usa 127.0.0.1 se non configurato nell'app
    keycloak_url = current_app.config.get('KEYCLOAK_INTERNAL_URL', 'http://127.0.0.1:8080')
    url = f"{keycloak_url}/realms/master/protocol/openid-connect/token"
    
    payload = {
        'grant_type': 'password',
        'client_id': 'admin-cli',
        'username': KEYCLOAK_ADMIN_USER,
        'password': KEYCLOAK_ADMIN_PASSWORD
    }
    try:
        response = requests.post(url, data=payload, verify=False, timeout=10)
        if response.status_code == 200:
            return response.json().get('access_token')
        return None
    except Exception as e:
        print(f"[KEYCLOAK ERROR] Impossibile ottenere Admin Token: {str(e)}")
        return None

@auth_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({"message": "OK"}), 200

    if request.is_json:
        data = request.get_json()
    else:
        data = request.form

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    # Determiniamo il ruolo esatto da assegnare (user o organizer)
    requested_role = str(data.get('role', 'user')).strip().lower()

    if not email or not password or not username:
        return jsonify({"message": "Dati obbligatori mancanti (email, username o password)"}), 400

    name_parts = name.split(' ', 1) if name else ["", ""]
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    admin_token = get_admin_token()
    if not admin_token:
        return jsonify({"message": "Impossibile autenticarsi su Keycloak come Admin internamente"}), 500

    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json"
    }

    # Recuperiamo le costanti di configurazione globali con fallback corretto su localhost
    keycloak_url = current_app.config.get('KEYCLOAK_INTERNAL_URL', 'http://127.0.0.1:8080')
    realm_name = current_app.config.get('REALM_NAME', 'EventHub')

    # 1. Payload di creazione Utente
    user_payload = {
        "username": username,
        "email": email,
        "enabled": True,
        "firstName": first_name,
        "lastName": last_name,
        "credentials": [{
            "type": "password",
            "value": password,
            "temporary": False
        }]
    }

    create_user_url = f"{keycloak_url}/admin/realms/{realm_name}/users"
    try:
        response = requests.post(create_user_url, json=user_payload, headers=headers, verify=False, timeout=10)
    except Exception as e:
        return jsonify({"message": f"Errore di connessione interna a Keycloak: {str(e)}"}), 500

    if response.status_code == 201:
        # 2. Recuperiamo l'ID dell'utente appena creato
        search_user_url = f"{keycloak_url}/admin/realms/{realm_name}/users?username={username}"
        try:
            user_res = requests.get(search_user_url, headers=headers, verify=False, timeout=10)
            if user_res.status_code == 200 and len(user_res.json()) > 0:
                user_id = user_res.json()[0]['id']

                # 3. Recuperiamo i dettagli del Ruolo direttamente dal Realm di Keycloak
                get_role_url = f"{keycloak_url}/admin/realms/{realm_name}/roles/{requested_role}"
                role_res = requests.get(get_role_url, headers=headers, verify=False, timeout=10)
                
                if role_res.status_code == 200:
                    role_data = role_res.json()
                    
                    # 4. Assegniamo il Ruolo direttamente all'utente (Mappatura di Realm)
                    add_role_url = f"{keycloak_url}/admin/realms/{realm_name}/users/{user_id}/role-mappings/realm"
                    # Keycloak richiede una lista/array di oggetti ruolo
                    assign_res = requests.post(add_role_url, json=[role_data], headers=headers, verify=False, timeout=10)
                    
                    if assign_res.status_code in [200, 204]:
                        print(f"[SUCCESS] Ruolo '{requested_role}' assegnato direttamente a {username}")
                    else:
                        print(f"[ERROR] Errore mappatura ruolo. Stato: {assign_res.status_code}, Dettagli: {assign_res.text}")
                else:
                    print(f"[WARNING] Ruolo '{requested_role}' non trovato nel Realm {realm_name}.")
            else:
                print(f"[WARNING] Utente appena creato non trovato durante la ricerca.")
        except Exception as e:
            print(f"[ERROR] Errore durante l'assegnazione diretta del ruolo: {str(e)}")

        return jsonify({"message": f"Utente registrato con successo con ruolo {requested_role}!"}), 201
    
    elif response.status_code == 409:
        return jsonify({"message": "Un utente con questa email o username esiste già."}), 409
    else:
        return jsonify({
            "message": "Errore durante la creazione dell'utente su Keycloak", 
            "details": response.text
        }), response.status_code