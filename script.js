const screens = ["intro", "home", "map", "game", "story"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const titleEl = document.getElementById("screenTitle");
const navBtns = document.querySelectorAll(".nav button");
const moodText = document.getElementById("moodText");
const avatar = document.getElementById("avatar");
const progressBar = document.getElementById("progressBar");
const progressFill = document.getElementById("progressFill");
const fundsChip = document.getElementById("fundsChip");
const waterLevel = document.getElementById("waterLevel");
const mainCard = document.getElementById("mainCard");
const gameTitle = document.getElementById("gameTitle");
const gameStats = document.getElementById("gameStats");
const clueText = document.getElementById("clueText");
const wrongLetters = document.getElementById("wrongLetters");
const wordSlots = document.getElementById("wordSlots");
const keyGrid = document.getElementById("keyGrid");
const hintBtn = document.getElementById("hintBtn");
const quitBtn = document.getElementById("quitBtn");
const storyTitle = document.getElementById("storyTitle");
const storyBody = document.getElementById("storyBody");
const nextWordBtn = document.getElementById("nextWordBtn");
const storyMapBtn = document.getElementById("storyMapBtn");
const introStartBtn = document.getElementById("introStartBtn");
const introSkipBtn = document.getElementById("introSkipBtn");
const introActions = document.getElementById("introActions");
const introScene = document.getElementById("introSceneStart");
const witchArt = document.querySelector(".witchArt");
const fightCurseBtn = document.getElementById("fightCurseBtn");
const curseStatus = document.getElementById("curseStatus");
const introCallout = document.getElementById("introCallout");
const mapChapters = document.getElementById("mapChapters");
const mapHint = document.getElementById("mapHint");
const howToBtn = document.getElementById("howToBtn");
const howToCard = document.getElementById("howToCard");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const introTransitionOverlay = document.getElementById("introTransitionOverlay");
const difficultyBtns = document.querySelectorAll(".difficultyBtn");
const difficultyModeText = document.getElementById("difficultyModeText");

let confettiLayer = null;
let introStartRevealTimer = null;
let introTypeTimer = null;
let introParallaxBound = false;
let introTransitionTimer = null;
let introGameplayStartTimer = null;
let musicFadeTimer = null;
let musicEnabled = false;
let wantsMusicOn = false;
let gameOverSequenceTimer = null;
let gameOverEndedHandler = null;

const ambientMusic = new Audio("Music/cottagecore.mp3");
ambientMusic.loop = true;
ambientMusic.preload = "auto";
ambientMusic.muted = false;
ambientMusic.volume = 0;
const musicTargetVolume = 0.35;

const sfx = {
  click: new Audio("Music/buttonsound.mp3"),
  levelWin: new Audio("Music/nextlevel.mp3"),
  nextChapter: new Audio("Music/nextchapter.mp3"),
  gameOver: new Audio("Music/gameover.mp3"),
  gameOverKid: new Audio("Music/gameoverkid.mp3"),
  trumpets: new Audio("Music/trumpets.mp3"),
  magicSpell: new Audio("Music/magicspell.mp3"),
  cursePush: new Audio("Music/splash.mp3")
};

sfx.click.volume = 0.45;
sfx.levelWin.volume = 0.6;
sfx.nextChapter.volume = 0.65;
sfx.gameOver.volume = 0.7;
sfx.gameOverKid.volume = 0.68;
sfx.trumpets.volume = 0.72;
sfx.magicSpell.volume = 0.7;
sfx.cursePush.volume = 0.7;

const chapters = [
  {
    id: 1,
    title: "The Decision",
    subtitle: "Start with hope",
    hintsPerLevel: 4,
    maxMistakes: 5,
    starterLetters: 2,
    levels: [
      { answer: "HOPE", clue: "Clue: Belief that good things can happen.", reward: 40 },
      { answer: "CARE", clue: "Clue: To support someone with kindness.", reward: 45 },
      { answer: "GIVE", clue: "Clue: To offer help to others.", reward: 50 }
    ]
  },
  {
    id: 2,
    title: "Fundraising",
    subtitle: "First support wave",
    hintsPerLevel: 3,
    maxMistakes: 5,
    starterLetters: 1,
    levels: [
      { answer: "WATER", clue: "Clue: We are raising money for clean _____.", reward: 55 },
      { answer: "WELL", clue: "Clue: Communities draw clean water from this.", reward: 60 },
      { answer: "PUMP", clue: "Clue: Device that moves water upward.", reward: 65 },
      { answer: "FLOW", clue: "Clue: Water should safely ____ to homes.", reward: 70 }
    ]
  },
  {
    id: 3,
    title: "Community",
    subtitle: "More people join",
    hintsPerLevel: 2,
    maxMistakes: 5,
    starterLetters: 1,
    levels: [
      { answer: "FILTER", clue: "Clue: Tool used to clean water.", reward: 70 },
      { answer: "SPRING", clue: "Clue: Natural source of freshwater.", reward: 75 },
      { answer: "HEALTH", clue: "Clue: Clean water protects this.", reward: 80 },
      { answer: "FAMILY", clue: "Clue: The people you are fighting for.", reward: 85 },
      { answer: "SUPPORT", clue: "Clue: Community help and encouragement.", reward: 90 }
    ]
  },
  {
    id: 4,
    title: "Momentum",
    subtitle: "The mission grows",
    hintsPerLevel: 1,
    maxMistakes: 5,
    starterLetters: 1,
    levels: [
      { answer: "CHARITY", clue: "Clue: Helping others through giving.", reward: 90 },
      { answer: "DONATION", clue: "Clue: Money given to support a cause.", reward: 95 },
      { answer: "NETWORK", clue: "Clue: Connected group of people helping.", reward: 100 },
      { answer: "IMPACT", clue: "Clue: The positive change you create.", reward: 105 },
      { answer: "PROGRESS", clue: "Clue: Forward movement toward the goal.", reward: 110 },
      { answer: "JOURNEY", clue: "Clue: The full path from start to finish.", reward: 115 }
    ]
  }
];

const storyByChapter = {
  1: "You chose courage over fear and took the first step toward clean water access!",
  2: "Your fundraiser gained momentum, turning generosity into real water solutions!",
  3: "Your community rallied together, helping more families move closer to safe water!",
  4: "Momentum became impact, strengthening charity: water's mission to serve every person in need!"
};

const state = {
  funds: 420,
  goal: 1200,
  waterPct: 62,
  moodPct: 35,
  moodGameOver: false,
  difficulty: "normal",
  currentChapterIndex: 0,
  currentLevelIndex: 0,
  completedChapters: 0,
  mistakes: 0,
  hintsLeft: 0,
  guessed: new Set(),
  hasStarted: false,
  introSeen: false,
  introCursePushes: 0,
  canPlay: false,
  storyMode: "map"
};

const introCalloutFullText = "Oh no, please help us save our land from the evil drought witch! Every solved word raises support for clean water and brings life back!";

const difficultyMeta = {
  easy: "Easy: 3 chapters with hints enabled except the final chapter.",
  normal: "Normal: 4 chapters with standard hint rules.",
  hard: "Hard: 4 chapters with no hints in any chapter."
};

function getActiveChapters() {
  return state.difficulty === "easy" ? chapters.slice(0, 3) : chapters;
}

function hasHintsForChapter(chapter) {
  if (!chapter) return false;
  if (state.difficulty === "hard") return false;

  const activeChapters = getActiveChapters();
  const isFinalChapter = state.currentChapterIndex === activeChapters.length - 1;
  return !isFinalChapter;
}

function playSfx(sound, restartFromBeginning = false) {
  if (!sound) return;
  if (restartFromBeginning) sound.currentTime = 0;

  sound.play().catch(() => {
    // Ignore rejected play promises (browser gesture/audio policies).
  });
}

function cancelPendingGameOverSequence() {
  if (gameOverSequenceTimer) {
    clearTimeout(gameOverSequenceTimer);
    gameOverSequenceTimer = null;
  }

  if (gameOverEndedHandler) {
    sfx.gameOver.removeEventListener("ended", gameOverEndedHandler);
    gameOverEndedHandler = null;
  }
}

function playGameOverSequence() {
  cancelPendingGameOverSequence();
  let playedSecond = false;

  const playSecond = () => {
    if (playedSecond) return;
    playedSecond = true;
    playSfx(sfx.gameOverKid, true);
  };

  const onEnded = () => {
    playSecond();
    gameOverEndedHandler = null;
  };

  gameOverEndedHandler = onEnded;
  sfx.gameOver.addEventListener("ended", onEnded, { once: true });
  playSfx(sfx.gameOver, true);

  if (!Number.isFinite(sfx.gameOver.duration) || sfx.gameOver.duration <= 0) {
    gameOverSequenceTimer = setTimeout(() => {
      playSecond();
      gameOverSequenceTimer = null;
    }, 1700);
  }
}

function handleGlobalClickSound(event) {
  const target = event.target.closest("button, a, [role='button']");
  if (!target) return;
  if (target.disabled || target.getAttribute("aria-disabled") === "true") return;
  if (target.id === "fightCurseBtn") return;
  playSfx(sfx.click, true);
}

function getCurrentChapter() {
  const activeChapters = getActiveChapters();
  return activeChapters[state.currentChapterIndex] || null;
}

function getCurrentLevel() {
  const chapter = getCurrentChapter();
  if (!chapter) return null;
  return chapter.levels[state.currentLevelIndex] || null;
}

function setExpression(expression) {
  const pose = {
    neutral: "translateY(0) scale(1)",
    win: "translateY(-2px) scale(1.03)",
    lose: "translateY(1px) scale(.98)"
  };
  avatar.innerHTML = `<img src="imgs/icon.png" alt="Grey" style="width:100%; height:100%; object-fit:cover; object-position:center 15%; border-radius:16px; transform:${pose[expression] || pose.neutral}; transition:transform .2s ease;">`;
}

function updateInteractionLock() {
  const shouldLock = document.getElementById("story").classList.contains("active")
    && (state.storyMode === "game-over-restart" || state.storyMode === "happy-ending-restart");
  document.body.classList.toggle("force-restart-lock", shouldLock);
}

function clampMood(value) {
  return Math.max(0, Math.min(100, value));
}

function getMoodLabel() {
  if (state.moodGameOver) return "Mood: knocked down - game over";
  if (state.moodPct >= 80) return "Mood: unstoppable";
  if (state.moodPct >= 60) return "Mood: confident";
  if (state.moodPct >= 40) return "Mood: steady";
  if (state.moodPct >= 20) return "Mood: worried";
  return "Mood: drained";
}

function updateMoodUI() {
  moodText.textContent = getMoodLabel();
  progressFill.style.width = `${state.moodPct}%`;
  progressBar.classList.toggle("danger", state.moodGameOver);
}

function updateDifficultyUI() {
  difficultyBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.difficulty === state.difficulty);
  });

  if (difficultyModeText) {
    difficultyModeText.textContent = difficultyMeta[state.difficulty] || difficultyMeta.normal;
  }
}

