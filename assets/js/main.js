const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);
const on = (el, ev, func) => el.addEventListener(ev, func);

const FIELD = $('#field');

class RequestFrame {
  constructor(game) {
    this.game = game;
  }

  loop() {

    this.objects.forEach(el => {
      el.eachFrame();
    });

    requestAnimationFrame(_ => this.loop());
  }
}

class Partition extends RequestFrame {
  constructor(game, position) {
    super(game);

    this.data = {
      objects: [],
      cell: false,
      position: {
        x: position.x,
        y: position.y
      }
    };

    this.createPartition();
  }

  createPartition() {
    this.el = document.createElement('div');
    FIELD.appendChild(this.el);

    on(this.el, 'click', _ => this.game.checkClickPartition(this));
  }

  changeTypePartition() {
    if (this.data.objects.length !== 0) return;

    if (!this.data.cell)
      this.el.classList.add('cell');
    else
      this.el.classList.remove('cell');

    this.data.cell = !this.data.cell;
  }

  fillSubstance() {
    if (this.data.objects.length !== 0 || !this.data.cell) return;

    this.data.objects.push(new Substance(this.game, this));
  }
}

class Substance extends RequestFrame {
  constructor(game, partition) {
    super(game);
    this.partition = partition;

    this.createSubstance();

    this.game.data.substances.push(this);
  }

  createSubstance() {
    this.partition.el.classList.add('substance');
  }

  checkMoveDirection() {
    let availableCells = [];

    if (this.partition.data.position.x !== 0)
      availableCells.push(this.game.objects[this.partition.data.position.x][this.partition.data.position.y - 1]);

    if (this.partition.data.position.x !== this.game.objects.length - 1)
      availableCells.push(this.game.objects[this.partition.data.position.x][this.partition.data.position.y + 1]);

    if (this.partition.data.position.y !== 0)
      availableCells.push(this.game.objects[this.partition.data.position.x - 1][this.partition.data.position.y]);

    if (this.partition.data.position.y !== this.game.objects.length - 1)
      availableCells.push(this.game.objects[this.partition.data.position.x + 1][this.partition.data.position.y]);

    availableCells = availableCells.filter((el) => {
      if (el !== undefined && el.data.cell && el.data.objects.length === 0) return true;
    });

    this.randomDirection(availableCells);
  }

  randomDirection(availableCells) {
    let nextCell = Game.random(0, availableCells.length - 1);

    this.move(availableCells[nextCell]);
  }

  move(nextCell) {
    if (nextCell === undefined) return;

    this.partition.el.classList.remove('substance');
    this.partition.data.objects = [];

    this.partition = nextCell;

    this.partition.data.objects.push(this);
    this.createSubstance();
  }
}

class Game {
  constructor() {
    this.objects = [];
    this.data = {
      curAction: 'cell',
      substances: [],
      curIndexSubstance: 0,
    };
    this.frame = 1;

    this.generateMap();

    this.loop();
  }

  generateMap() {
    for (let i = 0; i < 10; i++) {
      let array_x = [];

      this.objects.push(array_x);

      for (let j = 0; j < 10; j++) {
        array_x.push(new Partition(this, {x: i, y: j}));
      }
    }

    this.bindEvents();
  }

  bindEvents() {
    on(document, 'keydown', ev => {
      if (ev.which === 49) this.data.curAction = 'cell';
      if (ev.which === 50) this.data.curAction = 'substance';
    });
  }

  checkClickPartition(partition) {
    if (this.data.curAction === 'cell') {
      partition.changeTypePartition();
    } else if (this.data.curAction === 'substance') {
      partition.fillSubstance();
    }
  }

  static random(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  iterate() {
    if (this.data.curIndexSubstance === this.data.substances.length || this.data.substances.length === 0) this.data.curIndexSubstance = 0;

    if (this.data.substances[this.data.curIndexSubstance] !== undefined)
      this.data.substances[this.data.curIndexSubstance].checkMoveDirection();

    this.data.curIndexSubstance += 1;
  }

  loop() {

    if (this.frame % 60 === 0) {
      this.iterate();
    }

    this.frame += 1;
    requestAnimationFrame(_ => this.loop())
  }

}

let game = new Game();