import { language } from "./language.js";

export default class Ui {
  constructor(playerParans) {
    this.playerChoice = playerParans;
    this.optionsEl = document.querySelector("[data-optionsview]");
    this.welcomeEl = document.querySelector("[data-welcome]");
    this.keyboard = document.querySelector("[data-keyboard]");
    this.optionsBtn = document.querySelector("[data-options]");
    this.lang = document
      .querySelector(".language-box")
      .getElementsByTagName("input");
    this.playerName = this.optionsEl.querySelector("#player");
    this.saveBtn = document.querySelector("[data-optionsave]");
    this.optionsBtn = document.querySelector("[data-options]");

    this.init();
  }

  init = () => {
    if (this.playerChoice.playerName) {
      this.playerName.value = this.playerChoice.playerName;
    }

    if (this.playerChoice.lang) {
      Array.from(this.lang).find(
        (input) => input.value === this.playerChoice.lang
      ).checked = true;
    }

    this.saveBtn.addEventListener("click", () => {
      this.saveSettings();
    });

    this.optionsBtn.addEventListener("click", () => {
      if (this.optionsEl.classList.contains("zoomout"))
        Ui.zoomView(this.optionsEl, "in");
      else Ui.zoomView(this.optionsEl, "out");
    });

    this.setLvlsMap();
  };

  setLvlsMap = () => {
    let lvls = document.querySelectorAll("[data-lvl]");
    let lettersNb = this.playerChoice.lang === "fr" ? 5 : 4;
    lvls.forEach((lvl) => {
      lvl.querySelector(".playBtn").querySelector("span").textContent =
        lettersNb + " " + language.letters[this.playerChoice.lang];
      lettersNb++;
    });
  };

  saveSettings = () => {
    //choix langue
    Array.from(this.lang).forEach((opt) => {
      if (opt.checked) {
        this.playerChoice.lang = opt.value;
      }
    });
    if (!this.playerChoice.lang) {
      Array.from(this.lang).forEach((opt) => {
        opt.parentElement.classList.add("red-border");
      });
    }
    //nom player
    if (this.playerName.value) {
      this.playerChoice.playerName = this.playerName.value;
      this.playerName.classList.remove("red-input");
    } else {
      this.playerName.classList.add("red-input");
    }

    if (this.playerName.value && this.playerChoice.lang) {
      this.displayGameStart();
    }
  };

  getPlayerChoise = () => {
    return this.playerChoice;
  };

  displayGameStart = () => {
    Ui.zoomView(this.optionsEl, "out");
    Ui.zoomView(this.welcomeEl, "in");
    Ui.zoomView(this.optionsBtn, "in");
  };

  static zoomView(element, orientation) {
    if (orientation === "in") {
      element.classList.remove("zoomout");
      element.classList.add("zoomin");
    }
    if (orientation === "out") {
      element.classList.remove("zoomin");
      element.classList.add("zoomout");
    }
  }

  static changeView(from, to) {
    from.classList.add("hidden-bottom");
    to.classList.remove("hidden-top");
  }
}
