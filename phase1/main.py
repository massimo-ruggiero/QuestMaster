from flask import Flask
from endpoints import init_endpoints

def create_app():
    app = Flask(__name__)
    init_endpoints(app)
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=5001, debug=True)