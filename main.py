from flask import Flask, render_template, request, jsonify
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

@app.route('/save_code', methods=['POST'])
def save_code():
    app.logger.debug('Saving code changes')
    try:
        new_code = request.json.get('code')
        if new_code:
            with open('static/js/game.js', 'w') as file:
                file.write(new_code)
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'No code provided'}), 400
    except Exception as e:
        app.logger.error(f'Error saving code: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)