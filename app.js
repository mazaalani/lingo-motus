import Game from "./Game.js";
import Grid from "./Grid.js";
import Ui from "./Ui.js";
import { language } from "./language.js";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => {
      console.log("sw reg", reg);
    })
    .catch((err) => {
      console.log(err);
    });
}

const optionsEl = document.querySelector("[data-optionsview]");
const welcomeEl = document.querySelector("[data-welcome]");
const optionsBtn = document.querySelector("[data-options]");
const keyboard = document.querySelector("[data-keyboard]");
const mapEl = document.querySelector("[data-map]");
const alertEl = document.querySelector("[data-alert-container]");
const timerEl = document.querySelector("[data-countdown-container]");
const bgEffectsEl = document.querySelector(".effects");
const gameEl = document.querySelector("[data-game-container]");
const guessGrid = document.querySelector("[data-guess-grid]");
const duration = 1 * 60;

const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

//a cherchee dans db les settings
let playerParams = { lang: "en", playerName: "heho" };
//let playerParams = {};

const UI = new Ui(playerParams);

//si nouveau afficher les options
if (!playerParams.playerName || !playerParams.lang) {
  Ui.zoomView(optionsEl, "in");
  playerParams = UI.getPlayerChoise();
} else {
  UI.displayGameStart();
}

//choix jeu
const gameTypeBtns = welcomeEl.querySelectorAll("[data-gameType]");
gameTypeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.gametype === "solo") {
      soloGame();
    }
    if (btn.dataset.gametype === "challenge") {
      alert("prochainement");
    }
    if (btn.dataset.gametype === "share") {
      alert("Share");
    }

    Ui.zoomView(optionsBtn, "out");
  });
});

function soloGame() {
  //view de la map lvl
  Ui.zoomView(welcomeEl, "out");
  Ui.zoomView(mapEl, "in");

  const lvls = mapEl.querySelectorAll("[data-lvl]");
  //bouttons des lvl
  lvls.forEach((lvl) => {
    if (lvl.classList.contains("unlockedlvl")) {
      let playBtn = lvl.querySelector(".playBtn");
      playBtn.addEventListener("click", () => {
        startGame();
      });
      let lvlRank = lvl.querySelector(".lvlRank");
      lvlRank.addEventListener("click", () => {
        console.log(lvlRank);
      });
    }
  });
}

