class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game properties
        this.player = {
            x: 100,
            y: this.height - 50,
            size: 30,
            velocityY: 0,
            gravity: 0.8,
            jumpForce: -15,
            isJumping: false
        };
        
        this.gameSpeed = 5;
        this.score = 0;
        this.obstacles = [];
        this.isGameOver = false;
        this.groundLevel = this.height - 50;
        
        // Bind event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('restartButton').addEventListener('click', this.restart.bind(this));
        
        // Start the game loop
        this.lastTime = 0;
        this.animate(0);
        
        // Initialize first obstacle
        this.addObstacle();
    }
    
    handleKeyDown(event) {
        if (event.code === 'Space' && !this.player.isJumping && !this.isGameOver) {
            this.jump();
        }
    }
    
    handleClick() {
        if (!this.player.isJumping && !this.isGameOver) {
            this.jump();
        }
    }
    
    jump() {
        this.player.velocityY = this.player.jumpForce;
        this.player.isJumping = true;
    }
    
    addObstacle() {
        const types = ['spike', 'block'];
        const type = types[Math.floor(Math.random() * types.length)];
        const obstacle = {
            x: this.width,
            y: this.groundLevel,
            width: 30,
            height: type === 'spike' ? 30 : 50,
            type: type
        };
        this.obstacles.push(obstacle);
    }
    
    update(deltaTime) {
        if (this.isGameOver) return;
        
        // Update player
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;
        
        // Ground collision
        if (this.player.y > this.groundLevel - this.player.size) {
            this.player.y = this.groundLevel - this.player.size;
            this.player.velocityY = 0;
            this.player.isJumping = false;
        }
        
        // Update obstacles
        this.obstacles.forEach(obstacle => {
            obstacle.x -= this.gameSpeed;
        });
        
        // Remove off-screen obstacles
        this.obstacles = this.obstacles.filter(obstacle => obstacle.x > -obstacle.width);
        
        // Add new obstacles
        if (this.obstacles.length < 3 && 
            this.obstacles[this.obstacles.length - 1].x < this.width - 300) {
            this.addObstacle();
        }
        
        // Update score
        this.score += this.gameSpeed * 0.1;
        document.getElementById('currentScore').textContent = Math.floor(this.score);
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        const playerHitbox = {
            x: this.player.x,
            y: this.player.y,
            width: this.player.size,
            height: this.player.size
        };
        
        for (const obstacle of this.obstacles) {
            if (this.intersects(playerHitbox, obstacle)) {
                this.gameOver();
                break;
            }
        }
    }
    
    intersects(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y &&
               rect1.y + rect1.height > rect2.y - rect2.height;
    }
    
    gameOver() {
        this.isGameOver = true;
        document.getElementById('gameOverScreen').classList.remove('d-none');
        document.getElementById('finalScore').textContent = Math.floor(this.score);
    }
    
    restart() {
        // Reset game state
        this.player.y = this.height - 50;
        this.player.velocityY = 0;
        this.player.isJumping = false;
        this.obstacles = [];
        this.score = 0;
        this.isGameOver = false;
        document.getElementById('gameOverScreen').classList.add('d-none');
        document.getElementById('currentScore').textContent = '0';
        this.addObstacle();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw ground
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, this.groundLevel, this.width, 2);
        
        // Draw player
        this.ctx.fillStyle = '#0d6efd';
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.size,
            this.player.size
        );
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => {
            this.ctx.fillStyle = '#dc3545';
            if (obstacle.type === 'spike') {
                this.ctx.beginPath();
                this.ctx.moveTo(obstacle.x, obstacle.y);
                this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y - obstacle.height);
                this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
                this.ctx.closePath();
                this.ctx.fill();
            } else {
                this.ctx.fillRect(
                    obstacle.x,
                    obstacle.y - obstacle.height,
                    obstacle.width,
                    obstacle.height
                );
            }
        });
    }
    
    animate(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});
