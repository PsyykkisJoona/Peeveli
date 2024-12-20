const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
const talo = document.getElementById("talo");
const voima = document.getElementById("voima");
const kuvake = document.getElementById("kuvake");

const risti_1 = document.getElementById("risti_1");
const risti_2 = document.getElementById("risti_2");
const risti_3 = document.getElementById("risti_3");
const risti_4 = document.getElementById("risti_4");
const risti_5 = document.getElementById("risti_5");
const risti_6 = document.getElementById("risti_6");
const risti_7 = document.getElementById("risti_7");
const risti_8 = document.getElementById("risti_8");
const risti_9 = document.getElementById("risti_9");
const risti_10 = document.getElementById("risti_10");

const harmaa = "kuvat/risti.png";
const kultainen = "kuvat/risti1.png"; 
const sininen = "kuvat/risti2.png";

const radius = 10;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const minDistanceFromCenter = 25;
document.addEventListener('keydown', playerControls);

var liiku = new Audio('aanet/liiku.mp3');
var liiku_2 = new Audio('aanet/liiku_2.mp3');
var ammu = new Audio('aanet/ammu.mp3');
var boom = new Audio('aanet/boom.mp3');
var voimaa = new Audio('aanet/voimaa.mp3');
var marssi = new Audio('aanet/marssi.mp3');
var victorySound = new Audio('aanet/voitto.mp3');
var loserSound = new Audio('aanet/loppu.mp3');
var risti = new Audio('aanet/risti.mp3');


let isShooting = false;
let canShoot = true;
let isExploding = false;
let isOriginalImage = true; 
let enemies = [];
let level = 1;
let stage = 1;
let enemySpeed = 25;
let enemyFrameSwitch = 0;
let score = 0;
let highScore = 0;
let ammoCount = 10;
let enterPressCount = 0;
let x = 250, y = 250;
let gameOver = false;
let canReset = false; 
let gameWon = false;
let spawnEnemyToggle = true; 

const backgroundMusic = document.getElementById("backgroundMusic");
let currentMusicSrc = ''; // Muuttuja, joka tallentaa nykyisen musiikin l�hteen
backgroundMusic.loop = true; // Musiikki toistuu automaattisesti

const Varvara = document.getElementById("Varvara");
Varvara.loop = true; // Musiikki toistuu automaattisesti
Varvara.src = 'aanet/Varvara.mp3';

function drawBall() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!isShooting && !isExploding) {
        // Piirret��n keskell� oleva ympyr� ja ristiviivat
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI); // Piirret��n pienempi ympyr�
        ctx.moveTo(x - radius, y);
        ctx.lineTo(x + radius, y); // Vaakasuora viiva keskelle
        ctx.moveTo(x, y - radius);
        ctx.lineTo(x, y + radius); // Pystysuora viiva keskelle
        ctx.strokeStyle = 'red'; // Asetetaan viivojen v�ri
        ctx.stroke();

        // Piirret��n suurempi viivainen ympyr�
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, 2 * Math.PI); // Piirret��n suurempi ympyr�
        ctx.setLineDash([5, 15]); // Asetetaan viivojen katkoviivat
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'; // V�h�ll� n�kyv� v�ri
        ctx.stroke();
        ctx.setLineDash([]); // Palautetaan normaali viiva
    }
    drawTalo();
    updateAmmo();
    drawEnemies();
}


function spawnEnemy() {
    const edge = Math.floor(Math.random() * 4);
    let enemyX, enemyY;

    switch (edge) {
        case 0: enemyX = 0; enemyY = Math.random() * canvas.height; break;
        case 1: enemyX = canvas.width; enemyY = Math.random() * canvas.height; break;
        case 2: enemyY = 0; enemyX = Math.random() * canvas.width; break;
        case 3: enemyY = canvas.height; enemyX = Math.random() * canvas.width; break;
    }

    enemies.push({ x: enemyX, y: enemyY, frame: 0 });
}

function drawTalo() {
    const taloWidth = talo.width;
    const taloHeight = talo.height;
    ctx.drawImage(talo, centerX - taloWidth / 2.5, centerY - taloHeight / 1.7);
}


function moveEnemies() {
    enemies.forEach((enemy, index) => {
        const angle = Math.atan2(centerY - enemy.y, centerX - enemy.x);
        enemy.x += enemySpeed * Math.cos(angle);
        enemy.y += enemySpeed * Math.sin(angle);
        enemy.frame = (enemy.frame + 1) % 2;

        if (Math.hypot(centerX - enemy.x, centerY - enemy.y) < 20) {
            enemies.splice(index, 1); // Poista vihollinen
            endGame();
        }
    });
}

