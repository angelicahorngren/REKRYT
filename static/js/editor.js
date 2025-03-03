// Initialize Ace editor
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/javascript");

// Keep track of high score
let highScore = 0;

document.getElementById('applyChanges').addEventListener('click', () => {
    try {
        // Get the edited code
        const newCode = editor.getValue();
        
        // Create a new Function from the code to validate syntax
        new Function(newCode);
        
        // If validation passes, apply the changes
        localStorage.setItem('gameCode', newCode);
        location.reload(); // Reload to apply changes
    } catch (error) {
        // Show error message if code is invalid
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.classList.remove('d-none');
    }
});

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
