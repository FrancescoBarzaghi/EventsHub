import os
from flask import Blueprint, jsonify, request, current_app, send_from_directory
from werkzeug.utils import secure_filename
from app import db
from app.models import Event
from app.decorators import token_required
from datetime import datetime

events_bp = Blueprint('events', __name__)

@events_bp.route('/images/<filename>', methods=['GET'])
def get_image(filename):
    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'],
        filename
    )

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

# =========================================================================
# 1. ROTTE PUBBLICHE (Accessibili da chiunque senza token)
# =========================================================================

# GET http://localhost:5000/api/events - Lista ed esplorazione con filtri avanzati
@events_bp.route('', methods=['GET'])
def get_events():
    query = Event.query

    # Filtro dinamico per Città/Luogo
    location = request.args.get('location')
    if location:
        query = query.filter(Event.location.like(f"%{location}%"))

    # Filtro dinamico per Categoria
    category = request.args.get('category')
    if category:
        query = query.filter(Event.category == category)

    # Filtro dinamico per Prezzo Massimo
    max_price = request.args.get('max_price')
    if max_price:
        try:
            query = query.filter(Event.price <= float(max_price))
        except ValueError:
            pass

    # Filtro dinamico per Data
    start_date = request.args.get('start_date')
    if start_date:
        try:
            date_obj = datetime.strptime(start_date, '%Y-%m-%d')
            query = query.filter(Event.date >= date_obj)
        except ValueError:
            pass
    else:
        query = query.filter(Event.date >= datetime.utcnow())

    events = query.order_by(Event.date.asc()).all()

    output = []
    for event in events:
        output.append({
            "id": event.id,
            "title": event.title,
            "description": event.description,
            "date": event.date.strftime('%Y-%m-%d %H:%M:%S'),
            "location": event.location,
            "category": event.category,
            "price": event.price,
            "total_slots": event.total_slots,
            "available_slots": event.available_slots,
            "image_path": (
                f"/api/events/images/{os.path.basename(event.image_path)}"
                if event.image_path else None
            )
        })

    return jsonify(output), 200


# GET http://localhost:5000/api/events/<id>
@events_bp.route('/<int:event_id>', methods=['GET'])
def get_event_detail(event_id):
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento non trovato"}), 404

    return jsonify({
        "id": event.id,
        "title": event.title,
        "description": event.description,
        "date": event.date.strftime('%Y-%m-%d %H:%M:%S'),
        "location": event.location,
        "category": event.category,
        "price": event.price,
        "total_slots": event.total_slots,
        "available_slots": event.available_slots,
        "image_path": (
            f"/api/events/images/{os.path.basename(event.image_path)}"
            if event.image_path else None
        ),
        "organizer_id": event.organizer_id
    }), 200


# =========================================================================
# 2. ROTTE PROTETTE (Richiedono il ruolo "organizer" o "admin")
# =========================================================================

@events_bp.route('', methods=['POST'])
@token_required(required_role="organizer")
def create_event():

    current_user_id = request.user_info.get("sub")
    username_organizer = request.user_info.get("preferred_username")

    title = request.form.get('title')
    description = request.form.get('description')
    date_str = request.form.get('date')
    location = request.form.get('location')
    category = request.form.get('category')
    price = request.form.get('price', 0.0)
    total_slots = request.form.get('total_slots')

    if not all([title, description, date_str, location, category, total_slots]):
        return jsonify({"error": "Tutti i campi obbligatori devono essere compilati"}), 400

    image_filename = None

    if 'image' in request.files:
        file = request.files['image']

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{int(datetime.utcnow().timestamp())}_{filename}"

            file.save(
                os.path.join(
                    current_app.config['UPLOAD_FOLDER'],
                    unique_filename
                )
            )

            image_filename = f"static/uploads/{unique_filename}"

    try:
        event_date = datetime.strptime(date_str, '%Y-%m-%d %H:%M')
        slots = int(total_slots)

        new_event = Event(
            title=title,
            description=description,
            date=event_date,
            location=location,
            category=category,
            price=float(price),
            total_slots=slots,
            available_slots=slots,
            image_path=image_filename,
            organizer_id=current_user_id
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify({
            "message": f"Evento creato con successo dall'organizzatore: {username_organizer}",
            "event_id": new_event.id
        }), 201

    except Exception as e:
        db.session.rollback()

        return jsonify({
            "error": f"Errore interno nel salvataggio su database: {str(e)}"
        }), 500


@events_bp.route('/<int:event_id>', methods=['PUT'])
@token_required(required_role="organizer")
def update_event(event_id):

    current_user_id = request.user_info.get("sub")
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento non trovato"}), 404

    if event.organizer_id != current_user_id:
        return jsonify({"error": "Non sei autorizzato a modificare questo evento"}), 403

    event.title = request.form.get('title', event.title)
    event.description = request.form.get('description', event.description)
    event.location = request.form.get('location', event.location)
    event.category = request.form.get('category', event.category)

    if request.form.get('price'):
        event.price = float(request.form.get('price'))

    if request.form.get('date'):
        try:
            event.date = datetime.strptime(
                request.form.get('date'),
                '%Y-%m-%d %H:%M'
            )
        except ValueError:
            return jsonify({
                "error": "Formato data non valido. Usa YYYY-MM-DD HH:MM"
            }), 400

    if 'image' in request.files:
        file = request.files['image']

        if file and allowed_file(file.filename):

            if event.image_path:
                old_path = os.path.join(
                    current_app.root_path,
                    'app',
                    event.image_path
                )

                if os.path.exists(old_path):
                    os.remove(old_path)

            filename = secure_filename(file.filename)
            unique_filename = f"{int(datetime.utcnow().timestamp())}_{filename}"

            file.save(
                os.path.join(
                    current_app.config['UPLOAD_FOLDER'],
                    unique_filename
                )
            )

            event.image_path = f"static/uploads/{unique_filename}"

    db.session.commit()

    return jsonify({
        "message": "Evento aggiornato con successo"
    }), 200


@events_bp.route('/<int:event_id>', methods=['DELETE'])
@token_required(required_role="organizer")
def delete_event(event_id):

    current_user_id = request.user_info.get("sub")
    event = Event.query.get(event_id)

    if not event:
        return jsonify({"error": "Evento non trovato"}), 404

    if event.organizer_id != current_user_id:
        return jsonify({
            "error": "Non sei autorizzato a eliminare questo evento"
        }), 403

    if event.image_path:
        img_path = os.path.join(
            current_app.root_path,
            'app',
            event.image_path
        )

        if os.path.exists(img_path):
            os.remove(img_path)

    db.session.delete(event)
    db.session.commit()

    return jsonify({
        "message": "Evento eliminato definitivamente dal sistema"
    }), 200