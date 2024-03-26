const gameField = [
  [0, 0, 94, 93, 92, 91, 90, 89, 88, 87],
  [77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
  [76, 75, 74, 73, 72, 71, 70, 69, 68, 67],
  [57, 58, 59, 60, 61, 62, 63, 64, 65, 66],
  [56, 55, 54, 53, 52, 51, 50, 49, 48, 47],
  [37, 38, 39, 40, 41, 42, 43, 44, 45, 46],
  [36, 35, 34, 33, 32, 31, 30, 29, 28, 27],
  [17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  [16, 15, 14, 13, 12, 11, 10, 9, 0, 0],
  [1, 2, 3, 4, 5, 6, 7, 8, 0, 0]
]
// не забыть доабвить еще чипсов чтобы не было ошибки больше 4 игроков!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const chips = [
  `<span class="material-symbols-outlined fishka"> 
              elderly
  </span>`,
  `<span class="material-symbols-outlined fishka">
             elderly_woman
  </span>`,
  `<span class="material-symbols-outlined fishka">
             accessible
  </span>`,
  `<span class="material-symbols-outlined fishka">
             accessible_forward
  </span>`
]



const cellsDescription = [
  { number: 1, effect: [''], description: 'Старт' },
  { number: 2, effect: [{name: 'skip', n: 1, ill: 'skip-1', sound:'skip-1'}], description: 'пропуск хода' },
  { number: 3, effect: [{name: 'addStep', n: 1, ill: 'add-step-1',sound:'add-step-1'}], description: 'плюс ход' },
  { number: 4, effect: [{ name: 'minusXp', n: 31 }], description: 'минус 31 хп' },
  { number: 5, effect: [{ name: 'minusXp', n: 1 }, {name:'skip', n:1}], description: 'минус 1 хп, минус ход' },
  { number: 6, effect: [{ name: 'plusXp', n: 1 }, 'addStep'], description: 'плюс хp' },
  { number: 7, effect: [{name: 'skip', n: 1}], description: 'пропускхода' },
  { number: 8, effect: [{ name: 'minusXp', n: 30 }], description: 'минус 30 хп' },
  //
  { number: 9, effect: [{ name: 'minusXp', n: 2 }, 'skip'], description: 'минус 2 хп, минус ход' },
  { number: 10, effect: [{ name: 'casino', n: 2 }, 'rotation'], description: 'казино ходов чёт:+1 к кубику на 2 хода, нечет -1' },
  { number: 11, effect: [{ name: 'minusMoral', n: 1 }], description: 'минус 1 мораль' },
  { number: 12, effect: [{ name: 'armor', n: 1 }, 'items'], description: 'защита от следующего негативного эффекта' },
  // { number: 13, effect: [{ name: 'vampire', n: 1 }, 'jump'], description: 'выбери игрока и забери его хп себе, прыжок вперёд через поле' },
  { number: 13, effect: [{ name: 'vampire' }, 'jump'], description: 'выбери игрока и забери его хп себе, прыжок вперёд через поле' },

  { number: 14, effect: [{ name: 'emptyHole',  to: 15 }], description: 'тут нихрена нет' },
  { number: 15, effect: [{ name: 'empty', n: 1 }], description: 'тут нихрена нет cовсем' },
  { number: 16, effect: [{ name: 'minusXp', n: 1 }, { name: 'minusMoral', n: 1 }, 'jump'], description: 'Лабиринт - миунус 1 хп, минус мораль,' },
  //
  { number: 17, effect: [{ name: 'emptyHole',  to: 18 }], description: 'тут шаром покати' },
  { number: 18, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
  { number: 19, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
  { number: 20, effect: [{name: 'addStep', n: 1}], description: 'плюс ход' },
  { number: 21, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
  { number: 22, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
  { number: 23, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
  { number: 24, effect: ['reverse'], description: 'кинь кубик и иди назад' },
  { number: 25, effect: [{ name: 'armor', n: 1 }, 'items'], description: 'защита от следующего негативного эффекта' },
  { number: 26, effect: [{ name: 'plusXp', n: 2 }, 'addStep'], description: 'плюс 2 хп' },
//














{ number: 27, effect: [{ name: 'weapon', n: 1 }], description: 'вооружитесь одной ловушкой' },
{ number: 28, effect: [{ name: 'duel'}], description: 'Выберите игрока, если ваша мораль больше, заберите 1 хп себе' },
{ number: 29, effect: ['addStep'], description: 'плюс ход' },
{ number: 30, effect: [{ name: 'minusXp', n: 3 }], description: 'минус 3 хп' },
{ number: 31, effect: ['skip'], description: 'пропуск хода' },
{ number: 32, effect: [{ name: 'plusXp', n: 2 }], description: 'плюс 1 хп' },
{ number: 33, effect:  [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: '+2 морали' },
{ number: 34, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 35, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 36, effect: [{ name: 'fall', to: 17 }], description: 'падаете вниз' },
//
{ number: 37, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
{ number: 38, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 39, effect: ['addStep'], description: 'плюс ход' },
{ number: 40, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 41, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 42, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 43, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 44, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 45, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 46, effect: ['reverse'], description: 'кинь кубик и иди назад' },
//
{ number: 47, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
{ number: 48, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 49, effect: ['addStep'], description: 'плюс ход' },
{ number: 50, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 51, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 52, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 53, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 54, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 55, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 56, effect: ['reverse'], description: 'кинь кубик и иди назад' },
//
{ number: 57, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
{ number: 58, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 59, effect: ['addStep'], description: 'плюс ход' },
{ number: 60, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 61, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 62, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 63, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 64, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 65, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 66, effect: ['reverse'], description: 'кинь кубик и иди назад' },
//
{ number: 67, effect: ['addStep'], description: 'плюс ход' },
{ number: 68, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 69, effect: [{ name: 'AIDS', n: 1 }], description: 'Вас заразили СПИДОМ' },
{ number: 70, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 71, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 72, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 73, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 74, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 75, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 76, effect: ['reverse'], description: 'кинь кубик и иди назад' },
//
{ number: 77, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
{ number: 78, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 79, effect: ['addStep'], description: 'плюс ход' },
{ number: 80, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 81, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 82, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 83, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 84, effect: ['reverse'], description: 'кинь кубик и иди назад' },
{ number: 85, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 86, effect: ['reverse'], description: 'кинь кубик и иди назад' },
//
{ number: 87, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
{ number: 88, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
{ number: 89, effect: ['addStep'], description: 'плюс ход' },
{ number: 90, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
{ number: 91, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
{ number: 92, effect: [{ name: 'plusMoral1', n: 2 }, 'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
{ number: 93, effect: [{ name: 'minusXp', n: 1 }], description: '- 1 хп' },
{ number: 94, effect: [{name: 'final'}], description: 'Вы победили!' },
];

const bombs = [
  {name: 'damage', n:1, title: '- 1 HP'},
  {name: 'mega-damage', n:3, title: '- 3 HP'},
  {name: 'skip', n:1, title: 'пропуск хода'},
  {name: 'reverse',n:3, title: 'Вернитесь назад на 3 клетки'},
  {name: 'slow', n:1, title: '5'},
  {name: 'mega-skip', n:2, title: 'пропусти 2 хода'},
  {name: 'amoral', n:3, title: 'падает мораль на 3'},
  {name: 'micro-amoral',n:1, title: 'падает мораль на 1'},
];

const userBombs = [];