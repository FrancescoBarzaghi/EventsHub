import uuid
from flask import Blueprint, jsonify, request
from app import db
from app.models import Event, Ticket
from app.decorators import token_required
from datetime import datetime

tickets_bp = Blueprint('tickets', __name__)

# =========================================================================
# 1. ACQUISTO / ISCRIZIONE A UN EVENTO (POST /api/tickets)
# =========================================================================
@tickets_bp.route('', methods=['POST'])
@token_required(required_role="user") # Accessibile agli utenti normali autenticati con Keycloak
def buy_ticket():
    # Estraggo l'ID univoco dell'utente dal token Keycloak integrato nel tuo decoratore
    current_user_id = request.user_info.get("sub")
    
    data = request.get_json()
    if not data or 'event_id' not in data:
        return jsonify({"error": "ID evento mancante"}), 400
        
    event_id = data['event_id']
    
    # 1. Recupero l'evento dal database Aiven
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento non trovato"}), 404
        
    # 2. Controllo di sicurezza: l'evento non deve essere già terminato
    if event.date < datetime.utcnow():
        return jsonify({"error": "Impossibile iscriversi a un evento passato"}), 400
        
    # 3. Controllo di sicurezza: l'utente non deve essere già registrato allo stesso evento
    existing_ticket = Ticket.query.filter_by(user_id=current_user_id, event_id=event_id).first()
    if existing_ticket:
        return jsonify({"error": "Sei già iscritto a questo evento"}), 400

    # 4. Controllo atomico dei posti disponibili (Previene l'overbooking)
    if event.available_slots <= 0:
        return jsonify({"error": "Spiacenti, i posti per questo evento sono esauriti!"}), 400

    try:
        # Decremento lo slot libero sul database
        event.available_slots -= 1
        
        # Genero un hash unico (UUID v4) che verrà convertito in grafico QR Code dal frontend Angular
        qr_hash = str(uuid.uuid4())
        
        # Salvo il record del biglietto legato all'utente
        new_ticket = Ticket(
            user_id=current_user_id,
            event_id=event_id,
            qr_code=qr_hash,
            purchase_date=datetime.utcnow()
        )
        
        db.session.add(new_ticket)
        db.session.commit()
        
        return jsonify({
            "message": "Iscrizione completata con successo!",
            "ticket_id": new_ticket.id,
            "qr_code_data": qr_hash
        }), 210

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Errore durante la transazione: {str(e)}"}), 500


# =========================================================================
# 2. VISUALIZZAZIONE DEI PROPRI BIGLIETTI (GET /api/tickets/my-tickets)
# =========================================================================
@tickets_bp.route('/my-tickets', methods=['GET'])
@token_required(required_role="user")
def get_my_tickets():
    current_user_id = request.user_info.get("sub")
    
    # Recupero tutti i biglietti acquistati dall'utente corrente
    tickets = Ticket.query.filter_by(user_id=current_user_id).all()
    
    output = []
    for ticket in tickets:
        output.append({
            "ticket_id": ticket.id,
            "purchase_date": ticket.purchase_date.strftime('%Y-%m-%d %H:%M:%S'),
            "qr_code_data": ticket.qr_code,
            "event": {
                "id": ticket.event.id,
                "title": ticket.event.title,
                "date": ticket.event.date.strftime('%Y-%m-%d %H:%M:%S'),
                "location": ticket.event.location,
                "price": ticket.event.price,
                "image_path": ticket.event.image_path
            }
        })
        
    return jsonify(output), 200


# =========================================================================
# 3. DISISCRIZIONE / ANNULLAMENTO BIGLIETTO (DELETE /api/tickets/<id>)
# =========================================================================
@tickets_bp.route('/<int:ticket_id>', methods=['DELETE'])
@token_required(required_role="user")
def cancel_ticket(ticket_id):
    current_user_id = request.user_info.get("sub")
    
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({"error": "Biglietto non trovato"}), 404
        
    # Controllo di sicurezza: un utente non può cancellare il biglietto di un altro utente
    if ticket.user_id != current_user_id:
        return jsonify({"error": "Azione non autorizzata"}), 403
        
    # Controllo di sicurezza: non puoi cancellare l'iscrizione ad eventi passati
    if ticket.event.date < datetime.utcnow():
        return jsonify({"error": "Impossibile annullare l'iscrizione a un evento già terminato"}), 400

    try:
        # Recupero l'evento associato e ri-aumento i posti disponibili sul mercato
        event = ticket.event
        event.available_slots += 1
        
        db.session.delete(ticket)
        db.session.commit()
        
        return jsonify({"message": "Iscrizione annullata. Il tuo posto è tornato disponibile."}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Errore durante l'annullamento: {str(e)}"}), 500