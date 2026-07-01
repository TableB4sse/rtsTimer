const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const statusText = document.querySelector("#status");

let intervals = [];
let currentSound = null;
let soundQueue = [];

const sounds = {
  peon: new Audio("voices/villageois_louis.mp3"),
  scout: new Audio("voices/scout_louis.mp3"),
  army: new Audio("voices/armee_louis.mp3"),
  resources: new Audio("voices/ressources_louis.mp3"),
  defense: new Audio("voices/defense_louis.mp3"),
};

const playNextSound = () => {
  if (currentSound || soundQueue.length === 0) return;

  const sound = soundQueue.shift();
  currentSound = sound;
  sound.currentTime = 0;

  sound.play().catch(() => {
    if (currentSound === sound) {
      currentSound = null;
      playNextSound();
    }
  });
};

Object.values(sounds).forEach((sound) => {
  sound.addEventListener("ended", () => {
    if (currentSound === sound) {
      currentSound = null;
      playNextSound();
    }
  });
});

const playSound = (name) => {
  const sound = sounds[name];

  if (!sound) return;

  soundQueue.push(sound);
  playNextSound();
};

const stopAllSounds = () => {
  soundQueue = [];

  Object.values(sounds).forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });

  currentSound = null;
};

const startReminder = (name, seconds) => {
  const intervalId = setInterval(() => {
    playSound(name);
  }, seconds * 1000);

  intervals.push(intervalId);
};

startBtn.addEventListener("click", () => {
  intervals.forEach(clearInterval);
  intervals = [];

  stopAllSounds();

  const peonTime = Number(document.querySelector("#peon").value);
  const scoutTime = Number(document.querySelector("#scout").value);
  const armyTime = Number(document.querySelector("#army").value);
  const resourcesTime = Number(document.querySelector("#resources").value);
  const defenseTime = Number(document.querySelector("#defense").value);

  startReminder("peon", peonTime);
  startReminder("scout", scoutTime);
  startReminder("army", armyTime);
  startReminder("resources", resourcesTime);
  startReminder("defense", defenseTime);

  statusText.textContent = "Timer en cours";
});

stopBtn.addEventListener("click", () => {
  intervals.forEach(clearInterval);
  intervals = [];

  stopAllSounds();

  statusText.textContent = "Timer arrêté";
});
