// Add logging for debugging
console.log('Game script loaded');

class Game {
    constructor() {
        console.log('Initializing game');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        console.log('Canvas context created');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Initialize player with explicit dimensions
        this.player = {
            x: 100,
            y: this.height - 50,
            width: 30,
            height: 30,
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

        // Add event listeners
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        document.getElementById('restartButton').addEventListener('click', this.restart.bind(this));

        this.lastTime = 0;
        console.log('Game initialized successfully');
        this.addObstacle();
        requestAnimationFrame(this.animate.bind(this));
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
        console.log('Jump triggered');
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
        console.log('Added obstacle:', obstacle);
    }

    update(deltaTime) {
        if (this.isGameOver) return;

        // Update player position
        this.player.velocityY += this.player.gravity;
        this.player.y += this.player.velocityY;

        // Ground collision
        if (this.player.y > this.groundLevel - this.player.height) {
            this.player.y = this.groundLevel - this.player.height;
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
            (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < this.width - 300)) {
            this.addObstacle();
        }

        // Update score
        this.score += this.gameSpeed * 0.1;
        document.getElementById('currentScore').textContent = Math.floor(this.score);

        this.checkCollisions();
    }

    checkCollisions() {
        for (const obstacle of this.obstacles) {
            const collision = this.player.x < obstacle.x + obstacle.width &&
                            this.player.x + this.player.width > obstacle.x &&
                            this.player.y < obstacle.y + obstacle.height &&
                            this.player.y + this.player.height > obstacle.y;

            if (collision) {
                console.log('Collision detected');
                this.gameOver();
                break;
            }
        }
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('gameOverScreen').classList.remove('d-none');
        document.getElementById('finalScore').textContent = Math.floor(this.score);
    }

    restart() {
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
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw ground
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, this.groundLevel, this.width, 2);

        // Draw player
        this.ctx.fillStyle = '#0d6efd';
        this.ctx.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
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

window.addEventListener('load', () => {
    console.log('Window loaded, creating game instance');
    new Game();
});