// Node.js modules import (CLI Mode)
// /*
import figlet from 'figlet';
import fetch from 'node-fetch';
import promptSync from 'prompt-sync';
const prompt = promptSync();
// */
// end Node.js import (CLI Mode)

// js-beautifier: https://jsonformatter.org/jsbeautifier

(function () {
    "use strict";

    const isBrowser = (typeof window !== "undefined");

    const wordsOffline = ["program", "disaster", "macaque", "beautiful", "dinosaur",
        "computer", "fritters", "index",
        "school", "introvert", "helicopter", "institute", "nature", "alphabet",
        "willow", "hamadryl", "curator", "field",
        "performer", "customer", "alternative", "quotes", "string", "livestock",
        "absolute"
    ];

    let word = wordsOffline[Math.floor(Math.random() * wordsOffline.length)];

    async function fetchWord() {
        // Fetch words from API
        const apiUrl = "https://random-word-api.herokuapp.com/word";
        // Async fetch
        return fetch(apiUrl)
            .then((response) => response.json())
            .then((data) => (typeof data[0] === "string" ? (word = data[0]) : null))
            .catch((error) => console.log("%cFetch Error. Starting an offline game.", "color: #C66"));
        // .finally(() => startGame());
    }


    showWelcomeScreen();
    startGame();


    function showWelcomeScreen() {
        if (isBrowser) {
            if (window.location.protocol === "file:") {
                alert("fetch APi does not support file: protocol.");
            }
            figlet.defaults({
                fontPath: "./node_modules/figlet/fonts"
            });
            figlet.preloadFonts(["Patorjk's Cheese"], function () {
                // console.log("prefetching done (only did it for 2 fonts)!");
            });
        }

        console.clear();
        const msg = "HANG MAN";
        figlet(msg,
            { font: "Patorjk's Cheese" },
            (err, text) => {
                console.log("%c" + text, "color: #CC3333; font-size:10px; text-shadow: 2px 2px #000;");
            });
    }


    async function startGame() {
        await fetchWord();

        let answerArray = new Array(word.length).fill("*");
        let guessHistorySet = new Set();

        let remainingLetters = word.length;
        let attempts = 10;
        let isHit = false; // success status
        let isRepeat = false; // repeat status

        let guess = "";

        console.log(`We've got a word for you. It consists of ${word.length} letters.
Guess the the entire word or try letter by letter.
You have 10 attempts. Good luck!`);
        console.log("Hint: %c" + word, "background: #888; color: #888");

        while ((remainingLetters > 0) && (attempts > 0)) {
            if (isHit && !isRepeat) {
                // A new guess was done before
                console.log("%cThat is correct.", "color: #4B4");
            }

            // Print guessed letters
            console.log(answerArray.join("  "));

            // Ask for a new guess
            if (isBrowser) {
                // Browser only
                console.log("Guess a letter or the entire word: ");
                guess = prompt("Guess a letter or the entire word:\n(Cancel to quit the game)");
                console.log("> " + (guess ? guess : "let me out of here."));
            } else {
                // CLI (node.js)
                guess = prompt("Guess a letter or the entire word: ");
            }

            if (guess === null) {
                // Cancel button returns null
                // Exit the game
                endGame(0);
                return;
            } else if (guess === "") {
                // Fix an empty input
                guess = " ";
            }

            guess = guess.toLowerCase();

            // Reset success status
            isHit = false;
            isRepeat = guessHistorySet.has(guess);

            if (!(/^[a-zA-Z]+$/).test(guess)) {
                // Invalid or empty input
                console.log("%cWrong input. Try again...", "color: #e89417");
            } else if (guess === word) {
                // Full word correct guess
                answerArray = guess.split("");
                break;
            } else if (isRepeat) {
                // Repeating a previous guess
                if (word.indexOf(guess) === -1) {
                    // Not in the word
                    console.log("%cRemember the past. There's no \"" + guess + "\".", "color: #e89417");
                } else {
                    // Inside the word
                    console.log("%cYou've found all \"" + guess + "\".", "color: #e89417");
                }
            } else {
                // Check a Valid New guess in the word
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
                        console.log("%c0 attempts left.", "color: #C66");
                        break;
                    }
                    if (guess.length > 1) {
                        // A word guess (probably)
                        console.log("%cHaste makes waste.", "color: #C66");
                    }
                    // Show attempts count
                    console.log("%cYou have " + attempts + ((attempts > 1) ?
                        " attempts" : " attempt") + " left.", "color: #C66");
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
            console.log(`
			Game over!
	  The word was "${word}".
	  `);
        } else {
            // Show win message
            console.log("%c" + word.split("").join("  "), "color: #4B4");
            console.log(`
			  Victory!
	You guessed the word "${word}".
	`);
        }
    }

})();