function setDifficulty(mode) {
  if (!difficultyMeta[mode]) return;

  state.difficulty = mode;
  state.currentChapterIndex = 0;
  state.currentLevelIndex = 0;
  state.completedChapters = 0;
  state.mistakes = 0;
  state.hintsLeft = 0;
  state.guessed = new Set();
  state.storyMode = "map";
  state.canPlay = false;

  updateDifficultyUI();
  renderMap();
}

function adjustMood(delta, options = {}) {
  state.moodPct = clampMood(state.moodPct + delta);
  state.moodGameOver = Boolean(options.gameOver);
  updateMoodUI();
}

function resetIntroActions() {
  if (!introActions) return;
  introActions.classList.remove("reveal");
  introActions.classList.add("hidden");
}

function stopIntroTypewriter() {
  if (!introTypeTimer) return;
  clearInterval(introTypeTimer);
  introTypeTimer = null;
}

function runIntroTypewriter() {
  if (!introCallout) return;
  stopIntroTypewriter();
  introCallout.textContent = "";

  let index = 0;
  introTypeTimer = setInterval(() => {
    index += 1;
    introCallout.textContent = introCalloutFullText.slice(0, index);
    if (index >= introCalloutFullText.length) {
      stopIntroTypewriter();
    }
  }, 18);
}

