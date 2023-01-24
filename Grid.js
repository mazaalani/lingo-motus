export default class Grid {
  constructor(tiles) {
    this.tiles = tiles;
    this._el = document.querySelector("[data-guess-grid]");

    this.init();
  }

  init = () => {
    this.createTiles();
  };

  createTiles = (tiles = this.tiles) => {
    this._el.innerHTML = "";
    let element = ``;
    //6 essais
    let tries = 6;
    for (let k = 0; k < tries; k++) {
      for (let i = 0; i < tiles; i++) {
        element += `<div class="tile"></div>`;
      }
    }

    this._el.insertAdjacentHTML("beforeend", element);
    this._el.classList.add(`t${this.tiles}`);
  };

  getActiveTiles = () => {
    return this._el.querySelectorAll('[data-state="active"]');
  };

  setNextTile = (key) => {
    this.nextTile = this._el.querySelector(":not([data-letter])");
    this.nextTile.dataset.letter = key.toLowerCase();
    this.nextTile.textContent = key;
    this.nextTile.dataset.state = "active";
  };
  //affiche points ligne suivante
  highlightNextTiles = (actualGuess, tiles) => {
    for (let i = 0; i < actualGuess.length; i++) {
      tiles[i].textContent = actualGuess[i];
    }
  };
}