function endGame() {
    // Estä pelin päättyminen, jos peli on jo voitettu
    if (gameWon) return;

    document.removeEventListener("keydown", playerControls);
    gameOver = true;
    backgroundMusic.pause();
    loserSound.play();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pys�ytet��n vihollisten luominen ja liike
    clearInterval(enemyMoveTimer);
    spawnEnemyToggle = false;

    // Asetetaan kanvaksen vilkkuva taustav�ri 3 sekunniksi
    let blinkInterval = setInterval(() => {
        canvas.style.backgroundColor = canvas.style.backgroundColor === "red" ? "yellow" : "red";

    }, 100);

    // Lopetetaan vilkkuminen 3 sekunnin j�lkeen
    setTimeout(() => {
        clearInterval(blinkInterval);
        canvas.style.backgroundColor = "red";

        // N�ytet��n Game Over -viesti
        ctx.fillStyle = "black";
        ctx.font = "bold 36px Tahoma";

        let text = "PELI OHI";
        let textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), canvas.height / 2 - 20);

        ctx.font = "20px Tahoma";
        text = "Paina 'Enter' aloittaaksesi uudelleen";
        textWidth = ctx.measureText(text).width;
        ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), canvas.height / 2 + 20);

        canReset = true;

        if (score > highScore) {
            highScore = score;
        }
        updateScoreDisplay();
    }, 3000);
}

function resetGame() {
    if (gameOver && canReset) {
        // Alustetaan pelin muuttujat
        level = 1;
        canvas.style.backgroundColor = "black";
        gameOver = false;
        canReset = false;
        score = 0;
        stage = 1;
        ammoCount = 10;
        enemies = [];
        enterPressCount = 0;
        spawnEnemyToggle = true;

        risti_1.src = harmaa;
        risti_2.src = harmaa;
        risti_3.src = harmaa;
        risti_4.src = harmaa;
        risti_5.src = harmaa;
        risti_6.src = harmaa;
        risti_7.src = harmaa;
        risti_8.src = harmaa;
        risti_9.src = harmaa;
        risti_10.src = harmaa;

        drawBall();
        updateLevelMusic(level);

        // Liitet��n pelaajan ohjaimet
        document.addEventListener('keydown', playerControls);
    }
}

document.addEventListener("keydown", function (event) {
    if (gameOver && event.key === "Enter" && canReset) {
        resetGame();
    }
});

function drawEnemies() {
    enemies.forEach(enemy => {
        const enemyImage = document.getElementById(enemy.frame === 0 ? "pahis1" : "pahis2");
        ctx.drawImage(enemyImage, enemy.x - 15, enemy.y - 15, 34, 34);
    });
}

function drawBullet(targetX, targetY) {
    isShooting = true;
    canShoot = false;
    ammoCount--;

    const bulletSpeed = 10;
    let bulletX = centerX;
    let bulletY = centerY;
    const angle = Math.atan2(targetY - centerY, targetX - centerX);

    function moveBullet() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(bulletX, bulletY);
        ctx.strokeStyle = 'yellow';
        ctx.stroke();

        bulletX += bulletSpeed * Math.cos(angle);
        bulletY += bulletSpeed * Math.sin(angle);

        if (Math.abs(bulletX - targetX) > bulletSpeed || Math.abs(bulletY - targetY) > bulletSpeed) {
            requestAnimationFrame(moveBullet);
        } else {
            isShooting = false;
            createExplosion(bulletX, bulletY);
        }
    }

    moveBullet();
    drawTalo();
}

function updateScoreDisplay() {
    // P�ivitet��n pisteet ja high score -n�ytt� nollilla t�ytettyn�
    document.getElementById("score").innerText = String(score).padStart(6, '0');
    document.getElementById("highScore").innerText = String(highScore).padStart(6, '0');
}

function calculatePoints(centerDistance) {
    // Pisteytys et�isyyden mukaan
    if (centerDistance < 150) return 5;
    else if (centerDistance < 200) return 10;
    else return 15;
}

