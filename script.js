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

let confettiLayer = null;
let introStartRevealTimer = null;
let introTypeTimer = null;
let introParallaxBound = false;

const chapters = [
  {
    id: 1,
    title: "The Decision",
    subtitle: "Start with hope",
    hintsPerLevel: 4,
    maxMistakes: 8,
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
    maxMistakes: 7,
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
    maxMistakes: 6,
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
    maxMistakes: 6,
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

function getCurrentChapter() {
  return chapters[state.currentChapterIndex];
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

function setMoodForScreen(screenId) {
  const moods = {
    intro: "Mood: determined to stop the drought witch ⚔️",
    home: "Mood: calm and confident 😌",
    map: "Mood: planning the route 🗺️",
    game: "Mood: locked in 🎯",
    story: "Mood: celebrating wins ✨"
  };
  moodText.textContent = moods[screenId] || "Mood: cheering you on ✨";
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
  setMoodForScreen(id);

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
  if (id === "game") {
    state.canPlay = true;
    renderGame();
  }
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
  const pct = Math.round((state.funds / state.goal) * 100);
  progressFill.style.width = `${Math.min(100, pct)}%`;
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
  if (chapter.id === chapters.length) {
    gameStats.textContent = `Mistakes: ${state.mistakes}/${chapter.maxMistakes} • Hints: none`;
    hintBtn.textContent = "No Hints (Final Chapter)";
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
  const visibleCount = Math.min(chapters.length, state.currentChapterIndex + 1);
  const visibleChapters = chapters.slice(0, visibleCount);

  mapChapters.innerHTML = visibleChapters
    .map((chapter, idx) => {
      const chapterIndex = idx;
      const done = chapterIndex < state.completedChapters;
      const current = chapterIndex === state.currentChapterIndex && state.completedChapters < chapters.length;
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

  if (state.completedChapters >= chapters.length) {
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
  state.hintsLeft = chapter.hintsPerLevel;
  revealStarterLetters();
  state.canPlay = true;
  show("game");
}

function startCurrentChapter() {
  if (state.currentChapterIndex === 0 && !state.introSeen) {
    show("intro");
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
  moodText.textContent = "Mood: proud of you ✨";
  pulseWin();

  const levelNumber = state.currentLevelIndex + 1;
  const isChapterComplete = levelNumber >= chapter.levels.length;

  if (!isChapterComplete) {
    state.currentLevelIndex += 1;
    openStory(
      "✅ Level complete!",
      `Great work! You cleared level ${levelNumber}/${chapter.levels.length} in Chapter ${chapter.id}, helping push the clean water mission forward!`,
      "next-level",
      "Next Level"
    );
  } else {
    state.completedChapters += 1;

    if (chapter.id < chapters.length) {
      state.currentChapterIndex += 1;
      state.currentLevelIndex = 0;
      openStory(
        "🎉 Chapter complete!",
        `${storyByChapter[chapter.id]} Chapter ${chapter.id + 1} is now unlocked.`,
        "next-chapter",
        "Start Next Chapter"
      );
    } else {
      openStory(
        "🏁 Happy Ending",
        "Grey arrives home to hugs, laughter, and relief! But the bigger win is this: your journey helped fund charity: water's goal to bring clean, safe water to every person, so more communities can thrive for years to come!",
        "happy-ending",
        "See Journey Map"
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

  state.waterPct = Math.max(10, state.waterPct - 10);
  setExpression("lose");
  moodText.textContent = "Mood: reset and try again 😤";
  shakeOops();
  openStory(
    "💧 Level failed",
    `You ran out of tries on this level in Chapter ${chapter.id}! Take a breath and try again!`,
    "retry-level",
    "Try Again"
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
  state.hasStarted = true;
  state.introSeen = true;
  state.currentChapterIndex = 0;
  state.currentLevelIndex = 0;
  document.body.classList.remove("prestart");
  beginCurrentLevel();
}

function handleIntroSceneStartKeydown(event) {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  completeIntroAndStartChapter1();
}

function pushBackCurse() {
  if (state.introCursePushes >= 3) return;
  state.introCursePushes += 1;
  updateIntroCurseUI();
  moodText.textContent = state.introCursePushes >= 3
    ? "Mood: hopeful, the curse is breaking 🌤️"
    : "Mood: resisting the drought witch ⚔️";
}

function bindIfExists(element, eventName, handler) {
  if (!element) return;
  element.addEventListener(eventName, handler);
}

navBtns.forEach((btn) => bindIfExists(btn, "click", () => show(btn.dataset.go)));
bindIfExists(document.getElementById("startBtn"), "click", () => show("map"));
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
document.addEventListener("keydown", handlePhysicalKeyboard);

window.show = show;

setExpression("neutral");
show("intro");
renderMap();
updateFunds();
