import requests
from bs4 import BeautifulSoup
import googlemaps
from sqlalchemy.orm import sessionmaker
from models import SubwayOutlet, Base
from sqlalchemy import create_engine
from config import GOOGLE_MAPS_API_KEY

# Initialize Google Maps client
gmaps = googlemaps.Client(key=GOOGLE_MAPS_API_KEY)

def get_geocode(address):
    geocode_result = gmaps.geocode(address)
    if geocode_result:
        location = geocode_result[0]['geometry']['location']
        return location['lat'], location['lng']
    return None, None

def get_subway_outlets():
    base_url = 'https://subway.com.my/find-a-subway'
    params = {'search': 'kuala lumpur'}
    response = requests.get(base_url, params=params)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    outlets = []
    for outlet in soup.select('.outlet-item'):
        name = outlet.select_one('.outlet-name').text.strip()
        address = outlet.select_one('.outlet-address').text.strip()
        operating_hours = outlet.select_one('.outlet-hours').text.strip()
        waze_link = outlet.select_one('.waze-link')['href']
        
        lat, lng = get_geocode(address)
        
        outlets.append({
            'name': name,
            'address': address,
            'operating_hours': operating_hours,
            'waze_link': waze_link,
            'latitude': lat,
            'longitude': lng
        })

    return outlets

def store_outlets(outlets):
    engine = create_engine('sqlite:///subway_outlets.db')
    Base.metadata.bind = engine
    DBSession = sessionmaker(bind=engine)
    session = DBSession()
    for outlet in outlets:
        new_outlet = SubwayOutlet(**outlet)
        session.add(new_outlet)
    session.commit()

if __name__ == "__main__":
    outlets = get_subway_outlets()
    store_outlets(outlets)
