function random(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const log = console.log;

const pause = (time) => new Promise((resolve) => {
  setTimeout(() => { resolve() }, time)
});

function getSelectedRadioValue(radios) {
  for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
          return radios[i].value;
      }
  }
};

function $(selector){
  return document.querySelector(selector);
};

function getUserName() {
  const username = localStorage.getItem("username");
  return username;
}