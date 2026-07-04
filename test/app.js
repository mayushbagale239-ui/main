/* ==========================================================================
   Nexus Arena JavaScript Core
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Navigation & Mobile Menu Toggle
    initNavigation();

    // 2. Count-Up Stats Animation
    initStatsCounter();

    // 3. Tournament Tabs & Interactive Bracket
    initTournaments();

    // 4. Newsletter Form Validation
    initNewsletter();

    // 5. Canvas Mini-Game (Nexus Defender)
    initMiniGame();
});

/* ==========================================================================
   Navigation Features
   ========================================================================== */
function initNavigation() {
    const header = document.querySelector('.main-header');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Header background change on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(3, 4, 8, 0.95)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            header.style.background = 'rgba(4, 5, 10, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    // Mobile menu toggle
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Simple scroll spy to highlight nav active state
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   Count-Up Stats Animation
   ========================================================================== */
function initStatsCounter() {
    const statsSection = document.getElementById('home');
    const numbers = document.querySelectorAll('.stat-number');
    let animated = false;

    const startCounting = () => {
        numbers.forEach(num => {
            const target = parseInt(num.getAttribute('data-target'), 10);
            let count = 0;
            const duration = 2000; // 2 seconds
            const startTime = performance.now();

            const updateCount = (timestamp) => {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Ease-out quad formula
                const easeProgress = progress * (2 - progress);
                count = Math.floor(easeProgress * target);
                
                // Format with commas
                num.innerText = count.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    num.innerText = target.toLocaleString() + (target === 124530 ? '+' : '');
                }
            };
            requestAnimationFrame(updateCount);
        });
    };

    // IntersectionObserver to start animation when section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                startCounting();
                animated = true;
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (statsSection) {
        observer.observe(statsSection);
    }
}

/* ==========================================================================
   Tournament Tab and Bracket Logic
   ========================================================================== */
function initTournaments() {
    // 1. Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 2. Bracket team interactive highlighting
    const teams = document.querySelectorAll('.bracket-container .team');
    teams.forEach(team => {
        team.addEventListener('click', () => {
            const teamId = team.getAttribute('data-team');
            const isActive = team.classList.contains('active-path');

            // Reset all highlights
            teams.forEach(t => t.classList.remove('active-path'));

            // Toggle highlight path if wasn't already active
            if (!isActive && teamId) {
                document.querySelectorAll(`.bracket-container .team[data-team="${teamId}"]`).forEach(t => {
                    t.classList.add('active-path');
                });
                
                // Update champion box dynamically if matches are won
                const isWinnerInSemi = team.classList.contains('winner');
                if (isWinnerInSemi) {
                    const champName = team.querySelector('.team-name').innerText;
                    const champBox = document.querySelector('.champion-box .champ-text');
                    
                    // Put that team in the finals slot in the bracket!
                    const finalsMatchup = document.querySelector('.champion-matchup');
                    const finalsTeams = finalsMatchup.querySelectorAll('.team');
                    
                    if (teamId === 'vortex' || teamId === 'aether') {
                        finalsTeams[0].querySelector('.team-name').innerText = champName;
                        finalsTeams[0].setAttribute('data-team', teamId);
                    } else {
                        finalsTeams[1].querySelector('.team-name').innerText = champName;
                        finalsTeams[1].setAttribute('data-team', teamId);
                    }

                    // Set high probability path
                    champBox.innerText = champName;
                    champBox.classList.add('text-gradient');
                }
            } else {
                document.querySelector('.champion-box .champ-text').innerText = "TBD";
                document.querySelector('.champion-box .champ-text').classList.remove('text-gradient');
            }
        });
    });

    // 3. Upcoming List Selection
    const upcomingItems = document.querySelectorAll('.upcoming-item');
    const selectedTitle = document.getElementById('selected-tournament-title');

    upcomingItems.forEach(item => {
        item.addEventListener('click', () => {
            upcomingItems.forEach(i => i.classList.remove('active-item'));
            item.classList.add('active-item');

            const gameName = item.getAttribute('data-game');
            const fullTitle = item.querySelector('h4').innerText;
            selectedTitle.innerText = fullTitle;
        });
    });

    // 4. Registration Submit Flow
    const tournamentForm = document.getElementById('tournament-form');
    if (tournamentForm) {
        tournamentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = tournamentForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            // Loading state
            submitBtn.disabled = true;
            submitBtn.innerText = "TRANSMITTING REGISTRATION...";

            setTimeout(() => {
                showToast(`Successfully registered for the ${selectedTitle.innerText}! Check your email for tournament key.`, 'success');
                tournamentForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }, 1200);
        });
    }
}