function updateIntroCurseUI() {
  if (!introScene || !curseStatus || !fightCurseBtn) return;

  introScene.classList.remove("curse-stage-1", "curse-stage-2", "curse-stage-3");

  if (state.introCursePushes >= 3) {
    introScene.classList.add("curse-stage-3");
    curseStatus.textContent = "Curse pressure: fading";
    fightCurseBtn.textContent = "Curse Pushed Back";
    fightCurseBtn.disabled = true;
    return;
  }

  if (state.introCursePushes === 2) {
    introScene.classList.add("curse-stage-2");
    curseStatus.textContent = "Curse pressure: weakening";
  } else if (state.introCursePushes === 1) {
    introScene.classList.add("curse-stage-1");
    curseStatus.textContent = "Curse pressure: unstable";
  } else {
    curseStatus.textContent = "Curse pressure: high";
  }

  fightCurseBtn.textContent = "Push Back the Curse";
  fightCurseBtn.disabled = false;
}

function handleIntroSceneMove(event) {
  if (!introScene || !witchArt) return;

  const rect = introScene.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - 0.5;
  const py = (event.clientY - rect.top) / rect.height - 0.5;

  introScene.style.transform = `translate(${px * -4}px, ${py * -2}px)`;
  witchArt.style.transform = `translate(${px * 7}px, ${py * 5}px)`;
}

