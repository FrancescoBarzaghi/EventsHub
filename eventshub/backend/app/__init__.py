from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    
    # Abilitiamo i CORS su tutta l'applicazione
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configurazione di base per Flask
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'eventhub_super_secret_key_123')
    
    # Importiamo SOLO il blueprint di auth che abbiamo effettivamente scritto
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    # COMMENTATI TEMPORANEAMENTE (perché i file sono vuoti e bloccavano l'avvio)
    # from app.routes.events import events_bp
    # from app.routes.reviews import reviews_bp
    # from app.routes.tickets import tickets_bp
    # app.register_blueprint(events_bp, url_prefix='/api/events')
    # app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    # app.register_blueprint(tickets_bp, url_prefix='/api/tickets')

    @app.route('/')
    def index():
        return {"message": "EventHub Backend API is running (Auth only)!"}, 200

    return app