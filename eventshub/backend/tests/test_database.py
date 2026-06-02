import pytest
from app import create_app, db
from app.models import Event, User
from datetime import datetime, timezone

@pytest.fixture(scope='module')
def test_client():
    """Configura l'applicazione in modalità TESTING e crea le tabelle su Aiven se mancano."""
    app = create_app()
    app.config['TESTING'] = True
    
    with app.app_context():
        # Crea fisicamente le tabelle se non esistono su Aiven
        db.create_all()
        yield app

def test_aiven_mysql_connection_and_crud(test_client):
    """
    Test di integrazione: verifica che il backend riesca a connettersi via SSL ad Aiven,
    scrivere un record, leggerlo correttamente e infine eliminarlo.
    """
    # 1. Verifica la connessione iniziale eseguendo una query grezza di test
    try:
        db.session.execute(db.text("SELECT 1"))
        connection_ok = True
    except Exception as e:
        connection_ok = False
        pytest.fail(f"Impossibile connettersi al database di Aiven. Controlla SSL e credenziali: {str(e)}")
    
    assert connection_ok is True

    # 2. PREPARAZIONE: Crea un utente organizzatore valido per rispettare la Foreign Key
    test_user_id = "keycloak-test-user-id-999"
    
    # Rimuove l'utente se è rimasto appeso da test falliti in precedenza
    vecchio_utente = db.session.get(User, test_user_id)
    if vecchio_utente:
        db.session.delete(vecchio_utente)
        db.session.commit()

    # Passiamo 'username' invece di 'name' per rispettare il modello User
    organizzatore = User(
        id=test_user_id,
        username="test_organizer_999",
        email="testorganizer@eventshub.com",
        role="organizer"
    )
    
    try:
        db.session.add(organizzatore)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        pytest.fail(f"Errore durante la creazione dell'utente di test: {str(e)}")

    # 3. CREATE: Prova a inserire un evento di test legato all'utente organizzatore
    timestamp_attuale = int(datetime.now(timezone.utc).timestamp())
    unique_title = f"Test Connessione Aiven {timestamp_attuale}"
    
    nuovo_evento = Event(
        title=unique_title,
        description="Se questo record viene letto, l'integrazione con Aiven MySQL funziona!",
        date=datetime.now(timezone.utc),
        location="Milano - Laboratorio Test",
        category="Tecnologia",
        price=0.0,
        total_slots=50,
        available_slots=50,
        organizer_id=test_user_id  # Collegato correttamente alla FK dell'utente sopra
    )
    
    try:
        db.session.add(nuovo_evento)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Pulizia di emergenza dell'utente prima del fallimento
        db.session.delete(organizzatore)
        db.session.commit()
        pytest.fail(f"Errore durante la fase di SCRITTURA (Insert) su Aiven: {str(e)}")

    # 4. READ: Prova a recuperare l'evento appena salvato nel cloud
    evento_recuperato = Event.query.filter_by(title=unique_title).first()
    
    assert evento_recuperato is not None, "Il record è stato inviato ma non è stato possibile recuperarlo (Read fallita)."
    assert evento_recuperato.location == "Milano - Laboratorio Test"
    assert evento_recuperato.id is not None  # MySQL deve aver assegnato un ID autoincrementale

    # 5. DELETE: Pulisce il database rimuovendo sia l'evento che l'utente
    try:
        db.session.delete(evento_recuperato)
        db.session.delete(organizzatore)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        pytest.fail(f"Errore durante la fase di CANCELLAZIONE (PULIZIA) su Aiven: {str(e)}")
        
    # Verifica finale: l'evento non deve più esistere
    evento_eliminato = Event.query.filter_by(title=unique_title).first()
    assert evento_eliminato is None, "Il record di test non è stato rimosso correttamente dal database."