function createExplosion(explosionX, explosionY) {
    const explosionRadius = 5.5 * radius;
    let frames = 20;
    isExploding = true;
    let enemiesDestroyed = []; // Lista tuhoutuneista vihollisista pisteytyst� varten
    let explosionPoints = 0; // Tallennetaan saadut pisteet n�ytt�� varten

    function animateExplosion() {
        if (frames < 30) {
            boom.play();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawTalo();
            ctx.beginPath();
            ctx.arc(explosionX, explosionY, explosionRadius, 0, 2 * Math.PI);
            ctx.fillStyle = frames % 2 === 0 ? 'yellow' : 'yellow';
            ctx.fill();

            // P�ivitet��n vihollisten sijainnit ja suodatetaan r�j�hdyksen alueella olevat viholliset
            enemies = enemies.filter(enemy => {
                const explosionDistance = Math.hypot(explosionX - enemy.x, explosionY - enemy.y);

                if (explosionDistance < explosionRadius) {
                    // Lasketaan keskietäisyys vain tuhoutuville vihollisille ja lis�t��n listaan
                    const centerDistance = Math.hypot(centerX - enemy.x, centerY - enemy.y);
                    enemiesDestroyed.push(centerDistance);
                    return false; // Poistetaan vihollinen, jos se tuhoutuu
                }
                return true; // J�tet��n muut viholliset peliin
            });

            frames++;
            requestAnimationFrame(animateExplosion);
        } else {
            isExploding = false;
            setTimeout(() => (canShoot = true), 150);

            // Lasketaan pisteet tuhoutuneille vihollisille
            let points = 0;
            enemiesDestroyed.forEach(centerDistance => {
                points += calculatePoints(centerDistance);
            });

            let multiplier = 1;
            if (enemiesDestroyed.length === 2) multiplier = 2;
            else if (enemiesDestroyed.length === 3) multiplier = 3;
            else if (enemiesDestroyed.length >= 4) multiplier = 4;

            points *= multiplier;
            score += points;
            explosionPoints = points; // Tallennetaan n�ytett�viksi pisteiksi

            if (score > highScore) {
                highScore = score;
            }

            updateScoreDisplay();

            // N�ytet��n saadut pisteet r�j�hdyksen kohdalla

            ctx.fillStyle = 'red';
            ctx.font = 'bold 15px Tahoma'; // T�m� lis�� paksumman ulkoasun

            if (explosionPoints > 0 && explosionPoints != 5) {
                ctx.fillText(`+${explosionPoints}`, explosionX - 17, explosionY + 5);
            }

            if (explosionPoints == 5) {
                ctx.fillText(`+${explosionPoints}`, explosionX - 12, explosionY + 5);
            }


            // Piilotetaan pisteet hetken kuluttua
        }
    }

    animateExplosion();
}

function updateAmmo() {
    const ammoImage = `kuvat/voima/voima0${10 - Math.min(ammoCount, 10)}.png`;
    voima.src = ammoImage;
}

// Pelaajan ohjauksen funktio
function playerControls(event) {
    if (gameOver) return; // Estet��n ohjaus, jos peli on p��ttynyt

    const step = 40;
    const distanceFromCenter = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));

    switch (event.key) {
        case 'ArrowUp':
            if (y - radius - step >= 0) {
                liiku.play();
                y -= step;
            }
            break;
        case 'ArrowDown':
            if (y + radius + step <= canvas.height) {
                liiku.play();
                y += step;
            }
            break;
        case 'ArrowLeft':
            if (x - radius - step >= 0) {
                liiku_2.play();
                x -= step;
            }
            break;
        case 'ArrowRight':
            if (x + radius + step <= canvas.width) {
                liiku_2.play();
                x += step;
            }
            break;
        case 'Enter':
            if (distanceFromCenter < minDistanceFromCenter) {
                enterPressCount++;
                if (enterPressCount === 2) {
                    ammoCount = Math.min(ammoCount + 1, 10);
                    enterPressCount = 0;
                }
            } else if (canShoot && distanceFromCenter >= minDistanceFromCenter && ammoCount > 0) {
                ammu.play();
                drawBullet(x, y);
            }
            break;
    }
    if (!isShooting && !isExploding) drawBall();
}

let enemyMoveInterval = 2000; // Alkuper�inen liikkumisv�li vihollisille
let enemyMoveTimer = setInterval(() => {
    moveEnemies();

}, enemyMoveInterval);

function updateLevelMusic(level) {
    let newMusicSrc;
    if (level >= 1 && level < 10) {
        newMusicSrc = 'aanet/level1.mp3';
    } else if (level >= 10 && level < 20) {
        newMusicSrc = 'aanet/level2.mp3';
    } else if (level >= 20 && level < 30) {
        newMusicSrc = 'aanet/level2.mp3';
    } else if (level >= 30 && level < 40) {
        newMusicSrc = 'aanet/level3.mp3';
    } else if (level >= 40 && level < 55) {
        newMusicSrc = 'aanet/level4.mp3';
    }

    // P�ivit� musiikki vain, jos l�hde on eri kuin nykyinen
    if (newMusicSrc !== currentMusicSrc && !gameOver) {
        backgroundMusic.src = newMusicSrc;
        currentMusicSrc = newMusicSrc; // P�ivit� nykyinen l�hde
        backgroundMusic.play(); // Toista uusi musiikki
    }
}

