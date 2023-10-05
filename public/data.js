const gameField = [
    [0, 0, 96, 95, 94, 93, 92, 91, 90, 89],
    [79, 80, 81, 82, 83, 84, 85, 86, 87, 88],
    [78, 77, 76, 75, 74, 73, 72, 71, 70, 69],
    [59, 60, 61, 62, 63, 64, 65, 66, 67, 68],
    [58, 57, 56, 55, 54, 53, 52, 51, 50, 49],
    [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    [38, 37, 36, 35, 34, 33, 32, 30, 28, 27],
    [17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
    [16, 15, 14, 13, 12, 11, 10, 9, 0, 0],
    [1, 2, 3, 4, 5, 6, 7, 8, 0, 0]
  ]
  
  const cellsDescription = [
    { number: 1, effect: [''], description: 'Старт' },
    { number: 2, effect: ['skip'], description: 'пропуск хода' },
    { number: 3, effect: ['addStep'], description: 'плюс ход' },
    { number: 4, effect: [{ name: 'minusXp', n: 1 }], description: 'минус 1 хп' },
    { number: 5, effect: [{ name: 'minusXp', n: 1 }, 'skip'], description: 'минус 1 хп, минус ход' },
    { number: 6, effect: [{ name: 'plusXp', n: 1 }, 'addStep'], description: 'плюс 1 хп' },
    { number: 7, effect: ['skip'], description: 'пропускхода' },
    { number: 8, effect: [{ name: 'minusXp', n: 1 }], description: 'минус 1 хп' },
    //
    { number: 9, effect: [{ name: 'minusXp', n: 2 }, 'skip'], description: 'минус 2 хп, минус ход' },
    { number: 10, effect: [{ name: 'casino', n: 2 }, 'rotation'], description: 'казино ходов чёт:+1 к кубику на 2 хода, нечет -1' },
    { number: 11, effect: [{ name: 'minusMoral', n: 1 }], description: 'минус 1 мораль' },
    { number: 12, effect: [{ name: 'armor', n: 1 }, 'items'], description: 'защита от следующего негативного эффекта' },
    { number: 13, effect: [{ name: 'vampire', n: 1 }, 'jump'], description: 'вЫбери игрока и забери его хп себе, прыжок вперёд через поле' },
    { number: 14, effect: [{ name: 'emptyHole', n: 1 }], description: 'тут нихрена нет' },
    { number: 15, effect: [{ name: 'empty', n: 1 }], description: 'тут нихрена нет cовсем' },
    { number: 16, effect: [{ name: 'minusXp', n: 1 }, { name: 'minusMoral', n: 1 }], description: 'Лабиринт - миунус 1 хп, минус мораль' },
    //
    { number: 17, effect: [{ name: 'plusXp', n: 1 }], description: 'Портной, +1хп вас зашили, отпустили' },
    { number: 18, effect: [{ name: 'fall', to: 14 }], description: 'падаете вниз' },
    { number: 19, effect: ['addStep'], description: 'плюс ход' },
    { number: 20, effect: [{ name: 'minusXp', n: 2 }], description: 'минус 2 хп' },
    { number: 21, effect: [{ name: 'minusMoral', n: 2 }, 'skip'], description: 'минус 2 морали, вас немного разорвали, теряете ход' },
    { number: 22, effect: [{ name: 'plusMoral1', n: 2 },'addStep'], description: 'У вас встаёт боевой дух, за вами гонится ... + ход' },
  
  ]