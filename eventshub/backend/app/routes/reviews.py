from flask import Blueprint, jsonify, request
from app import db
from app.models import Event, Review
from app.decorators import token_required
from datetime import datetime

reviews_bp = Blueprint('reviews', __name__)

# =========================================================================
# 1. PUBBLICARE UNA RECENSIONE (POST /api/reviews)
# =========================================================================
@reviews_bp.route('', methods=['POST'])
@token_required(required_role="user") # Solo utenti normali con token valido
def create_review():
    # Estraggo l'ID Keycloak dell'utente impostato nel tuo decoratore
    current_user_id = request.user_info.get("sub")
    
    data = request.get_json()
    if not data or not all(k in data for k in ('event_id', 'rating', 'comment')):
        return jsonify({"error": "Dati incompleti. Campi obbligatori: event_id, rating, comment"}), 400
        
    event_id = data['event_id']
    rating = data['rating']
    comment = data['comment']
    
    # Controllo che il voto sia valido (da 1 a 5 stelle)
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"error": "Il rating deve essere un numero intero da 1 a 5"}), 400

    # 1. Recupero l'evento
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Evento non trovato"}), 404
        
    # 2. VINCOLO TRACCIA: Puoi recensire l'evento SOLO dopo che si è svolto
    if event.date > datetime.utcnow():
        return jsonify({"error": "Non puoi lasciare una recensione prima dello svolgimento dell'evento"}), 400
        
    # 3. Controllo duplicati: un utente non può lasciare più recensioni allo stesso evento
    existing_review = Review.query.filter_by(user_id=current_user_id, event_id=event_id).first()
    if existing_review:
        return jsonify({"error": "Hai già inviato una recensione per questo evento"}), 400

    try:
        new_review = Review(
            user_id=current_user_id,
            event_id=event_id,
            rating=rating,
            comment=comment,
            is_reported=False
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        return jsonify({"message": "Recensione inserita con successo!"}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Errore nel salvataggio su Aiven: {str(e)}"}), 500


# =========================================================================
# 2. VEDERE LE RECENSIONI DI UN EVENTO (GET /api/reviews/event/<id>)
# =========================================================================
@reviews_bp.route('/event/<int:event_id>', methods=['GET'])
def get_event_reviews(event_id):
    # Rotta pubblica: chiunque sul frontend Angular può leggere le recensioni di un evento
    reviews = Review.query.filter_by(event_id=event_id).order_by(Review.created_at.desc()).all()
    
    output = []
    for r in reviews:
        output.append({
            "id": r.id,
            "user_id": r.user_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "is_reported": r.is_reported
        })
        
    return jsonify(output), 200


# =========================================================================
# 3. SEGNALARE UNA RECENSIONE INAPPROPRIATA (PUT /api/reviews/<id>/report)
# =========================================================================
@reviews_bp.route('/<int:review_id>/report', methods=['PUT'])
@token_required(required_role="user") # Qualsiasi utente loggato può segnalare
def report_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Recensione non trovata"}), 404
        
    try:
        review.is_reported = True
        db.session.commit()
        return jsonify({"message": "Recensione segnalata con successo ai moderatori"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Errore durante l'azione: {str(e)}"}), 500


# =========================================================================
# 4. AREA AMMINISTRATORE (MODERAZIONE RECENSIONI SEGNALATE)
# =========================================================================

# GET /api/reviews/reported -> Elenco recensioni sotto segnalazione
@reviews_bp.route('/reported', methods=['GET'])
@token_required(required_role="admin") # Solo per utenti con ruolo 'admin'
def get_reported_reviews():
    reported_reviews = Review.query.filter_by(is_reported=True).all()
    
    output = []
    for r in reported_reviews:
        output.append({
            "review_id": r.id,
            "user_id": r.user_id,
            "event_title": r.event.title,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(output), 200


# DELETE /api/reviews/reported/<id> -> L'admin elimina la recensione segnalata
@reviews_bp.route('/reported/<int:review_id>', methods=['DELETE'])
@token_required(required_role="admin")
def delete_reported_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Recensione non trovata"}), 404
        
    try:
        db.session.delete(review)
        db.session.commit()
        return jsonify({"message": "Recensione rimossa permanentemente dall'Amministratore"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Errore durante l'eliminazione: {str(e)}"}), 500