if (spawnEnemyToggle) {
    let mainInterval = setInterval(() => {
        // Jos saavutaan tasolle 50
        if (level >= 55 && !gameOver && !gameWon) {
            // Voitto-tilan käsittely
            level = 0;
            kuvake.src = isOriginalImage ? "kuvat/kuvake_3.png" : "kuvat/kuvake_4.png";
            document.querySelector("#pisteet img").style.border = "3px dotted white";
            gameWon = true;
            backgroundMusic.pause();
            clearInterval(enemyMoveTimer);
            enemies = [];
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawTalo();
            victorySound.play();

            let blinkInterval = setInterval(() => {
                canvas.style.borderColor = canvas.style.borderColor === "red" ? "yellow" : "red";
                canShoot = false;
                ammoCount = Math.min(ammoCount + 1, 10);
                drawBall();
            }, 50);

            let iconChangeInterval = setInterval(() => {
                kuvake.src = isOriginalImage ? "kuvat/kuvake_3.png" : "kuvat/kuvake_4.png";
                isOriginalImage = !isOriginalImage;
            }, 1500); // Vaihtaa kuvan joka sekunti

            setTimeout(() => {
                Varvara.src = 'aanet/Varvara.mp3';
                Varvara.play();
            }, 2500);

            // Animaatio ristin välkkyessä ennen vihollisten ilmestymistä
            const ristiElement = document.getElementById(`risti_${stage}`);
            if (ristiElement) {
                setTimeout(() => {
                    let blinkStartTime = Date.now();
                    let blinkDuration = 2000; // 2 sekunnin animaatio
                    let blinkInterval = setInterval(() => {
                        risti.play()
                        let elapsed = Date.now() - blinkStartTime;
                        if (elapsed >= blinkDuration) {
                            clearInterval(blinkInterval);
                            ristiElement.src = kultainen; // Palauta kultainen
                        } else {
                            ristiElement.src = elapsed % 100 < 50 ? sininen : kultainen;
                        }
                    }, 50); // Aggressiivinen välkkyminen 50 ms välein
                }, 15000); // Odotetaan 15 sekuntia ennen animaation alkamista
            }


            setTimeout(() => {
                Varvara.pause();
                clearInterval(blinkInterval);
                clearInterval(iconChangeInterval); // Pysäytetään kuvakkeiden vaihto
                canvas.style.borderColor = "white";
                spawnEnemyToggle = true;
                canShoot = true;
                gameWon = false;
                stage++;
            }, 17200);
            return;
        }



        // P�ivitet��n taustamusiikki tason mukaan
        updateLevelMusic(level);

        // P�ivitet��n vihollisten liikkumisv�li tason mukaan
        if (stage === 1) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1250;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 900;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 700;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 500;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 400;
            }
        } else if (stage === 2) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1200;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 850;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 650;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 450;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 399;
            }
        } else if (stage === 3) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1170;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 800;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 650;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 440;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 396;
            }
        } else if (stage === 4) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1140;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 780;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 640;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 435;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 390;
            }
        } else if (stage === 5) {
            canvas.style.backgroundColor = "#006400";

            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1100;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 6) {

            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1100;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 7) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1000;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 8) {

            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1000;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 9) {

            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1000;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 10) {
            canvas.style.backgroundColor = "#A020F0";

            if (level >= 1 && level < 10) {
                enemyMoveInterval = 1000;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        } else if (stage === 11) {
            if (level >= 1 && level < 10) {
                enemyMoveInterval = 200;
            } else if (level >= 10 && level < 20) {
                enemyMoveInterval = 750;
            } else if (level >= 20 && level < 30) {
                enemyMoveInterval = 637;
            } else if (level >= 30 && level < 40) {
                enemyMoveInterval = 430;
            } else if (level >= 40 && level < 55) {
                enemyMoveInterval = 388;
            }
        }


        // K�ynnistet��n vihollisten liike ja luominen uudella intervallilla
        clearInterval(enemyMoveTimer);
        enemyMoveTimer = setInterval(() => {
            if (spawnEnemyToggle && !gameWon) { // Lis�t��n tarkistus gameWon-tilalle
                spawnEnemy();
                marssi.play();
                moveEnemies();
                drawBall();

                level++; // Kasvatetaan tasoa (kierrosta)
                console.log("Level:", level);

                kuvake.src = isOriginalImage ? "kuvat/kuvake_2.png" : "kuvat/kuvake_1.png";
                document.querySelector("#pisteet img").style.border = "3px dotted red";
                isOriginalImage = !isOriginalImage;
            }

        }, enemyMoveInterval);

    }, 2000); // Tasop�ivitys 2 sekunnin v�lein
}

drawBall();