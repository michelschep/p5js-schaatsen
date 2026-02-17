// SC Heerenveen kleuren
const HEERENVEEN_BLUE = '#0066cc';
const HEERENVEEN_WHITE = '#ffffff';
const ICE_COLOR = '#e0f0ff';
const TRACK_COLOR = '#b0d0e0';

let gameState = 'start'; // start, racing, finished
let teamA, teamB;
let track;

class Track {
  constructor() {
    this.centerX = 400;
    this.centerY = 300;
    this.outerRadius = 220;
    this.innerRadius = 150;
  }
  
  draw() {
    // IJsbaan
    fill(ICE_COLOR);
    noStroke();
    ellipse(this.centerX, this.centerY, this.outerRadius * 2);
    
    // Binnencirkel
    fill(HEERENVEEN_BLUE);
    ellipse(this.centerX, this.centerY, this.innerRadius * 2);
    
    // Baanlijnen
    stroke(TRACK_COLOR);
    strokeWeight(2);
    noFill();
    ellipse(this.centerX, this.centerY, (this.outerRadius + this.innerRadius));
  }
  
  getPosition(angle) {
    let radius = (this.outerRadius + this.innerRadius) / 2;
    return {
      x: this.centerX + cos(angle) * radius,
      y: this.centerY + sin(angle) * radius
    };
  }
}

class Skater {
  constructor(teamName, color, isLane1) {
    this.teamName = teamName;
    this.color = color;
    this.angle = 0;
    this.speed = 0;
    this.lapOffset = isLane1 ? 0 : -PI;
    this.active = false;
  }
  
  update() {
    if (this.active) {
      this.angle += this.speed;
    }
  }
  
  draw() {
    if (this.active) {
      let pos = track.getPosition(this.angle + this.lapOffset);
      fill(this.color);
      stroke(0);
      strokeWeight(2);
      ellipse(pos.x, pos.y, 20, 20);
    }
  }
  
  getLaps() {
    return floor(this.angle / TWO_PI);
  }
}

class Team {
  constructor(name, color, isHuman, isLane1) {
    this.name = name;
    this.color = color;
    this.isHuman = isHuman;
    this.skaters = [
      { laps: 1, skater: new Skater(name, color, isLane1) },
      { laps: 2, skater: new Skater(name, color, isLane1) },
      { laps: 3, skater: new Skater(name, color, isLane1) }
    ];
    this.currentSkaterIndex = 0;
    this.totalTime = 0;
    this.finished = false;
    this.startTime = 0;
  }
  
  start() {
    this.startTime = millis();
    this.skaters[0].skater.active = true;
  }
  
  update() {
    if (this.finished) return;
    
    let current = this.skaters[this.currentSkaterIndex];
    current.skater.update();
    
    // Check of schaatser klaar is
    if (current.skater.getLaps() >= current.laps) {
      current.skater.active = false;
      this.currentSkaterIndex++;
      
      if (this.currentSkaterIndex >= this.skaters.length) {
        // Team is klaar
        this.finished = true;
        this.totalTime = millis() - this.startTime;
      } else {
        // Volgende schaatser
        this.skaters[this.currentSkaterIndex].skater.active = true;
        this.skaters[this.currentSkaterIndex].skater.angle = 0;
      }
    }
  }
  
  getCurrentSkater() {
    if (this.currentSkaterIndex < this.skaters.length) {
      return this.skaters[this.currentSkaterIndex].skater;
    }
    return null;
  }
  
  accelerate() {
    let skater = this.getCurrentSkater();
    if (skater && skater.active) {
      skater.speed = min(skater.speed + 0.001, 0.08);
    }
  }
  
  decelerate() {
    let skater = this.getCurrentSkater();
    if (skater && skater.active) {
      skater.speed = max(skater.speed - 0.0005, 0.02);
    }
  }
  
  draw() {
    for (let s of this.skaters) {
      s.skater.draw();
    }
  }
}

function setup() {
  createCanvas(800, 600);
  track = new Track();
  teamA = new Team('Team A (Speler)', HEERENVEEN_BLUE, true, true);
  teamB = new Team('Team B (Computer)', color(255, 100, 100), false, false);
  angleMode(RADIANS);
}