function startGame() {
  let isOn = true;

  //view de la grille
  Ui.changeView(mapEl, gameEl);

  const game = new Game(playerParams);

  let actualGuess = game.initiActualGuess();

  let grid = new Grid(game.getLettersNumber());

  console.log("DEBUT DEBUG: ");
  console.log(game);
  console.log(game.getTargetWordNoAccents());
  console.log(game.getTargetWordObj().M);
  console.log("FIN DEBUT DEBUG -- ");

  displayLettresNumber();
  startInteraction();

  grid.highlightNextTiles(
    actualGuess,
    Array.from(guessGrid.querySelectorAll(":not([data-letter])"))
  );

  startTimer(duration);

  //timer
  function startTimer(duration) {
    let timer = duration,
      minutes,
      seconds;

    let t = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      //minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerEl.textContent = minutes + ":" + seconds;

      if (seconds <= 10 && minutes <= 0) {
        timerEl.classList.remove("blue");
        timerEl.classList.add("red");
        bgEffectsEl.classList.remove("flash");
        bgEffectsEl.classList.add("flash");
      }

      if (--timer < 0) {
        isOn = false;
        clearInterval(t);
        stopInteraction();
        //le jeu continu si une autre action est en cours (comme displayRightWord())
      }
    }, 1000);
  }

  function displayLettresNumber() {
    let text = playerParams.lang === "français" ? "Un mot de " : "A word of ";
    text += game.getLettersNumber();
    text += playerParams.lang === "français" ? " Lettres" : " Letters";
    alertEl.textContent = text;
  }

  function startInteraction() {
    if (isOn) {
      document.addEventListener("click", handleMouseClick);
      document.addEventListener("keydown", handleKeyPress);
    } else {
      //fin de la partie
    }
  }

  function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
      pressKey(e.target.dataset.key);
      return;
    }
  }

  function handleKeyPress(e) {
    if (e.key.match(/^[a-z]$/)) {
      pressKey(e.key);
      return;
    }
  }

  function stopInteraction() {
    document.removeEventListener("click", handleMouseClick);
    document.removeEventListener("keydown", handleKeyPress);
  }

  function pressKey(key) {
    grid.setNextTile(key);
    if (grid.getActiveTiles().length >= game.getLettersNumber()) {
      submitGuess();
    }
  }

  function submitGuess() {
    stopInteraction();

    let nonExistant = false;
    const activeTiles = [...grid.getActiveTiles()];

    const guess = activeTiles.reduce((word, tile) => {
      return word + tile.dataset.letter;
    }, "");

    //lettre se repete 3 fois d'affiler
    activeTiles.forEach((t) => {
      if (
        guess.includes(t.dataset.letter + t.dataset.letter + t.dataset.letter)
      )
        nonExistant = true;
    });

    if (nonExistant) {
      activeTiles.forEach((...params) => shakeTiles(...params));

      setTimeout(() => {
        const remainingTiles = guessGrid.querySelectorAll(
          ":not([data-letter])"
        );
        if (remainingTiles.length <= 0) {
          //end of try
          if (!game.checkGuessMatch(guess)) {
            displayRightWord();
            //next word
            return;
          }
        }
        if (isOn) {
          grid.highlightNextTiles(
            actualGuess,
            Array.from(guessGrid.querySelectorAll(":not([data-letter])"))
          );

          startInteraction();
        } else {
          //fin de la partie
        }
      }, 1500);

      return;
    }

    activeTiles.forEach((...params) => flipTile(...params, guess));
  }

  function shakeTiles(tile, index) {
    setTimeout(() => {
      tile.classList.add("shake", "cross");
      tile.dataset.state = "wrong";
    }, (index * FLIP_ANIMATION_DURATION) / 2);
  }

  function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter;
    const key = keyboard.querySelector(`[data-key="${letter}"i]`);
    setTimeout(() => {
      tile.classList.add("flip");
    }, (index * FLIP_ANIMATION_DURATION) / 2);

    tile.addEventListener(
      "transitionend",
      () => {
        //verification des lettres
        tile.classList.remove("flip");
        if (game.getTargetWordNoAccents()[index] === letter) {
          tile.dataset.state = "correct";
          key.classList.add("correct");
          actualGuess[index] = letter;
        } else if (game.getTargetWordNoAccents().includes(letter)) {
          tile.dataset.state = "wrong-location";
          key.classList.add("wrong-location");
        } else {
          tile.dataset.state = "wrong";
          key.classList.add("wrong");
        }

        if (index === array.length - 1) {
          tile.addEventListener(
            "transitionend",
            () => {
              startInteraction();
              checkWinLose(guess, array);
            },
            { once: true }
          );
        }
      },
      { once: true }
    );
  }

  function checkWinLose(guess, tiles) {
    if (game.checkGuessMatch(guess)) {
      stopInteraction();
      danceTiles(tiles);
      return;
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
    if (remainingTiles.length <= 0) {
      //end of try
      stopInteraction();
      displayRightWord();
    } else {
      if (!game.checkGuessMatch(guess) && isOn)
        grid.highlightNextTiles(actualGuess, remainingTiles);
    }
    if (!isOn) {
      //fin de la partie
    }
  }

  function danceTiles(tiles) {
    displayMeaning();
    tiles.forEach((tile, index, array) => {
      setTimeout(() => {
        tile.classList.add("dance");
        tile.addEventListener(
          "animationend",
          () => {
            tile.classList.remove("dance");
          },
          { once: true }
        );
        //a la derniere animation
        if (index === array.length - 1) {
          tile.addEventListener(
            "animationend",
            () => {
              setTimeout(() => {
                loadNextGuessWord();
              }, 500);
            },
            { once: true }
          );
        }
      }, index * DANCE_ANIMATION_DURATION);
    });

    setTimeout(() => {
      game.updateScore();
    }, DANCE_ANIMATION_DURATION * 2);
  }

  function displayRightWord() {
    displayMeaning();
    let lastTiles = Array.from(
      guessGrid.querySelectorAll("[data-letter]")
    ).slice(-game.getLettersNumber());
    lastTiles.forEach((tile, index, array) => {
      setTimeout(() => {
        tile.dataset.state = "correct";
        tile.classList.remove("cross");
        tile.classList.add("dance");
        tile.textContent = game.getTargetWordNoAccents()[index];
        //a la derniere animation
        if (index === array.length - 1 && isOn) {
          tile.addEventListener(
            "animationend",
            () => {
              setTimeout(() => {
                loadNextGuessWord();
              }, 300);
            },
            { once: true }
          );
        }
        if (!isOn) {
          //fin de la partie
        }
        //mot suivant
      }, index * DANCE_ANIMATION_DURATION);
    });
  }

  function displayMeaning() {
    alertEl.textContent = "Definition: " + game.getTargetWordObj().M;
  }

  function loadNextGuessWord() {
    if (isOn) {
      game.setNextTargetWord();
      grid.createTiles(game.getLettersNumber());
      actualGuess = game.initiActualGuess();
      displayLettresNumber();
      startInteraction();
      grid.highlightNextTiles(
        actualGuess,
        Array.from(guessGrid.querySelectorAll(":not([data-letter])"))
      );
      //make sure timer bg is blue
      timerEl.classList.add("blue");
      timerEl.classList.remove("red");
    } else {
      //fin de la partie
    }
  }

  function endOfgame() {}
}
