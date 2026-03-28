const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Адаптация под размер экрана
canvas.width = window.innerWidth;
canvas.height = 400;

let player = {
    x: 100, y: 300, size: 30,
    color: '#FFDC00',
    dy: 0, jumpForce: -10, gravity: 0.6,
    grounded: false, rotation: 0
};

let gameSpeed = 5;
let currentLevel = 0;
let distance = 0;

// Уровни (0 - пусто, 1 - блок, 2 - шип)
const levels = [
    [0,0,1,0,0,2,0,0,1,1,0,2,0,2,0,0,1,1,1], // Уровень 1
    [0,1,2,0,1,2,0,1,1,2,2,0,1,0,1,2,0,1,1]  // Уровень 2
];

function changeColor(color) { player.color = color; }

function jump() {
    if (player.grounded) {
        player.dy = player.jumpForce;
        player.grounded = false;
    }
}

// Управление: ЛКМ, Пробел или Тач
window.addEventListener('mousedown', jump);
window.addEventListener('touchstart', (e) => { e.preventDefault(); jump(); });

function update() {
    // Гравитация
    player.dy += player.gravity;
    player.y += player.dy;

    // Столкновение с полом
    if (player.y + player.size > 350) {
        player.y = 350 - player.size;
        player.dy = 0;
        player.grounded = true;
        // В GD кубик вращается в прыжке и выравнивается при приземлении
        player.rotation = Math.round(player.rotation / 90) * 90;
    } else {
        player.rotation += 5; // Вращение в воздухе
        player.grounded = false;
    }

    distance += gameSpeed;
    
    // Проверка прогресса
    let totalLen = levels[currentLevel].length * 100;
    document.getElementById('prog').innerText = Math.min(100, Math.floor((distance / totalLen) * 100));
    
    if (distance > totalLen) {
        alert("Уровень пройден!");
        distance = 0;
        currentLevel = (currentLevel + 1) % levels.length;
        document.getElementById('lvl').innerText = currentLevel + 1;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем пол
    ctx.fillStyle = '#001f3f';
    ctx.fillRect(0, 350, canvas.width, 50);

    // Рисуем игрока
    ctx.save();
    ctx.translate(player.x + player.size/2, player.y + player.size/2);
    ctx.rotate(player.rotation * Math.PI / 180);
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.size/2, -player.size/2, player.size, player.size);
    ctx.strokeStyle = "white";
    ctx.strokeRect(-player.size/2, -player.size/2, player.size, player.size);
    ctx.restore();

    // Рисуем препятствия
    let lvl = levels[currentLevel];
    lvl.forEach((type, i) => {
        let objX = (i * 100) - distance + 400;
        
        if (type === 1) { // Блок
            ctx.fillStyle = "#aaa";
            ctx.fillRect(objX, 300, 50, 50);
            checkCollision(objX, 300, 50, 50);
        } else if (type === 2) { // Шип
            ctx.fillStyle = "#ff4136";
            ctx.beginPath();
            ctx.moveTo(objX, 350);
            ctx.lineTo(objX + 25, 300);
            ctx.lineTo(objX + 50, 350);
            ctx.fill();
            checkCollision(objX, 310, 40, 40); // Чуть меньше для честности
        }
    });

    requestAnimationFrame(() => {
        update();
        draw();
    });
}

function checkCollision(ox, oy, ow, oh) {
    if (player.x < ox + ow && player.x + player.size > ox &&
        player.y < oy + oh && player.y + player.size > oy) {
        // Рестарт при смерти
        distance = 0;
    }
}

draw();
  
