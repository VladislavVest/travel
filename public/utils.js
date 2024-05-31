/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param {number} min - The minimum integer.
 * @param {number} max - The maximum integer.
 * @returns {number} A random integer between min and max.
 */
function random(min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) + Math.ceil(min);
}

/**
* Logs an empty message (no-op).
*/
const log = () => {};

/**
* Logs a message to the console.
* @param {...*} args - The message or variables to log.
*/
const log2 = console.log;

/**
* Pauses execution for a given amount of time.
* @param {number} time - The amount of time to pause in milliseconds.
* @returns {Promise<void>} A promise that resolves after the given time.
*/
const pause = (time) => new Promise((resolve) => setTimeout(resolve, time));

/**
* Gets the value of the selected radio button in a group.
* @param {NodeListOf<HTMLInputElement>} radios - The group of radio buttons.
* @returns {string|null} The value of the selected radio button, or null if none are selected.
*/
function getSelectedRadioValue(radios) {
  for (let i = 0; i < radios.length; i++) {
      if (radios[i].checked) {
          return radios[i].value;
      }
  }
  return null;
}

/**
* Selects the first element that matches the given CSS selector.
* @param {string} selector - The CSS selector to match.
* @returns {Element|null} The matched element, or null if no elements match.
*/
function $(selector) {
  return document.querySelector(selector);
}

/**
* Gets the username from local storage.
* @returns {string|null} The username, or null if not found.
*/
function getUserName() {
  return localStorage.getItem("username");
}