function resetIntroSceneMotion() {
  if (!introScene || !witchArt) return;
  introScene.style.transform = "translate(0, 0)";
  witchArt.style.transform = "translate(0, 0)";
}

function bindIntroInteractivity() {
  if (!introScene || introParallaxBound) return;
  introScene.addEventListener("pointermove", handleIntroSceneMove);
  introScene.addEventListener("pointerleave", resetIntroSceneMotion);
  introParallaxBound = true;
}

function revealIntroActionsWithDelay() {
  if (!introActions) return;
  if (introStartRevealTimer) clearTimeout(introStartRevealTimer);

  resetIntroActions();
  introStartRevealTimer = setTimeout(() => {
    introActions.classList.remove("hidden");
    introActions.classList.add("reveal");
  }, 2600);
}

function show(id) {
  if (!state.hasStarted && id !== "intro") {
    id = "intro";
  }

  if (id === "game" && state.currentChapterIndex === 0 && !state.introSeen) {
    show("intro");
    return;
  }

  screens.forEach((screenId) => document.getElementById(screenId).classList.remove("active"));
  document.getElementById(id).classList.add("active");
  titleEl.textContent = id[0].toUpperCase() + id.slice(1);
  updateMoodUI();

  if (howToCard && id !== "home") {
    howToCard.classList.add("hidden");
  }

  navBtns.forEach((btn) => btn.classList.remove("active"));
  const activeBtn = document.querySelector(`.nav button[data-go="${id}"]`);
  if (activeBtn) activeBtn.classList.add("active");

  if (id === "intro") {
    bindIntroInteractivity();
    runIntroTypewriter();
    updateIntroCurseUI();
    revealIntroActionsWithDelay();
  } else if (introStartRevealTimer) {
    clearTimeout(introStartRevealTimer);
    introStartRevealTimer = null;
    stopIntroTypewriter();
    if (introCallout) introCallout.textContent = introCalloutFullText;
  }

  if (id === "map") renderMap();
  if (id === "story" && state.storyMode === "map") {
    storyTitle.textContent = "Story Journal";
    storyBody.textContent = "Story moments appear here after you complete a level or chapter.";
    nextWordBtn.textContent = "Go to Map";
    if (storyMapBtn) storyMapBtn.style.display = "none";
  } else if (id === "story" && (state.storyMode === "game-over-restart" || state.storyMode === "happy-ending-restart")) {
    if (storyMapBtn) storyMapBtn.style.display = "none";
  } else if (id === "story") {
    if (storyMapBtn) storyMapBtn.style.display = "";
  }
  if (id === "game") {
    state.canPlay = true;
    renderGame();
  }

  updateInteractionLock();
}

function pulseWin() {
  progressBar.classList.remove("pulseGlow");
  avatar.classList.remove("pulseGlow");
  void progressBar.offsetWidth;
  progressBar.classList.add("pulseGlow");
  avatar.classList.add("pulseGlow");
}

function shakeOops() {
  mainCard.classList.remove("shake");
  void mainCard.offsetWidth;
  mainCard.classList.add("shake");
}

function getConfettiLayer() {
  if (!confettiLayer) {
    confettiLayer = document.createElement("div");
    confettiLayer.className = "confetti-layer";
    document.body.appendChild(confettiLayer);
  }
  return confettiLayer;
}

