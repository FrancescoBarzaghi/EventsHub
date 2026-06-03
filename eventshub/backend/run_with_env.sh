#!/bin/bash

# Script per avviare il backend Flask con le variabili d'ambiente corrette in Codespaces
# Rileva automaticamente l'URL pubblica di Keycloak e la passa al backend

# Funzione per rilevare l'URL pubblica di Keycloak in Codespaces
get_keycloak_url() {
  if [[ ! -z "$GITHUB_CODESPACES" && ! -z "$CODESPACE_NAME" ]]; then
    # In Codespaces: estrai il codespace domain e costruisci l'URL
    if [[ ! -z "$CODESPACES_LANTERN_ENVIRONMENT_ID" ]]; then
      # URL pubblica: https://CODESPACE_NAME-8080.app.github.dev
      echo "https://${CODESPACE_NAME}-8080.app.github.dev"
    else
      # Fallback: leggi da environment variabili
      if [[ ! -z "$CODESPACES_DOMAIN" ]]; then
        echo "https://${CODESPACE_NAME}-8080.${CODESPACES_DOMAIN}"
      else
        echo "http://127.0.0.1:8080"
      fi
    fi
  else
    # Ambiente locale: usa localhost
    echo "http://127.0.0.1:8080"
  fi
}

# Rileva l'URL pubblica
KEYCLOAK_PUBLIC_URL=$(get_keycloak_url)
echo "🔐 Keycloak URL (issuers): $KEYCLOAK_PUBLIC_URL"
echo "🔐 Backend verificherà i JWT con questo URL"

# Esporta la variabile e avvia il backend
export KEYCLOAK_INTERNAL_URL="http://127.0.0.1:8080"
export KEYCLOAK_PUBLIC_URL="$KEYCLOAK_PUBLIC_URL"

# Se le variabili non sono già caricate da .env, caricale
if [[ ! -z "$DATABASE_URL" ]]; then
  echo "✅ DATABASE_URL già configurato"
fi

# Avvia il server Flask
python run.py
