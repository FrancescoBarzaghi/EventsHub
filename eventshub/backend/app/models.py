from datetime import datetime
from app import db

# Tabella di associazione (Many-to-Many) tra Utenti e Eventi per le iscrizioni (Biglietti)
class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    qr_code = db.Column(db.String(255), nullable=False, unique=True)  # Stringa o hash per generare il QR 
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = db.relationship('User', back_populates='tickets')
    event = db.relationship('Event', back_populates='tickets')


# Modello Utente (Sincronizzato con i ruoli e l'autenticazione)
class User(db.Model):
    __tablename__ = 'users'
    
    # Usiamo una stringa come ID perché Keycloak genera degli UUID in formato stringa
    id = db.Column(db.String(255), primary_key=True) 
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Ruoli previsti: 'user', 'organizer', 'admin' [cite: 29]
    role = db.Column(db.String(20), default='user', nullable=False) 
    is_banned = db.Column(db.Boolean, default=False, nullable=False)  # Per la gestione admin [cite: 19]
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relazioni
    tickets = db.relationship('Ticket', back_populates='user', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='user', cascade="all, delete-orphan")


# Modello Evento
class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)  # [cite: 7]
    date = db.Column(db.DateTime, nullable=False)  # [cite: 7]
    location = db.Column(db.String(150), nullable=False)  # Città/Luogo [cite: 7]
    category = db.Column(db.String(50), nullable=False)  # concerto, workshop, ecc. [cite: 2, 8]
    price = db.Column(db.Float, default=0.0, nullable=False)  # [cite: 8]
    total_slots = db.Column(db.Integer, nullable=False)  # Posti totali iniziali
    available_slots = db.Column(db.Integer, nullable=False)  # Posti ancora liberi [cite: 7, 11]
    image_path = db.Column(db.String(255), nullable=True)  # Path del file locale dell'immagine (NON URL) [cite: 15]
    organizer_id = db.Column(db.String(255), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relazioni
    tickets = db.relationship('Ticket', back_populates='event', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='event', cascade="all, delete-orphan")


# Modello Recensione
class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Rating da 1 a 5 
    comment = db.Column(db.Text, nullable=False)  # 
    is_reported = db.Column(db.Boolean, default=False, nullable=False)  # Segnalata per moderazione admin [cite: 20]
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relazioni
    user = db.relationship('User', back_populates='reviews')
    event = db.relationship('Event', back_populates='reviews')