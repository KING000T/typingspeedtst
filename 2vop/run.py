import os
from app import app

if __name__ == '__main__':
    # Create instance directory if it doesn't exist
    os.makedirs('instance', exist_ok=True)
    
    # Run the Flask app
    app.run(debug=True, port=5000)
