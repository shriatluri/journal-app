from flask import Flask
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from mongoengine import connect
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
CORS(app)
jwt = JWTManager(app)

# Connect to MongoDB
connect(host=Config.MONGODB_URI)

# Register blueprints
from routes.auth import auth_bp
from routes.journal import journal_bp
from routes.growth import growth_bp
from routes.user import user_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(journal_bp, url_prefix='/api/journal')
app.register_blueprint(growth_bp, url_prefix='/api/growth')
app.register_blueprint(user_bp, url_prefix='/api/user')


@app.route('/health')
def health_check():
    return {'status': 'healthy'}, 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)
