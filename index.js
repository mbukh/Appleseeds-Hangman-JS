(function () {
	"use strict";

	const wordsOffline = ["absolute", "accomplishment", "affection", "artistry", 
			"beautiful", "bonus", "calm", "character", "cheerful", "comedy",
			"companionship", "compassion", "compassionate", "completion",
			"consciousness", "courageous", "delight", "dressy", "Durpose",
			"enjoyment", "entertaining", "entrepreneur", "excellence", "excited",
			"exciting", "expressive", "faithful", "fantastic", "free", "freedom",
			"friendly", "fun", "genius", "genuine", "giggle", "good", "goodness",
			"happiness", "happy", "heavenly", "honest", "hug", "immaculate",
			"incredible", "independent", "jolly", "joy", "joyful", "kind",
			"knowledgeable", "language", "laugh", "laughter", "likable", "live",
			"lovable", "love", "lovemaking", "lover", "magical", "meditation",
			"oasis", "orgasm", "outsmart", "ownership", "paradise", "particular",
			"payday", "peaceful", "pizza", "polite", "prize", "project",
			"quardianship", "rejoice", "relaxation", "relaxing", "responsible",
			"sanitary", "self", "shower", "sincerity", "skill", "skilled", "smile",
			"strength", "stvle", "successful", "sunny", "sunshine", "talented",
			"thinker", "thriving", "tranquility", "triumph", "upbeat", "vacation",
			"win", "winner", "wisdom"
		];

	let word = wordsOffline[Math.floor(Math.random() * wordsOffline.length)];

	async function fetchWord() {
		if (typeof figlet === "undefined") {
			msgError("Fetch module not found.");
			return;
		}
		// Fetch words from API
		const apiUrl = "https://random-word-api.herokuapp.com/word";
		// Async fetch
		return fetch(apiUrl)
			.then((response) => response.json())
			.then((data) => (typeof data[0] === "string" ? (word = data[0]) : null))
			.catch((error) => msgError("Fetch Error. Starting an offline game."));
		// .finally(() => startGame());
	}


	async function showWelcomeScreen() {
		console.clear();
		const msg = "HANGMAN";

		if (typeof figlet === "undefined") {
			msgError("Figlet module not found.");
			msgLog(msg, "color: #E44; font-size: 2em; text-shadow: 1px 1px #000;");
			return;
		}

		if (window.location.protocol === "file:") {
			alert("fetch APi does not support file: protocol.");
			return;
		}
		// figlet.defaults({fontPath: "./node_modules/figlet/fonts"});
		figlet.defaults({ fontPath: "./figlet-fonts" });
		figlet.preloadFonts(["Patorjk's Cheese"], () => {
			// msgError("prefetching done!");
		});

		figlet(msg,
			{ font: "Patorjk's Cheese" },
			(err, text) => {
				msgLog(text,
					"color: #E44; font-size:8px; text-shadow: 1px 1px #000;");
			});
		// Help on slow connections
		await sleep(500);
	}


	async function startGame() {
		await showWelcomeScreen();
		await fetchWord();

		let answerArray = new Array(word.length).fill("*");
		let guessHistorySet = new Set();
		let remainingLetters = word.length;
		let isHit = false; // success status
		let isRepeat = false; // repeat status
		let attempts = 10;
		let guess = "";

		msgLog(`
	We've got a word for you. It consists of ${word.length} letters.
	Guess the the entire word or try letter by letter.
	You have 10 attempts. Good luck!`);
		console.log("Hint: %c" + word, "background: #888; color: #888");

		while ((remainingLetters > 0) && (attempts > 0)) {
			if (isHit && !isRepeat) {
				// A new guess was done before
				msgSuccess("That is correct.");
			}

			// Print guessed letters
			msgLog(answerArray.join("  "));

			// Ask for a new guess
			msgLog("Guess a letter or the entire word: ");
			guess = prompt("Guess a letter or the entire word:\n" +
				"(Cancel to quit the game)");
			msgLog("> " + (guess ? guess : "let me out of here."));

			// Exit the game
			if (guess === null) {
				// Cancel button returns null
				endGame(0);
				return;
			}

			// Fix an empty input
			if (guess === "") { guess = " "; }

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
					msgWarning("Remember the past. There's no \"" + guess + "\".");
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
						// Game over breaks the game
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

			// Log to the guess history (one letter guesses are logged)
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
	const msgError = (text) => console.log("%c" + text, "font-size: 1.3em; color: #C66");
	const msgSuccess = (text) => console.log("%c" + text, "font-size: 1.3em; color: #4B4");
	const msgWarning = (text) => console.log("%c" + text, "font-size: 1.3em; color: #e89417");
	const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

	startGame();

})();