function launchConfetti() {
  const layer = getConfettiLayer();
  const colors = ["#ffc91d", "#1e88d9", "#47c76b", "#ff6b7a", "#ffffff"];
  const pieces = 140;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `translateY(-10vh) rotate(${Math.random() * 180}deg)`;
    piece.style.animationDuration = `${2 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.35}s`;
    layer.appendChild(piece);
  }

  setTimeout(() => {
    if (layer) layer.innerHTML = "";
  }, 3800);
}

function updateFunds() {
  fundsChip.textContent = `$${state.funds} / $${state.goal}`;
}

function getVisibleWord() {
  const level = getCurrentLevel();
  if (!level) return [];
  return level.answer.split("").map((ch) => (state.guessed.has(ch) ? ch : "_"));
}

function isCurrentWordSolved() {
  return !getVisibleWord().includes("_");
}

function renderWordSlots() {
  const letters = getVisibleWord();
  wordSlots.innerHTML = letters.map((letter) => `<span>${letter}</span>`).join("");
}

function renderKeyboard() {
  const level = getCurrentLevel();
  if (!level) {
    keyGrid.innerHTML = "";
    return;
  }

  keyGrid.innerHTML = alphabet
    .map((letter) => {
      const used = state.guessed.has(letter);
      const good = used && level.answer.includes(letter);
      const bad = used && !level.answer.includes(letter);
      const classes = ["key"];
      if (used) classes.push("used");
      if (good) classes.push("good");
      if (bad) classes.push("bad");
      const disabled = used || !state.canPlay ? "disabled" : "";
      return `<button class="${classes.join(" ")}" data-letter="${letter}" type="button" ${disabled}>${letter}</button>`;
    })
    .join("");
}

function renderStats() {
  const chapter = getCurrentChapter();
  const level = getCurrentLevel();
  if (!chapter || !level) return;

  gameTitle.textContent = `Chapter ${chapter.id} - ${chapter.title} • Level ${state.currentLevelIndex + 1}/${chapter.levels.length}`;
  if (!hasHintsForChapter(chapter)) {
    gameStats.textContent = `Mistakes: ${state.mistakes}/${chapter.maxMistakes} • Hints: none`;
    hintBtn.textContent = state.difficulty === "hard" ? "No Hints (Hard Mode)" : "No Hints (Final Chapter)";
  } else {
    gameStats.textContent = `Mistakes: ${state.mistakes}/${chapter.maxMistakes} • Hints left: ${state.hintsLeft}`;
    hintBtn.textContent = "Use Hint";
  }
  clueText.textContent = level.clue;
  const misses = [...state.guessed].filter((ch) => !level.answer.includes(ch));
  wrongLetters.textContent = `Wrong letters: ${misses.length ? misses.join(", ") : "none"}`;
  waterLevel.style.height = `${state.waterPct}%`;
  hintBtn.disabled = state.hintsLeft <= 0 || !state.canPlay;
}

function renderGame() {
  renderWordSlots();
  renderKeyboard();
  renderStats();
  updateFunds();
}

function renderMap() {
  const activeChapters = getActiveChapters();
  const visibleCount = Math.min(activeChapters.length, state.currentChapterIndex + 1);
  const visibleChapters = activeChapters.slice(0, visibleCount);

  mapChapters.innerHTML = visibleChapters
    .map((chapter, idx) => {
      const chapterIndex = idx;
      const done = chapterIndex < state.completedChapters;
      const current = chapterIndex === state.currentChapterIndex && state.completedChapters < activeChapters.length;
      const actionText = done ? "Done ✓" : current ? "Play ▶" : "Locked";
      const statusText = done ? "Complete" : current ? "Current" : "Locked";
      return `
        <div class="card" style="box-shadow:none; margin-bottom:10px;">
          <div class="bd">
            <div style="display:flex; justify-content:space-between; gap:10px;">
              <div>
                <b>Chapter ${chapter.id}</b>
                <div class="muted" style="font-size:12px;">${chapter.title} • ${chapter.levels.length} levels • ${statusText}</div>
              </div>
              <button class="chip" data-chapter-index="${chapterIndex}" type="button" ${current ? "" : "disabled"}>${actionText}</button>
            </div>
          </div>
        </div>`;
    })
    .join("");

  if (state.completedChapters >= activeChapters.length) {
    mapHint.textContent = "All chapters complete! Mission complete: more families now have access to clean water!";
  } else {
    mapHint.textContent = `Only Chapter ${state.currentChapterIndex + 1} is unlocked! Finish it to unlock the next chapter!`;
  }
}

