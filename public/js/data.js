window.STATUSES = [
	{name: "Online"},
	{name: "Playing", games: ['Dota 2', 'The Witcher 3', 'HotS', 'Battlefield', 'Towerfall', 'QuakeLive', 'CS:GO']},
	{name: "Away"},
];

window.PLAYERS = [
	{status: 2, name: "Captain Reynolds", avatar: "captain.jpg", game: null},
	{status: 2, name: "Don Pablo", avatar: "pablo.jpg", game: null},
	{status: 1, name: "Sherlock", avatar: "sherlock.jpg", game: 'Dota 2'},
	{status: 0, name: "Hodor", avatar: "hodor.jpg", game: null},
];

window.USER = {status: 0, name: "Heisenberg", avatar: "heisenberg.jpg", game: null}

window.MESSAGES = [];

window.KNOWLEDGEBASE = {
	heisenberg: {
		catchWords: ["say my name"],
		answers: ["Heisenberg"]
	},
	play: {
		catchWords: ["play", "together", "let's play"],
		answers: ["Ok, let's play!", "No sorry I can't play right now.", "Yeah why not!"]
	},
	howareyou: {
		catchWords: ["how are you", "how do you feel"],
		answers: ["I feel so great!", "I am fine, thank you!", "Why do you even ask?"]
	},
	greeting: {
		catchWords: ["hello", "hi", "hey"],
		answers: ["Hello!", "Hi, How are you?", "Hola!"]
	},
	bye: {
		catchWords: ["bye", "see you", "cya"],
		answers: ["Good bye!", "Already leaving?", "See you soon!"]
	},
	discussions: [
		"I am watching some funny cats video.",
		"Losing every matches I played today...",
		"I used to be an adventurer like you, but then I took an arrow to the knee",
		"Me too!",
		"Hahaha, nice one!",
		"I am not in danger... I am the danger!",
		"Winter is coming",
		"Let's try to have some normal human behaviors... What would humans do?",
		"Okay, acting normal!"
	],
	answers: [
		"I do not understand.",
		"Yes?",
		"Sorry I have to go!",
		"Hmmm?",
		"Okay!",
		"I don't care!"
	],
	leaving: [
		"Away for a bit. Cya!",
		"I have to go, but coming back later!",
		"Be right back.",
		"Work, work..."
	],
	comingBack: [
		"I am back!",
		"Okay, that was faster than I though.",
		"Hello again!",
		"Job's done!"
	]
};