from app import create_app
import os

app = create_app()

if __name__ == '__main__':
    # Stampa la configurazione JWT per debugging
    keycloak_public_url = os.environ.get('KEYCLOAK_PUBLIC_URL', os.environ.get('KEYCLOAK_INTERNAL_URL', 'http://127.0.0.1:8080'))
    print(f"\n✅ Backend configurato con:")
    print(f"   🔐 JWT JWKS URI (per validare token): {keycloak_public_url}/realms/EventHub/protocol/openid-connect/certs")
    print(f"   🌐 Ascolta su: http://0.0.0.0:5000\n")
    
    # Facciamo partire Flask sulla porta 5000
    app.run(host='0.0.0.0', port=5000, debug=True)