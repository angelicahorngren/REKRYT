from flask import Flask, render_template
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET")

@app.route('/')
def index():
    app.logger.debug('Rendering index page')
    return render_template('index.html')

@app.route('/editor')
def editor():
    app.logger.debug('Rendering editor page')
    # Read the game.js file content
    with open('static/js/game.js', 'r') as file:
        code = file.read()
    return render_template('editor.html', code=code)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)