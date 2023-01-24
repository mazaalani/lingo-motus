import { fr } from "../dictionnaires/dictionnaireFr.js";
import { en } from "../dictionnaires/dictionnaireEn.js";
//en fr de 5 a 20 lettres et en eng de 4 a 15 mais pour ce jeu max 10

export default class Game {
  constructor({ lang, playerName }) {
    this.lang = lang;
    this.playerName = playerName;
    this.guessList = lang === "fr" ? fr : en;
    this.lettersFrom = lang === "fr" ? 5 : 4;
    this.lettersMax = lang === "fr" ? 11 : 10;
    this.lettersNumber = this.lettersFrom;
    this.guessedList = [];
    this.targetWord = {};
    this.score = 0;
    this._score = document.querySelector("[data-score-container]");

    this.init();
  }

  init = () => {
    this.setNextTargetWord();
  };

  getScore = () => {
    return this.score;
  };
  getPlayerName = () => {
    return this.playerName;
  };
  setPlayerName = (name) => {
    this.playerName = name;
  };
  getLettersNumber = () => {
    return this.lettersNumber;
  };
  incrementLettersNumber = () => {
    this.lettersNumber++;
  };
  getTargetWordNoAccents = () => {
    return this.targetWord.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };
  getTargetWordObj = () => {
    return this.targetWord;
  };
  checkGuessMatch = (guess) => {
    return (
      guess.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
      this.targetWord.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    );
  };

  setNextTargetWord = () => {
    do {
      let random = Math.floor(Math.random() * this.guessList.length);
      this.targetWord = this.guessList[random];
    } while (
      this.targetWord.L != this.lettersNumber &&
      !this.guessedList.find((w) => {
        this.targetWord.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
          w.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      })
    );

    //rajoute mot a la liste des devinés
    this.guessedList.push(this.targetWord);

    //enleve mot de la liste a deviner
    this.guessList.forEach((g, index) => {
      if (
        g.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ===
        this.targetWord.W.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      ) {
        this.guessList.splice(1, this.guessList.indexOf(g));
      }
    });
  };

  updateScore = () => {
    this.score += this.lettersNumber * 10;
    this._score.textContent = this.score;
  };

  initiActualGuess = () => {
    let actualGuess = [];
    for (let i = 0; i < this.getLettersNumber(); i++) {
      actualGuess[i] = ".";
      if (i == 0) actualGuess[i] = this.getTargetWordNoAccents()[0];
    }
    return actualGuess;
  };
}
