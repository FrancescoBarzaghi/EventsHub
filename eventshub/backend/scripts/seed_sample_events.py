import os
import sys
from datetime import datetime

# Assicuriamoci di poter importare il package app indipendentemente dalla directory corrente
ROOT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_PATH not in sys.path:
    sys.path.insert(0, ROOT_PATH)

from app import create_app, db
from app.models import Event, User

SAMPLE_ORGANIZER = {
    "id": "seed_organizer_default",
    "username": "seed_organizer",
    "email": "seed_organizer@eventshub.local",
    "role": "organizer"
}

SAMPLE_EVENTS = [
    {
        "title": "Festival Jazz Italiano 2026",
        "description": "Concerto all'aperto con i più grandi artisti jazz nazionali e internazionali.",
        "date": "2026-09-12 20:00:00",
        "location": "Milano",
        "category": "Musica",
        "price": 45.0,
        "total_slots": 220,
        "available_slots": 180,
        "image_path": "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800"
    },
    {
        "title": "Conferenza Tech Future 2026",
        "description": "Due giorni di talk e networking dedicati all'intelligenza artificiale e ai nuovi modelli digitali.",
        "date": "2026-08-05 09:30:00",
        "location": "Roma",
        "category": "Tecnologia",
        "price": 120.0,
        "total_slots": 350,
        "available_slots": 280,
        "image_path": "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=800"
    },
    {
        "title": "Workshop Cucina Vegana Milano",
        "description": "Laboratorio pratico con chef professionisti per imparare ricette vegane creative.",
        "date": "2026-07-22 18:00:00",
        "location": "Milano",
        "category": "Gastronomia",
        "price": 75.0,
        "total_slots": 60,
        "available_slots": 46,
        "image_path": "https://images.unsplash.com/photo-1495197359483-fbfff26f2e24?w=800"
    },
    {
        "title": "Mostra Arte Contemporanea Venezia",
        "description": "Una selezione di opere contemporanee da artisti emergenti e affermati.",
        "date": "2026-10-01 11:00:00",
        "location": "Venezia",
        "category": "Arte",
        "price": 0.0,
        "total_slots": 200,
        "available_slots": 200,
        "image_path": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800"
    },
    {
        "title": "Maratona di Roma 2026",
        "description": "Una giornata di sport e solidarietà attraverso le vie storiche della Capitale.",
        "date": "2026-11-07 08:00:00",
        "location": "Roma",
        "category": "Sport",
        "price": 50.0,
        "total_slots": 500,
        "available_slots": 412,
        "image_path": "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800"
    },
    {
        "title": "Teatro: La Traviata Verona",
        "description": "Una serata lirica nell'antico anfiteatro di Verona con cast internazionale.",
        "date": "2026-09-30 21:00:00",
        "location": "Verona",
        "category": "Teatro",
        "price": 95.0,
        "total_slots": 180,
        "available_slots": 150,
        "image_path": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800"
    }
]


def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        organizer = db.session.get(User, SAMPLE_ORGANIZER['id'])
        if not organizer:
            organizer = User(
                id=SAMPLE_ORGANIZER['id'],
                username=SAMPLE_ORGANIZER['username'],
                email=SAMPLE_ORGANIZER['email'],
                role=SAMPLE_ORGANIZER['role']
            )
            db.session.add(organizer)
            db.session.commit()

        existing_event_count = Event.query.count()
        if existing_event_count >= 6:
            print(f"Sono già presenti {existing_event_count} eventi nel database. Nessun seed necessario.")
            return

        for event_data in SAMPLE_EVENTS:
            if Event.query.filter_by(title=event_data['title']).first():
                continue
            new_event = Event(
                title=event_data['title'],
                description=event_data['description'],
                date=datetime.fromisoformat(event_data['date']),
                location=event_data['location'],
                category=event_data['category'],
                price=event_data['price'],
                total_slots=event_data['total_slots'],
                available_slots=event_data['available_slots'],
                image_path=event_data['image_path'],
                organizer_id=SAMPLE_ORGANIZER['id']
            )
            db.session.add(new_event)

        db.session.commit()
        print(f"Seed completato: inseriti {Event.query.count() - existing_event_count} nuovi eventi.")


if __name__ == '__main__':
    seed()
