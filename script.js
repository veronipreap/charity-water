    const screens = ["home", "map", "game", "story"];
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
    const mapCardCh2 = document.getElementById("map").querySelectorAll(".card")[1];

    const chapterWords = [
      {
        answer: "WATER",
        clue: "Clue: We are raising money for clean _____.",
        story: "Your post resonates, and the first donations roll in.",
        reward: 90
      },
      {
        answer: "WELL",
        clue: "Clue: A place where communities draw clean water.",
        story: "Supporters share how one well can change a whole village.",
        reward: 110
      },
      {
        answer: "SMILE",
        clue: "Clue: A happy face after good news.",
        story: "More people donate, and your confidence grows.",
        reward: 120
      },
      {
        answer: "HOME",
        clue: "Clue: The place you are trying to return to.",
        story: "You hit your goal and can finally head home.",
        reward: 140
      }
    ];

    const state = {
      funds: 420,
      goal: 1200,
      waterPct: 62,
      maxMistakes: 8,
      hintsLeft: 5,
      currentWord: 0,
      mistakes: 0,
      guessed: new Set(),
      solvedWords: 0,
      canPlay: false,
      storyPendingNext: false
    };

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
        home: "Mood: calm and confident 😌",
        map: "Mood: planning the route 🗺️",
        game: "Mood: focus mode 🎯",
        story: "Mood: proud of your progress ✨"
      };
      moodText.textContent = moods[screenId] || "Mood: cheering you on ✨";
    }

    function show(id) {
      screens.forEach((screenId) => document.getElementById(screenId).classList.remove("active"));
      document.getElementById(id).classList.add("active");

      titleEl.textContent = id[0].toUpperCase() + id.slice(1);
      setMoodForScreen(id);

      navBtns.forEach((btn) => btn.classList.remove("active"));
      const activeBtn = document.querySelector(`.nav button[data-go="${id}"]`);
      if (activeBtn) activeBtn.classList.add("active");

      if (id === "game") {
        state.canPlay = true;
        renderGame();
      }
      if (id === "map") {
        renderMapCard();
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

    function getWordData() {
      return chapterWords[state.currentWord];
    }

    function getVisibleWord() {
      const answer = getWordData().answer;
      return answer.split("").map((ch) => (state.guessed.has(ch) ? ch : "_"));
    }

    function isCurrentWordSolved() {
      return !getVisibleWord().includes("_");
    }

    function updateFunds() {
      const pct = Math.round((state.funds / state.goal) * 100);
      progressFill.style.width = `${Math.min(100, pct)}%`;
      fundsChip.textContent = `$${state.funds} / $${state.goal}`;
    }

    function renderWordSlots() {
      const letters = getVisibleWord();
      wordSlots.innerHTML = letters.map((letter) => `<span>${letter}</span>`).join("");
    }

    function renderKeyboard() {
      const answer = getWordData().answer;
      keyGrid.innerHTML = alphabet
        .map((letter) => {
          const used = state.guessed.has(letter);
          const good = used && answer.includes(letter);
          const bad = used && !answer.includes(letter);
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
      gameTitle.textContent = `Chapter 2 - Word ${state.currentWord + 1}/${chapterWords.length}`;
      gameStats.textContent = `Mistakes: ${state.mistakes}/${state.maxMistakes} • Hints left: ${state.hintsLeft}`;
      clueText.textContent = getWordData().clue;
      const misses = [...state.guessed].filter((ch) => !getWordData().answer.includes(ch));
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

    function renderMapCard() {
      const status = state.solvedWords === chapterWords.length ? "Done ✓" : state.solvedWords > 0 ? "Resume ▶" : "Play ▶";
      const progress = `${state.solvedWords}/${chapterWords.length} solved`;
      mapCardCh2.querySelector(".muted").textContent = `Fundraising • ${progress}`;
      mapCardCh2.querySelector(".chip").textContent = status;
      mapCardCh2.querySelector(".chip").setAttribute("onclick", "show('game')");
      mapCardCh2.querySelector(".chip").style.cursor = "pointer";
    }

    function openStory(title, body, canGoNext) {
      state.canPlay = false;
      state.storyPendingNext = canGoNext;
      storyTitle.textContent = title;
      storyBody.textContent = body;
      nextWordBtn.textContent = canGoNext ? "Next Word" : "Try Again";
      show("story");
    }

    function resetWordState() {
      state.mistakes = 0;
      const answer = getWordData().answer;
      state.guessed = new Set([answer[0]]);
      if (answer.length >= 5) {
        state.guessed.add(answer[answer.length - 1]);
      }
      state.canPlay = true;
    }

    function startGame() {
      show("game");
      renderGame();
    }

    function winWord() {
      state.solvedWords += 1;
      state.funds = Math.min(state.goal, state.funds + getWordData().reward);
      state.waterPct = Math.min(90, state.waterPct + 8);
      setExpression("win");
      moodText.textContent = "Mood: proud of you ✨";
      pulseWin();

      const wordStory = getWordData().story;
      const isFinalWord = state.currentWord >= chapterWords.length - 1;
      if (!isFinalWord) {
        openStory("✅ Word solved!", `${wordStory} +$${getWordData().reward} added to your goal.`, true);
      } else {
        openStory("🎉 Chapter complete!", `${wordStory} You completed all words in this chapter.`, false);
      }

      setTimeout(() => setExpression("neutral"), 900);
      renderMapCard();
      updateFunds();
    }

    function loseWord() {
      state.waterPct = Math.max(10, state.waterPct - 10);
      setExpression("lose");
      moodText.textContent = "Mood: don't panic, regroup and try again 😤";
      shakeOops();
      openStory("💧 Tank dropped", "You ran out of attempts on this word. Take a breath and try the word again.", false);
      setTimeout(() => setExpression("neutral"), 900);
    }

    function applyGuess(rawLetter) {
      if (!state.canPlay) return;
      const letter = rawLetter.toUpperCase();
      const answer = getWordData().answer;
      if (!alphabet.includes(letter) || state.guessed.has(letter)) return;

      state.guessed.add(letter);
      if (!answer.includes(letter)) {
        state.mistakes += 1;
        state.waterPct = Math.max(10, state.waterPct - 4);
        shakeOops();
      }

      if (isCurrentWordSolved()) {
        winWord();
      } else if (state.mistakes >= state.maxMistakes) {
        loseWord();
      } else {
        renderGame();
      }
    }

    function useHint() {
      if (!state.canPlay || state.hintsLeft <= 0) return;
      const answer = getWordData().answer;
      const hidden = answer.split("").filter((ch) => !state.guessed.has(ch));
      if (!hidden.length) return;
      const reveal = hidden[Math.floor(Math.random() * hidden.length)];
      state.hintsLeft -= 1;
      applyGuess(reveal);
    }

    function handleStoryNext() {
      if (state.storyPendingNext) {
        state.currentWord += 1;
        resetWordState();
        startGame();
        return;
      }

      if (state.mistakes >= state.maxMistakes) {
        resetWordState();
        startGame();
        return;
      }

      if (state.solvedWords >= chapterWords.length) {
        show("map");
      } else {
        resetWordState();
        startGame();
      }
    }

    function handleKeyClick(event) {
      const btn = event.target.closest("button[data-letter]");
      if (!btn) return;
      applyGuess(btn.dataset.letter);
    }

    function handlePhysicalKeyboard(event) {
      if (document.getElementById("game").classList.contains("active") === false) return;
      if (event.key === "Enter") {
        if (document.getElementById("story").classList.contains("active")) handleStoryNext();
        return;
      }
      if (/^[a-z]$/i.test(event.key)) applyGuess(event.key);
    }

    navBtns.forEach((btn) => btn.addEventListener("click", () => show(btn.dataset.go)));
    document.getElementById("startBtn").addEventListener("click", () => show("map"));
    keyGrid.addEventListener("click", handleKeyClick);
    hintBtn.addEventListener("click", useHint);
    quitBtn.addEventListener("click", () => show("map"));
    nextWordBtn.addEventListener("click", handleStoryNext);
    storyMapBtn.addEventListener("click", () => show("map"));
    document.addEventListener("keydown", handlePhysicalKeyboard);

    window.show = show;

    resetWordState();
    setExpression("neutral");
    setMoodForScreen("home");
    renderMapCard();
    renderGame();
