from app import create_app

app = create_app()

if __name__ == '__main__':
    # Facciamo partire Flask sulla porta 5000 (quella mappata nel frontend)
    app.run(host='0.0.0.0', port=5000, debug=True)