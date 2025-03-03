// Initialize Ace editor
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

document.getElementById('applyChanges').addEventListener('click', () => {
    try {
        // Get the edited code
        const newCode = editor.getValue();

        // Validate the object syntax
        const mockContext = { height: 400 };
        const playerProps = new Function(`
            let game = { height: 400 };  // Mock the game context
            ${newCode}
            return game.player;
        `)();

        // Check required properties
        const requiredProps = ['x', 'y', 'width', 'height', 'velocityY', 'gravity', 'jumpForce', 'isJumping'];
        const missingProps = requiredProps.filter(prop => !(prop in playerProps));

        if (missingProps.length > 0) {
            throw new Error(`Missing required properties: ${missingProps.join(', ')}`);
        }

        // Send to server
        fetch('/save_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: newCode })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.href = '/'; // Redirect to game page
            } else {
                throw new Error(data.error || 'Failed to save changes');
            }
        })
        .catch(error => {
            const errorMessage = document.getElementById('errorMessage');
            errorMessage.textContent = `Error: ${error.message}`;
            errorMessage.classList.remove('d-none');
        });
    } catch (error) {
        // Show error message if code is invalid
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.classList.remove('d-none');
    }
});

// Keep track of high score
let highScore = 0;

// Update high score when game ends
window.addEventListener('gameOver', (e) => {
    const score = e.detail.score;
    if (score > highScore) {
        highScore = score;
        document.getElementById('highScore').textContent = Math.floor(highScore);
        localStorage.setItem('highScore', highScore);
    }
});

// Load high score on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
        highScore = parseInt(savedHighScore);
        document.getElementById('highScore').textContent = Math.floor(highScore);
    }
});