const startBtn = document.querySelector("#startBtn");
const stopBtn = document.querySelector("#stopBtn");
const statusText = document.querySelector("#status");
const reminders = document.querySelector("#reminders");
const addReminderForm = document.querySelector("#addReminderForm");
const reminderNameInput = document.querySelector("#reminderName");
const reminderTimeInput = document.querySelector("#reminderTime");
const reminderAudioInput = document.querySelector("#reminderAudio");

let currentSound = null;
let soundQueue = [];
let timerRunning = false;
const customSounds = new Set();
const reminderIntervals = new Map();

const sounds = {
  peon: new Audio("voices/villageois_louis.mp3"),
  scout: new Audio("voices/scout_louis.mp3"),
  army: new Audio("voices/armee_louis.mp3"),
  resources: new Audio("voices/ressources_louis.mp3"),
  defense: new Audio("voices/defense_louis.mp3"),
};

const playNextSound = () => {
  if (currentSound || soundQueue.length === 0) return;

  const item = soundQueue.shift();
  currentSound = item;
  item.currentTime = 0;

  item.play().catch(() => {
    if (currentSound === item) {
      currentSound = null;
      playNextSound();
    }
  });
};

const registerSound = (sound) => {
  sound.addEventListener("ended", () => {
    if (currentSound === sound) {
      currentSound = null;
      playNextSound();
    }
  });
};

Object.values(sounds).forEach(registerSound);

const playSound = (sound) => {
  if (!sound) return;

  soundQueue.push(sound);
  playNextSound();
};

const stopAllSounds = () => {
  soundQueue = [];

  [...Object.values(sounds), ...customSounds].forEach((sound) => {
    sound.pause();
    sound.currentTime = 0;
  });

  currentSound = null;
};

const getReminderSound = (reminder) => {
  return reminder.customSound || sounds[reminder.dataset.sound];
};

const stopReminder = (reminder, removeQueuedSound = false) => {
  const intervalId = reminderIntervals.get(reminder);

  if (intervalId) {
    clearInterval(intervalId);
    reminderIntervals.delete(reminder);
  }

  if (!removeQueuedSound) return;

  const sound = getReminderSound(reminder);
  soundQueue = soundQueue.filter((queuedSound) => queuedSound !== sound);

  if (currentSound === sound) {
    sound.pause();
    sound.currentTime = 0;
    currentSound = null;
    playNextSound();
  }
};

const startReminder = (reminder) => {
  stopReminder(reminder);

  const toggle = reminder.querySelector(".reminder-toggle");
  const seconds = Number(reminder.querySelector('input[type="number"]').value);
  const sound = getReminderSound(reminder);

  if (!toggle.checked || !sound || !Number.isFinite(seconds) || seconds < 5) {
    return;
  }

  const intervalId = setInterval(() => {
    playSound(sound);
  }, seconds * 1000);

  reminderIntervals.set(reminder, intervalId);
};

const clearReminders = () => {
  reminderIntervals.forEach(clearInterval);
  reminderIntervals.clear();
};

const startAllReminders = () => {
  clearReminders();
  stopAllSounds();

  document.querySelectorAll(".reminder").forEach((reminder) => {
    startReminder(reminder);
  });

  timerRunning = true;
  statusText.textContent = "Timer en cours";
};

addReminderForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = reminderNameInput.value.trim();
  const seconds = Number(reminderTimeInput.value);
  const audioFile = reminderAudioInput.files[0];

  if (!name || !Number.isFinite(seconds) || seconds < 5 || !audioFile) return;

  const sound = new Audio(URL.createObjectURL(audioFile));
  sound.preload = "auto";
  customSounds.add(sound);
  registerSound(sound);

  const reminder = document.createElement("label");
  reminder.className = "reminder";
  reminder.customSound = sound;

  const toggle = document.createElement("input");
  toggle.className = "reminder-toggle";
  toggle.type = "checkbox";
  toggle.checked = true;
  toggle.setAttribute("aria-label", `Activer ${name}`);

  const label = document.createElement("span");
  label.textContent = name;

  const timeInput = document.createElement("input");
  timeInput.type = "number";
  timeInput.value = seconds;
  timeInput.min = "5";

  const unit = document.createElement("small");
  unit.textContent = "secondes";

  reminder.append(toggle, label, timeInput, unit);
  reminders.append(reminder);

  if (timerRunning) {
    startReminder(reminder);
  }

  reminderNameInput.value = "";
  reminderAudioInput.value = "";
  reminderNameInput.focus();
});

reminders.addEventListener("change", (event) => {
  if (!event.target.matches(".reminder-toggle") || !timerRunning) return;

  const reminder = event.target.closest(".reminder");

  if (event.target.checked) {
    startReminder(reminder);
  } else {
    stopReminder(reminder, true);
  }
});

startBtn.addEventListener("click", () => {
  startAllReminders();
});

stopBtn.addEventListener("click", () => {
  clearReminders();
  stopAllSounds();

  timerRunning = false;
  statusText.textContent = "Timer arrêté";
});
