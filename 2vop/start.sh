#!/bin/bash

# Create the database directory if it doesn't exist
mkdir -p instance

# Initialize the database
python3 -c "
import sqlite3
import os

# Create database directory if it doesn't exist
os.makedirs('instance', exist_ok=True)

# Connect to the database (this will create it if it doesn't exist)
db_path = os.path.join('instance', 'typing.db')
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Create tables if they don't exist
c.execute('''CREATE TABLE IF NOT EXISTS stats
             (user_id TEXT, wpm INTEGER, accuracy INTEGER, errors INTEGER, timestamp TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS quotes
             (quote TEXT)''')

# Commit changes and close the connection
conn.commit()
conn.close()
print(f'Database initialized at {db_path}')
"
app = Flask(__name__, static_folder=str(BASE_DIR / 'static'), static_url_path='/static')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)
# Dependencies are installed by render.yaml's buildCommand
# pip install -r requirements.txt # This line can be removed

# Run the application
exec gunicorn --bind 0.0.0.0:$PORT app:app