/* ==========================================================================
   Newsletter Features
   ========================================================================== */
function initNewsletter() {
    const newsForm = document.getElementById('subscribe-form');
    if (newsForm) {
        newsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('subscriber-email');
            const submitBtn = newsForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            submitBtn.disabled = true;
            submitBtn.innerText = "CONNECTING...";

            setTimeout(() => {
                showToast(`Welcome to the network! Neural drop codes sent to ${emailInput.value}`, 'info');
                newsForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }, 1000);
        });
    }
}

/* ==========================================================================
   Toast Notification Engine
   ========================================================================== */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '<i class="fa-solid fa-circle-check"></i>';
    if (type === 'error') {
        icon = '<i class="fa-solid fa-circle-exclamation"></i>';
    } else if (type === 'info') {
        icon = '<i class="fa-solid fa-satellite-dish"></i>';
    }

    toast.innerHTML = `
        ${icon}
        <div class="toast-content">${message}</div>
    `;

    container.appendChild(toast);

    // Fade and slide in
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Auto removal
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}

/* ==========================================================================
   Canvas Space Shooter Mini-Game: NEXUS DEFENDER
   ========================================================================== */
function initMiniGame() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const gameWrapper = document.querySelector('.game-screen-wrapper');
    const scoreDisplay = document.getElementById('game-score');
    const livesDisplay = document.getElementById('game-lives');
    const overlay = document.getElementById('game-overlay');
    const startBtn = document.getElementById('start-btn');
    const overlayTitle = document.getElementById('overlay-title');
    const overlayDesc = document.getElementById('overlay-desc');
    const highscoreDisplay = document.getElementById('player-high-score');

    // Game Variables
    let gameLoopId = null;
    let isPlaying = false;
    let isPaused = false;
    let score = 0;
    let lives = 3;
    let highscore = parseInt(localStorage.getItem('nexus_high_score') || '0', 10);
    
    // Screenshake
    let shakeIntensity = 0;
    let shakeDecay = 0.9;

    // Player Object
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 40,
        width: 38,
        height: 24,
        speed: 6,
        color: '#06b6d4'
    };

    // Keyboard states
    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        KeyA: false,
        KeyD: false,
        Space: false
    };

    // Arrays
    let bullets = [];
    let meteors = [];
    let particles = [];
    let stars = [];

    // Spawn parameters
    let spawnTimer = 0;
    let spawnInterval = 1000; // ms
    let lastTime = 0;

    // Load Highscore
    highscoreDisplay.innerText = highscore.toLocaleString();

    // Key handlers
    window.addEventListener('keydown', (e) => {
        if (e.code in keys) {
            keys[e.code] = true;
            // Prevent scroll on space
            if (e.code === 'Space' && isPlaying) {
                e.preventDefault();
            }
        }

        // Pause trigger
        if (e.code === 'KeyP' && isPlaying) {
            isPaused = !isPaused;
            if (isPaused) {
                showToast('Game Paused. Press P to resume.', 'info');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code in keys) {
            keys[e.code] = false;
        }
    });

    // Touch support (simple touch to pilot / auto-shoot)
    let touchX = null;
    canvas.addEventListener('touchmove', (e) => {
        if (!isPlaying) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        touchX = e.touches[0].clientX - rect.left;
        
        // Map to canvas width
        const ratio = canvas.width / rect.width;
        player.x = touchX * ratio;
        
        // Auto shoot on touch
        keys.Space = true;
    });

    canvas.addEventListener('touchend', () => {
        keys.Space = false;
    });

    // Start Button Trigger
    startBtn.addEventListener('click', () => {
        startGame();
    });

    // Setup stars background (static coordinate mapping, moving during animation)
    for (let i = 0; i < 40; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2,
            speed: Math.random() * 0.5 + 0.2
        });
    }

    function startGame() {
        overlay.classList.add('hidden');
        isPlaying = true;
        isPaused = false;
        score = 0;
        lives = 3;
        bullets = [];
        meteors = [];
        particles = [];
        spawnInterval = 1000;
        
        updateLivesUI();
        scoreDisplay.innerText = "00000";

        lastTime = performance.now();
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function triggerGameOver() {
        isPlaying = false;
        cancelAnimationFrame(gameLoopId);
        
        if (score > highscore) {
            highscore = score;
            localStorage.setItem('nexus_high_score', highscore);
            highscoreDisplay.innerText = highscore.toLocaleString();
            showToast(`NEW ARCADE HIGH SCORE: ${score.toLocaleString()} PTS!`, 'success');
        } else {
            showToast(`Game Over! You defended well and scored ${score.toLocaleString()} points.`, 'info');
        }

        overlayTitle.innerText = "GRID BREACHED";
        overlayDesc.innerText = `Defense systems disabled. Final Score: ${score.toLocaleString()}`;
        startBtn.innerText = "RELAUNCH SHIP";
        overlay.classList.remove('hidden');
    }

    function updateLivesUI() {
        let hearts = '';
        for (let i = 0; i < lives; i++) {
            hearts += '<i class="fa-solid fa-heart"></i>';
        }
        livesDisplay.innerHTML = hearts || '<span style="color:#ef4444">CRITICAL</span>';
    }

    // Shot cooldown
    let lastShotTime = 0;
    const shotCooldown = 220; // ms

    function shoot() {
        const now = performance.now();
        if (now - lastShotTime > shotCooldown) {
            bullets.push({
                x: player.x,
                y: player.y - 12,
                width: 3,
                height: 14,
                speed: 8
            });
            
            // Add miniature screenshake on shoot
            shakeIntensity = Math.max(shakeIntensity, 1.5);
            
            // Spark launch particles
            createExplosionParticles(player.x, player.y - 12, '#22d3ee', 4, 1.5);
            lastShotTime = now;
        }
    }

    // Exploding Particle System
    function createExplosionParticles(x, y, color, count = 12, speedMultiplier = 3) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = (Math.random() * 2 + 1) * speedMultiplier;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2.5 + 1,
                color: color,
                alpha: 1,
                life: 0,
                maxLife: Math.random() * 30 + 15
            });
        }
    }

    // Game Loop
    function gameLoop(timestamp) {
        if (!isPlaying) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (!isPaused) {
            update(deltaTime);
        }
        
        draw();

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    // Update States
    function update(deltaTime) {
        // 1. Screenshake Decay
        if (shakeIntensity > 0.1) {
            shakeIntensity *= shakeDecay;
        } else {
            shakeIntensity = 0;
        }

        // 2. Player Controls
        if (keys.ArrowLeft || keys.KeyA) {
            player.x -= player.speed;
        }
        if (keys.ArrowRight || keys.KeyD) {
            player.x += player.speed;
        }

        // Keep inside boundaries
        if (player.x < 15) player.x = 15;
        if (player.x > canvas.width - 15) player.x = canvas.width - 15;

        // shooting
        if (keys.Space) {
            shoot();
        }

        // 3. Move Bullets
        bullets.forEach((bullet, index) => {
            bullet.y -= bullet.speed;
            if (bullet.y < -10) {
                bullets.splice(index, 1);
            }
        });

        // 4. Stars Scroll
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
            }
        });

        // 5. Spawn Meteors
        spawnTimer += deltaTime;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            
            // Adjust difficulty dynamically as score increases
            spawnInterval = Math.max(400, 1000 - Math.floor(score / 1500) * 80);
            
            const radius = Math.random() * 16 + 10;
            meteors.push({
                x: Math.random() * (canvas.width - radius * 2) + radius,
                y: -radius,
                radius: radius,
                vx: Math.random() * 1.6 - 0.8,
                vy: Math.random() * 1.5 + 1.2 + Math.min(score / 5000, 2.5), // Faster speed as score goes up
                maxHp: radius > 20 ? 2 : 1,
                hp: radius > 20 ? 2 : 1,
                points: Math.floor(radius) * 10
            });
        }

        // 6. Move and Collide Meteors
        meteors.forEach((meteor, mIndex) => {
            meteor.y += meteor.vy;
            meteor.x += meteor.vx;

            // Screen boundaries wrap
            if (meteor.x - meteor.radius < 0 || meteor.x + meteor.radius > canvas.width) {
                meteor.vx = -meteor.vx;
            }

            // Off screen bottom (loss of life)
            if (meteor.y - meteor.radius > canvas.height) {
                meteors.splice(mIndex, 1);
                lives--;
                updateLivesUI();
                shakeIntensity = 8; // Heavy shake
                showToast('A meteor penetrated the grid! -1 Life', 'error');

                if (lives <= 0) {
                    triggerGameOver();
                }
                return;
            }

            // Bullet vs Meteor Collisions
            bullets.forEach((bullet, bIndex) => {
                const dx = bullet.x - meteor.x;
                const dy = bullet.y - meteor.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < meteor.radius) {
                    // Collision
                    bullets.splice(bIndex, 1);
                    meteor.hp--;

                    // Trigger impact particles
                    createExplosionParticles(bullet.x, bullet.y, '#f472b6', 5, 1);

                    if (meteor.hp <= 0) {
                        meteors.splice(mIndex, 1);
                        score += meteor.points;
                        scoreDisplay.innerText = score.toString().padStart(5, '0');

                        // Exploding burst particles
                        createExplosionParticles(meteor.x, meteor.y, meteor.radius > 20 ? '#8b5cf6' : '#ec4899', 14, 2.2);
                        shakeIntensity = Math.max(shakeIntensity, 3);
                    }
                }
            });

            // Player vs Meteor Collision
            const dxPlayer = player.x - meteor.x;
            const dyPlayer = player.y - meteor.y;
            const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);

            if (distPlayer < meteor.radius + 15) {
                // Collision
                meteors.splice(mIndex, 1);
                lives--;
                updateLivesUI();
                shakeIntensity = 12; // Massive shake
                createExplosionParticles(player.x, player.y, '#ef4444', 25, 3.5);
                showToast('Hull damage detected! -1 Life', 'error');

                if (lives <= 0) {
                    triggerGameOver();
                }
            }
        });

        // 7. Update Particles
        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life++;
            particle.alpha = 1 - (particle.life / particle.maxLife);

            if (particle.life >= particle.maxLife) {
                particles.splice(index, 1);
            }
        });
    }

    // Render Canvas Frame
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        
        // Screenshake Translation
        if (shakeIntensity > 0) {
            const shakeX = (Math.random() - 0.5) * shakeIntensity;
            const shakeY = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(shakeX, shakeY);
            
            // CSS structural screenshake
            gameWrapper.style.transform = `translate(${shakeX * 0.4}px, ${shakeY * 0.4}px)`;
        } else {
            gameWrapper.style.transform = 'translate(0, 0)';
        }

        // Draw Background Stars
        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            ctx.globalAlpha = star.speed * 0.8;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1.0;

        // Draw Player Ship
        ctx.shadowBlur = 10;
        ctx.shadowColor = player.color;
        ctx.fillStyle = player.color;
        
        ctx.beginPath();
        // Cybernetic polygon ship
        ctx.moveTo(player.x, player.y - 12);
        ctx.lineTo(player.x - 18, player.y + 10);
        ctx.lineTo(player.x - 8, player.y + 6);
        ctx.lineTo(player.x + 8, player.y + 6);
        ctx.lineTo(player.x + 18, player.y + 10);
        ctx.closePath();
        ctx.fill();

        // Draw Player Thruster Flame
        if (Math.random() > 0.3) {
            ctx.shadowColor = '#d946ef';
            ctx.fillStyle = '#d946ef';
            ctx.beginPath();
            ctx.moveTo(player.x - 6, player.y + 8);
            ctx.lineTo(player.x, player.y + 16 + Math.random() * 6);
            ctx.lineTo(player.x + 6, player.y + 8);
            ctx.closePath();
            ctx.fill();
        }

        // Draw Bullets
        ctx.shadowBlur = 8;
        bullets.forEach(bullet => {
            ctx.shadowColor = '#22d3ee';
            ctx.fillStyle = '#22d3ee';
            ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
        });

        // Draw Meteors
        meteors.forEach(meteor => {
            // Neon border ring
            ctx.shadowBlur = 12;
            const glowColor = meteor.maxHp > 1 ? '#8b5cf6' : '#ec4899';
            ctx.shadowColor = glowColor;
            ctx.strokeStyle = glowColor;
            ctx.lineWidth = 2;
            
            ctx.fillStyle = '#0a0b10';
            ctx.beginPath();
            ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Runic/Crater detailing
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(meteor.x - meteor.radius*0.3, meteor.y - meteor.radius*0.2, meteor.radius*0.35, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw Particles
        ctx.shadowBlur = 0;
        particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1.0;
        ctx.restore();

        // Paused visual overlay
        if (isPaused) {
            ctx.fillStyle = 'rgba(3, 4, 8, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '700 24px Orbitron';
            ctx.fillStyle = '#06b6d4';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#06b6d4';
            ctx.fillText('TACTICAL PAUSE', canvas.width / 2, canvas.height / 2);
        }
    }
}
