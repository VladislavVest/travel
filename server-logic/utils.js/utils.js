function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const log = console.log;

const pause = (time) => new Promise((resolve) => {
  setTimeout(() => { resolve() }, time)
});


module.exports={random,log,pause}
