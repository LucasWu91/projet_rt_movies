from flask import Flask, render_template, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# MongoDB connection
# MongoDB connection (Docker-friendly)
MONGO_URI = os.getenv("MONGODB_URI", os.getenv("MONGO_URI", "mongodb://mongo:27017/"))
DB_NAME = os.getenv("MONGODB_DB", "rt2025")
COLL_NAME = os.getenv("MONGODB_COLLECTION", "movies")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
movies_collection = db[COLL_NAME]

@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    """Get general statistics about the movies"""
    try:
        total_movies = movies_collection.count_documents({})
        
        # Calculate averages
        pipeline = [
            {
                '$group': {
                    '_id': None,
                    'avg_tomatometer': {'$avg': '$tomatometer'},
                    'avg_audience': {'$avg': '$audience_score'},
                    'max_tomatometer': {'$max': '$tomatometer'},
                    'max_audience': {'$max': '$audience_score'},
                    'min_tomatometer': {'$min': '$tomatometer'},
                    'min_audience': {'$min': '$audience_score'}
                }
            }
        ]
        
        result = list(movies_collection.aggregate(pipeline))
        stats = result[0] if result else {}
        
        return jsonify({
            'total_movies': total_movies,
            'avg_tomatometer': round(stats.get('avg_tomatometer', 0), 1),
            'avg_audience': round(stats.get('avg_audience', 0), 1),
            'max_tomatometer': stats.get('max_tomatometer', 0),
            'max_audience': stats.get('max_audience', 0),
            'min_tomatometer': stats.get('min_tomatometer', 0),
            'min_audience': stats.get('min_audience', 0)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/movies')
def get_movies():
    """Get all movies with optional sorting"""
    try:
        movies = list(movies_collection.find(
            {},
            {'_id': 0}
        ).sort('tomatometer', -1))
        
        return jsonify(movies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/top-movies/<int:limit>')
def get_top_movies(limit=10):
    """Get top movies by tomatometer score"""
    try:
        movies = list(movies_collection.find(
            {},
            {'_id': 0, 'title': 1, 'tomatometer': 1, 'audience_score': 1}
        ).sort('tomatometer', -1).limit(limit))
        
        return jsonify(movies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/distribution')
def get_distribution():
    """Get score distribution for charts"""
    try:
        # Tomatometer distribution (by ranges)
        tomatometer_pipeline = [
            {
                '$bucket': {
                    'groupBy': '$tomatometer',
                    'boundaries': [0, 20, 40, 60, 80, 100, 101],
                    'default': 'Other',
                    'output': {
                        'count': {'$sum': 1}
                    }
                }
            }
        ]
        
        tomatometer_dist = list(movies_collection.aggregate(tomatometer_pipeline))
        
        # Audience score distribution
        audience_pipeline = [
            {
                '$bucket': {
                    'groupBy': '$audience_score',
                    'boundaries': [0, 20, 40, 60, 80, 100, 101],
                    'default': 'Other',
                    'output': {
                        'count': {'$sum': 1}
                    }
                }
            }
        ]
        
        audience_dist = list(movies_collection.aggregate(audience_pipeline))
        
        return jsonify({
            'tomatometer': tomatometer_dist,
            'audience': audience_dist
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/comparison')
def get_comparison():
    """Get data for tomatometer vs audience score comparison"""
    try:
        movies = list(movies_collection.find(
            {},
            {'_id': 0, 'title': 1, 'tomatometer': 1, 'audience_score': 1}
        ))
        
        return jsonify(movies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        return jsonify({
            'status': 'healthy',
            'mongodb': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8050, debug=True)