function openStory(title, body, mode, buttonText) {
  state.canPlay = false;
  state.storyMode = mode;
  storyTitle.textContent = title;
  storyBody.textContent = body;
  nextWordBtn.textContent = buttonText;
  show("story");
}

function revealStarterLetters() {
  const chapter = getCurrentChapter();
  const level = getCurrentLevel();
  if (!chapter || !level) return;

  state.guessed = new Set();
  if (chapter.starterLetters <= 0) return;

  const chars = level.answer.split("");
  state.guessed.add(chars[0]);

  if (chapter.starterLetters > 1) {
    state.guessed.add(chars[chars.length - 1]);
  }
}

function beginCurrentLevel() {
  const chapter = getCurrentChapter();
  if (!chapter) return;

  state.mistakes = 0;
  state.hintsLeft = hasHintsForChapter(chapter) ? chapter.hintsPerLevel : 0;
  revealStarterLetters();
  state.canPlay = true;
  show("game");
}

function restartRunToIntro() {
  cancelPendingGameOverSequence();
  state.funds = 420;
  state.waterPct = 62;
  state.moodPct = 35;
  state.moodGameOver = false;
  state.currentChapterIndex = 0;
  state.currentLevelIndex = 0;
  state.completedChapters = 0;
  state.mistakes = 0;
  state.hintsLeft = 0;
  state.guessed = new Set();
  state.hasStarted = false;
  state.introSeen = false;
  state.introCursePushes = 0;
  state.canPlay = false;
  state.storyMode = "map";

  document.body.classList.remove("force-restart-lock");
  document.body.classList.add("prestart");
  updateMoodUI();
  updateFunds();
  renderMap();
  show("intro");
}

function startCurrentChapter() {
  if (state.currentChapterIndex === 0 && !state.introSeen) {
    show("intro");
    return;
  }

  const level = getCurrentLevel();
  const hasActiveProgress = state.canPlay && level && !isCurrentWordSolved();
  if (hasActiveProgress) {
    show("game");
    return;
  }

  beginCurrentLevel();
}

function advanceAfterLevelWin() {
  const chapter = getCurrentChapter();
  if (!chapter) return;

  const level = getCurrentLevel();
  state.funds = Math.min(state.goal, state.funds + level.reward);
  state.waterPct = Math.min(90, state.waterPct + 6);
  launchConfetti();
  setExpression("win");
  adjustMood(10, { gameOver: false });
  pulseWin();

  const levelNumber = state.currentLevelIndex + 1;
  const isChapterComplete = levelNumber >= chapter.levels.length;

  if (!isChapterComplete) {
    playSfx(sfx.levelWin, true);
    state.currentLevelIndex += 1;
    openStory(
      "✅ Level complete!",
      `Great work! You cleared level ${levelNumber}/${chapter.levels.length} in Chapter ${chapter.id}, helping push the clean water mission forward!`,
      "next-level",
      "Next Level"
    );
  } else {
    const activeChapters = getActiveChapters();
    state.completedChapters += 1;

    if (state.currentChapterIndex < activeChapters.length - 1) {
      playSfx(sfx.nextChapter, true);
      state.currentChapterIndex += 1;
      state.currentLevelIndex = 0;
      openStory(
        "🎉 Chapter complete!",
        `${storyByChapter[chapter.id]} Chapter ${chapter.id + 1} is now unlocked.`,
        "next-chapter",
        "Start Next Chapter"
      );
    } else {
      cancelPendingGameOverSequence();
      playSfx(sfx.trumpets, true);
      openStory(
        "🏁 Happy Ending",
        "You did it - the drought witch is defeated, the curse is broken, and water begins to flow again. Grey returns home to tears, hugs, and relief as wells refill and families can finally drink safely. This is why charity: water's mission matters so deeply: clean water means fewer children getting sick, fewer mothers walking hours for water, more kids in school, and more time for families to live, work, and dream. Your journey reminds us that every act of compassion can help bring clean, safe water to everyone.",
        "happy-ending-restart",
        "Restart the journey again"
      );
    }
  }

  setTimeout(() => setExpression("neutral"), 900);
  updateFunds();
  renderMap();
}

