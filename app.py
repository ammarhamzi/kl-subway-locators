from flask import Flask, jsonify, render_template, request
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy import create_engine
from models import SubwayOutlet, Base
from flask_cors import CORS
from transformers import pipeline
from geopy.distance import geodesic

app = Flask(__name__)
CORS(app)

engine = create_engine('sqlite:///subway_outlets.db', connect_args={"check_same_thread": False})
Base.metadata.bind = engine
DBSession = scoped_session(sessionmaker(bind=engine))
session = DBSession()

# Load a pre-trained NLP model
nlp = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/outlets', methods=['GET'])
def get_outlets():
    try:
        outlets = session.query(SubwayOutlet).all()
        result = [
            {
                'name': outlet.name,
                'address': outlet.address,
                'operating_hours': outlet.operating_hours,
                'waze_link': outlet.waze_link,
                'latitude': outlet.latitude,
                'longitude': outlet.longitude
            } for outlet in outlets
        ]
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/outlets/search/', methods=['GET'])
def search_outlets():
    try:
        keyword = request.args.get('keyword', '').lower()
        
        outlets = session.query(SubwayOutlet).filter(SubwayOutlet.name.ilike(f'%{keyword}%')).all()
        
        filtered_outlets = [
            {
                'name': outlet.name,
                'address': outlet.address,
                'operating_hours': outlet.operating_hours,
                'waze_link': outlet.waze_link,
                'latitude': outlet.latitude,
                'longitude': outlet.longitude
            } for outlet in outlets
        ]
        
        return jsonify(filtered_outlets)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/query', methods=['POST'])
def handle_query():
    try:
        data = request.get_json()
        question = data['question']

        # Get all outlets data
        outlets = session.query(SubwayOutlet).all()
        context = " ".join([f"{outlet.name} is located at {outlet.address}. " for outlet in outlets])

        # Use NLP model to find the answer
        nlp_result = nlp(question=question, context=context)['answer']

        # Special handling
        if "how many outlets in" in question.lower():
            location = question.split("in")[-1].strip()
            count = sum(1 for outlet in outlets if location.lower() in outlet.address.lower())
            answer = f"There are {count} outlets in {location}."
        elif "shortest distance between outlets" in question.lower():
            min_distance = float('inf')
            outlet_pair = None
            for i in range(len(outlets)):
                for j in range(i + 1, len(outlets)):
                    loc1 = (outlets[i].latitude, outlets[i].longitude)
                    loc2 = (outlets[j].latitude, outlets[j].longitude)
                    distance = geodesic(loc1, loc2).meters
                    if distance < min_distance:
                        min_distance = distance
                        outlet_pair = (outlets[i].name, outlets[j].name)
            answer = f"The shortest distance is between {outlet_pair[0]} and {outlet_pair[1]}, which is {min_distance} meters."
        else:
            answer = nlp_result

        return jsonify({'answer': answer})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
