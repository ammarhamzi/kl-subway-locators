# Subway Locators

This project visualizes Subway outlets in KL on a map and highlights intersections between their catchment areas.

## Getting Started

Follow these instructions to set up the project on your local machine.

## Technologies Used

- **Python**: For web scraping and storing data in SQLite.
- **FastAPI**: To handle API requests.
- **Bootstrap**: For the frontend interface.
- **NLP**: To handle user queries.
- **Geocoding**: To display maps and mark the location of the outlets on the map.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ammarhamzi/kl-subway-locators.git
   cd kl-subway-locators
   ```

2. **Set up a virtual environment in VSCode:**

   - Open the command palette with `Ctrl+Shift+P`.
   - Search for and select `Python: Create Environment`.
   - Choose `Virtualenv` and then select the Python interpreter you want to use. (Pyhton11 waas used during development)

3. **Activate the virtual environment:**

   ```bash
   .venv\Scripts\activate
   ```

4. **Install the required packages:**

   Open the terminal in VSCode and run:

   ```bash
   pip install -r requirements.txt
   ```

5. **Create config.py to store your Google Maps API key:**

Create a file named config.py in the root directory of your project and add the following code:
```bash
GOOGLE_MAPS_API_KEY = 'your_api_key_here'
Create config.js to store your Google Maps API key:
```
6. **Create a file named config.js in the root directory of your project and add the following code:**

```bash
module.exports = {
  googleMapsApiKey: 'your_api_key_here',
};
```

7. **Run the application:**

   ```bash
   python app.py
   ```

## Usage

- Open your browser and navigate to `http://127.0.0.1:5000` to view the application.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License.