function loseLevel() {
  const chapter = getCurrentChapter();
  if (!chapter) return;

  playGameOverSequence();
  state.waterPct = Math.max(10, state.waterPct - 10);
  setExpression("lose");
  adjustMood(-22, { gameOver: true });
  shakeOops();
  openStory(
    "☠️ Game Over",
    "Grey says: We cannot give up now. The drought witch wins when we stop trying. Learn from this run, focus, and come back stronger.",
    "game-over-restart",
    "Restart the journey again"
  );
  setTimeout(() => setExpression("neutral"), 900);
}

function applyGuess(rawLetter) {
  if (!state.canPlay) return;

  const level = getCurrentLevel();
  const chapter = getCurrentChapter();
  if (!level || !chapter) return;

  const letter = rawLetter.toUpperCase();
  if (!alphabet.includes(letter) || state.guessed.has(letter)) return;

  state.guessed.add(letter);
  if (!level.answer.includes(letter)) {
    state.mistakes += 1;
    state.waterPct = Math.max(10, state.waterPct - 3);
    shakeOops();
  }

  if (isCurrentWordSolved()) {
    advanceAfterLevelWin();
  } else if (state.mistakes >= chapter.maxMistakes) {
    loseLevel();
  } else {
    renderGame();
  }
}

function useHint() {
  if (!state.canPlay || state.hintsLeft <= 0) return;

  const level = getCurrentLevel();
  if (!level) return;

  const hidden = level.answer.split("").filter((ch) => !state.guessed.has(ch));
  if (!hidden.length) return;

  const reveal = hidden[Math.floor(Math.random() * hidden.length)];
  state.hintsLeft -= 1;
  applyGuess(reveal);
}

function handleStoryNext() {
  if (state.storyMode === "next-level") {
    beginCurrentLevel();
    return;
  }
  if (state.storyMode === "next-chapter") {
    startCurrentChapter();
    return;
  }
  if (state.storyMode === "game-over-restart") {
    restartRunToIntro();
    return;
  }
  if (state.storyMode === "happy-ending-restart") {
    restartRunToIntro();
    return;
  }
  if (state.storyMode === "retry-level") {
    beginCurrentLevel();
    return;
  }
  show("map");
}

function handleMapChapterClick(event) {
  const btn = event.target.closest("button[data-chapter-index]");
  if (!btn || btn.disabled) return;

  const chapterIndex = Number(btn.dataset.chapterIndex);
  if (Number.isNaN(chapterIndex) || chapterIndex !== state.currentChapterIndex) return;

  startCurrentChapter();
}

function handleDifficultySelect(event) {
  const btn = event.target.closest("button[data-difficulty]");
  if (!btn) return;
  setDifficulty(btn.dataset.difficulty);
}

function handleKeyClick(event) {
  const btn = event.target.closest("button[data-letter]");
  if (!btn) return;
  applyGuess(btn.dataset.letter);
}

function handlePhysicalKeyboard(event) {
  if (document.getElementById("story").classList.contains("active") && event.key === "Enter") {
    handleStoryNext();
    return;
  }
  if (!document.getElementById("game").classList.contains("active")) return;
  if (/^[a-z]$/i.test(event.key)) applyGuess(event.key);
}

function completeIntroAndStartChapter1() {
  if (state.hasStarted) return;
  playSfx(sfx.magicSpell, true);
  state.hasStarted = true;
  state.introSeen = true;
  state.currentChapterIndex = 0;
  state.currentLevelIndex = 0;
  if (!introTransitionOverlay) {
    document.body.classList.remove("prestart");
    beginCurrentLevel();
    return;
  }

  introTransitionOverlay.classList.remove("active");
  void introTransitionOverlay.offsetWidth;
  introTransitionOverlay.classList.add("active");

  if (introGameplayStartTimer) clearTimeout(introGameplayStartTimer);
  introGameplayStartTimer = setTimeout(() => {
    document.body.classList.remove("prestart");
    beginCurrentLevel();
  }, 320);

  if (introTransitionTimer) clearTimeout(introTransitionTimer);
  introTransitionTimer = setTimeout(() => {
    introTransitionOverlay.classList.remove("active");
  }, 2600);
}

function handleIntroSceneStartKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  completeIntroAndStartChapter1();
}

function pushBackCurse() {
  if (state.introCursePushes >= 3) return;
  playSfx(sfx.cursePush, true);
  state.introCursePushes += 1;
  updateIntroCurseUI();
  adjustMood(3, { gameOver: false });
}

function openHowToPlay() {
  show("home");
  if (!howToCard) return;

  const isHidden = howToCard.classList.contains("hidden");
  if (!isHidden) {
    howToCard.classList.add("hidden");
    return;
  }

  howToCard.classList.remove("hidden");
  howToCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function bindIfExists(element, eventName, handler) {
  if (!element) return;
  element.addEventListener(eventName, handler);
}

function stopMusicFade() {
  if (!musicFadeTimer) return;
  clearInterval(musicFadeTimer);
  musicFadeTimer = null;
}

function fadeMusicTo(targetVolume, durationMs = 700) {
  stopMusicFade();

  const startVolume = ambientMusic.volume;
  const diff = targetVolume - startVolume;
  const steps = Math.max(1, Math.floor(durationMs / 50));
  let step = 0;

  musicFadeTimer = setInterval(() => {
    step += 1;
    ambientMusic.volume = Math.min(1, Math.max(0, startVolume + (diff * step) / steps));

    if (step >= steps) {
      ambientMusic.volume = targetVolume;
      stopMusicFade();
    }
  }, 50);
}

function updateMusicToggle() {
  if (!musicToggleBtn) return;
  musicToggleBtn.textContent = wantsMusicOn ? "Music: On" : "Music: Off";
  musicToggleBtn.setAttribute("aria-pressed", wantsMusicOn ? "true" : "false");
}

async function startBackgroundMusic() {
  if (!wantsMusicOn) return false;
  try {
    await ambientMusic.play();
    musicEnabled = true;
    fadeMusicTo(musicTargetVolume, 900);
    updateMusicToggle();
    return true;
  } catch (error) {
    musicEnabled = false;
    updateMusicToggle();
    return false;
  }
}

function stopBackgroundMusic() {
  wantsMusicOn = false;
  musicEnabled = false;
  fadeMusicTo(0, 260);
  setTimeout(() => {
    if (!musicEnabled) ambientMusic.pause();
  }, 280);
  updateMusicToggle();
}

async function toggleBackgroundMusic() {
  if (wantsMusicOn && musicEnabled) {
    stopBackgroundMusic();
    return;
  }

  if (wantsMusicOn && !musicEnabled) {
    await startBackgroundMusic();
    return;
  }

  wantsMusicOn = true;
  updateMusicToggle();
  await startBackgroundMusic();
}

function attemptMusicAutoplay() {
  return;
}

navBtns.forEach((btn) => bindIfExists(btn, "click", () => show(btn.dataset.go)));
bindIfExists(document.getElementById("startBtn"), "click", () => show("map"));
bindIfExists(howToBtn, "click", openHowToPlay);
bindIfExists(introStartBtn, "click", completeIntroAndStartChapter1);
bindIfExists(introScene, "click", completeIntroAndStartChapter1);
bindIfExists(introScene, "keydown", handleIntroSceneStartKeydown);
bindIfExists(introSkipBtn, "click", () => show("map"));
bindIfExists(fightCurseBtn, "click", pushBackCurse);
bindIfExists(mapChapters, "click", handleMapChapterClick);
bindIfExists(keyGrid, "click", handleKeyClick);
bindIfExists(hintBtn, "click", useHint);
bindIfExists(quitBtn, "click", () => show("map"));
bindIfExists(nextWordBtn, "click", handleStoryNext);
bindIfExists(storyMapBtn, "click", () => show("map"));
bindIfExists(musicToggleBtn, "click", toggleBackgroundMusic);
difficultyBtns.forEach((btn) => bindIfExists(btn, "click", handleDifficultySelect));
document.addEventListener("keydown", handlePhysicalKeyboard);
document.addEventListener("click", handleGlobalClickSound);

window.show = show;

setExpression("neutral");
updateMoodUI();
updateMusicToggle();
updateDifficultyUI();
show("intro");
renderMap();
updateFunds();
