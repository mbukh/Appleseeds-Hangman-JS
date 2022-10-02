#!/usr/bin/env node

"use strict";

const figlet = require("figlet");
const https = require('node:https');
const readline = require('node:readline');

const wordsOffline = ["Shenanigans", "Bamboozle", "Bodacious", "Brouhaha",
  "Canoodle", "Canoodle", "Goggle", "Gubbins", "Malarkey", "Nincompoop",
  "Phalanges", "Badger",
];

let word = wordsOffline[Math.floor(Math.random() * wordsOffline.length)];


async function fetchWord() {
  // Fetch words from API
  const apiUrl = "https://random-word-api.herokuapp.com/word";
  // Async fetch
  return await fetch(apiUrl)
    .then((response) => response.json())
    .then((data) => (typeof data[0] === "string" ? (word = data[0]) :
      null))
    .catch((error) => msgError(
      "Fetch Error. Starting an offline game."));
  // .finally(() => startGame());
}


async function showWelcomeScreen() {
  console.clear();
  const msg = "HANG MAN";

  if (typeof figlet === "undefined") {
    msgError("Figlet module not found.");
    msgLog(msg,
      "color: #E44; font-size: 2em; text-shadow: 1px 1px #000;");
    return;
  }

  // Use figlet module
  figlet(msg, {
      font: "Patorjk's Cheese"
    },
    (err, text) => {
      msgLog(text,
        "color: #CC3333; font-size:10px; text-shadow: 2px 2px #000;"
      );
    });
  // Help on slow connections
  await sleep(500);
}



async function startGame() {
  showWelcomeScreen();
  await fetchWord();

  word = word.toLowerCase();

  let answerArray = new Array(word.length).fill("*");
  let guessHistorySet = new Set();
  let remainingLetters = word.length;
  let attempts = 10;
  let isHit = false; // success status
  let isRepeat = false; // repeat status
  let guess = "";

  msgLog(`We've got a word for you. It consists of ${word.length} letters.
Guess the the entire word or try letter by letter.
You have 10 attempts. Good luck!`);
  msgLog("Hint: " + word, "background: #888; color: #888");

  while ((remainingLetters > 0) && (attempts > 0)) {
    if (isHit && !isRepeat) {
      // A new guess was done before
      msgSuccess("That is correct.");
    }

    // Print guessed letters
    msgLog(answerArray.join("  "));

    // Ask for a new guess
    guess = await prompt("Guess a letter or the entire word: ");
    msgLog(">" + guess);

    // Fix an empty input
    if (guess === "") {
      guess = " ";
    }

    guess = guess.toLowerCase();

    // Reset success status
    isHit = false;
    // Check the guess history
    isRepeat = guessHistorySet.has(guess);

    // Invalid or empty input
    if (!(/^[a-zA-Z]+$/).test(guess)) {
      msgWarning("Wrong input. Try again...");
    }
    // Full word correct guess
    else if (guess === word) {
      answerArray = guess.split("");
      break;
    }
    // Repeating a previous guess
    else if (isRepeat) {
      if (word.indexOf(guess) === -1) {
        // Not in the word
        msgWarning("Remember the past. There's no \"" + guess +
          "\".");
      } else {
        // Inside the word
        msgWarning("You've found all \"" + guess + "\".");
      }
    }
    // Check a Valid New guess in the word
    else {
      for (let j = 0; j < word.length; j++) {
        if (word[j] === guess) {
          answerArray[j] = guess;
          remainingLetters--;
          isHit = true;
        }
      }
      if (!isHit && !isRepeat) {
        // Lose a life
        attempts--;
        if (attempts === 0) {
          // Game over break the game
          msgError("0 attempts left.");
          break;
        }
        if (guess.length > 1) {
          // A word guess (probably)
          msgError("Haste makes waste.");
        }
        // Show attempts count
        msgError("You have " + attempts +
          ((attempts > 1) ? " attempts" : " attempt") +
          " left.");
      }
    }
    // Log a new guess (one letter guesses are logged)
    if (/^[a-zA-Z]$/.test(guess)) {
      guessHistorySet.add(guess);
    }
  }
  endGame(attempts);
}


function endGame(attempts) {
  if (attempts === 0) {
    // Show lose message
    msgError(`
          Game over!
    The word was "${word}".
  `);
  } else {
    msgSuccess(word.split("").join("  "));
    // Show win message
    msgSuccess(`
              Victory!
    You guessed the word "${word}".
`);
  }
}


const msgLog = (text, style) => {
  console.log("%c" + text, (style ? style : "font-size: 1.3em;"));
};
const msgError = (text) => console.log("%c" + text,
  "font-size: 1.3em; color: #C66");
const msgSuccess = (text) => console.log("%c" + text,
  "font-size: 1.3em; color: #4B4");
const msgWarning = (text) => console.log("%c" + text,
  "font-size: 1.3em; color: #e89417");
const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));



function prompt(q) {
  return new Promise(resolve => {
    let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(q, a => {
      resolve(a);
      rl.close();
    });
  });
}



function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      var {
        statusCode
      } = res;
      var contentType = res.headers['content-type'];
      let error;
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(
          contentType)) {
        error = new Error('Invalid content-type.\n' +
          `Expected application/json but received ${contentType}`
        );
      }
      if (error) {
        console.error(error.message);
        // consume response data to free up memory
        res.resume();
      }
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        try {
          let obj = {
            data: '',
            json() {
              return JSON.parse(this
                .data);
            }
          };
          // const parsedData = JSON.parse(rawData);
          obj.data = rawData;
          resolve(obj);
        } catch (e) {
          reject(e.message);
        }
      });
    }).on('error', (e) => {
      reject(`Got error: ${e.message}`);
    });

  });
}




startGame();