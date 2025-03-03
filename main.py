from flask import Flask, render_template, request, jsonify
import os
import logging
import re

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

    # Extract only the player properties section
    player_props_pattern = r'this\.player = \{[^}]+\};'
    match = re.search(player_props_pattern, code)
    if match:
        player_props = match.group(0)
        # Format the code nicely
        player_props = player_props.replace('this.player = ', '')
        player_props = player_props.strip(';')
    else:
        player_props = '{}'

    return render_template('editor.html', code=player_props)

@app.route('/save_code', methods=['POST'])
def save_code():
    app.logger.debug('Saving code changes')
    try:
        new_player_props = request.json.get('code')
        if new_player_props:
            # Read the current game.js
            with open('static/js/game.js', 'r') as file:
                full_code = file.read()

            # Replace the player properties section
            updated_code = re.sub(
                r'this\.player = \{[^}]+\};',
                f'this.player = {new_player_props};',
                full_code
            )

            # Save the updated code
            with open('static/js/game.js', 'w') as file:
                file.write(updated_code)

            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'No code provided'}), 400
    except Exception as e:
        app.logger.error(f'Error saving code: {str(e)}')
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)