function draw() {
  background(HEERENVEEN_WHITE);
  
  track.draw();
  
  if (gameState === 'start') {
    drawStartScreen();
  } else if (gameState === 'racing') {
    teamA.update();
    teamB.update();
    
    // Computer AI - simpel
    if (frameCount % 2 === 0) {
      teamB.accelerate();
    }
    
    teamA.draw();
    teamB.draw();
    
    drawGameInfo();
    
    // Check of beide teams klaar zijn
    if (teamA.finished && teamB.finished) {
      gameState = 'finished';
    }
  } else if (gameState === 'finished') {
    teamA.draw();
    teamB.draw();
    drawFinishScreen();
  }
}

function drawStartScreen() {
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Team Sprint Schaatsen', width / 2, 80);
  
  textSize(16);
  text('SC Heerenveen Editie', width / 2, 120);
  
  textSize(14);
  text('Besturing:', width / 2, 180);
  text('Spatiebalk - Versnellen', width / 2, 210);
  text('Schaatser 1 rijdt 1 ronde', width / 2, 250);
  text('Schaatser 2 rijdt 2 rondes', width / 2, 270);
  text('Schaatser 3 rijdt 3 rondes', width / 2, 290);
  text('Totaal: 6 rondes', width / 2, 320);
  
  textSize(20);
  fill(HEERENVEEN_BLUE);
  text('Druk ENTER om te starten', width / 2, height - 100);
}

function drawGameInfo() {
  fill(0);
  textSize(14);
  textAlign(LEFT);
  
  // Team A info
  text(`${teamA.name}`, 20, 30);
  text(`Schaatser: ${teamA.currentSkaterIndex + 1}/3`, 20, 50);
  let skaterA = teamA.getCurrentSkater();
  if (skaterA) {
    text(`Rondes: ${skaterA.getLaps()}/${teamA.skaters[teamA.currentSkaterIndex].laps}`, 20, 70);
  }
  
  // Team B info
  textAlign(RIGHT);
  text(`${teamB.name}`, width - 20, 30);
  text(`Schaatser: ${teamB.currentSkaterIndex + 1}/3`, width - 20, 50);
  let skaterB = teamB.getCurrentSkater();
  if (skaterB) {
    text(`Rondes: ${skaterB.getLaps()}/${teamB.skaters[teamB.currentSkaterIndex].laps}`, width - 20, 70);
  }
  
  // Instructies
  textAlign(CENTER);
  textSize(12);
  text('Hou SPATIEBALK ingedrukt om te versnellen!', width / 2, height - 20);
}

function drawFinishScreen() {
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('FINISH!', width / 2, 150);
  
  textSize(20);
  let timeA = (teamA.totalTime / 1000).toFixed(2);
  let timeB = (teamB.totalTime / 1000).toFixed(2);
  
  text(`Team A: ${timeA} seconden`, width / 2, 220);
  text(`Team B: ${timeB} seconden`, width / 2, 260);
  
  textSize(24);
  if (teamA.totalTime < teamB.totalTime) {
    fill(100, 255, 100);
    text('Team A WINT!', width / 2, 320);
  } else if (teamB.totalTime < teamA.totalTime) {
    fill(255, 100, 100);
    text('Team B WINT!', width / 2, 320);
  } else {
    fill(255, 255, 100);
    text('GELIJKSPEL!', width / 2, 320);
  }
  
  textSize(16);
  fill(255);
  text('Druk ENTER om opnieuw te spelen', width / 2, height - 80);
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (gameState === 'start' || gameState === 'finished') {
      resetGame();
      gameState = 'racing';
      teamA.start();
      teamB.start();
    }
  }
  
  if (key === ' ' && gameState === 'racing') {
    teamA.accelerate();
  }
}

function resetGame() {
  teamA = new Team('Team A (Speler)', HEERENVEEN_BLUE, true, true);
  teamB = new Team('Team B (Computer)', color(255, 100, 100), false, false);
}
