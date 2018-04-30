const uuid = require('uuid/v1');
const net = require('net');


// GAME VARIABLES DECLARATION

const MSG_WAIT = "Joining queue, waiting for another player ...",
	MSG_GAME_START = "Player 2 found, game can start !";

let playersWaitingForGame = [];

let playersInGame = [];

let gameMatches = {};

// VARIABLES END



let notify = function (player, msg) {
	player.write(JSON.stringify({
		"message": msg
	}));
}


let addPlayerToQueue = function (player) {
	if(playersWaitingForGame.length > 0){
		const otherPlayer = playersWaitingForGame[0];
		
		notify(player, MSG_GAME_START);
		notify(otherPlayer, MSG_GAME_START);
		setTimeout(() => { arrangeGame(player, otherPlayer) }, 1000);
	} else {
		notify(player, MSG_WAIT);
		playersWaitingForGame.push(player);
	}
}

let arrangeGame = function (playerA, playerB) {
	
	let board = {
		"A": [-1, -1, -1],
		"B": [-1, -1, -1],
		"C": [-1, -1, -1]
	};
	
	playerA.mark = 0;
	playerB.mark = 1;
	
	let game = {
		"id": uuid(),
		"board":  board,
		"playerA": playerA,
		"playerB": playerB,
		"finished": false,
		"winner": null,
		"moves": [],
		"waitingFor": playerA
	};
	
	console.log('new game launched between ' + playerA.uuid + ' and ' + playerB.uuid);
	
	gameMatches[game.id] = game;
	dispatchGameInfos(game);
}

let play = function (gameId, player, choice){
	
	let game = gameMatches[gameId];
	
	// if it is a legit play
	if(game != undefined && !game.finished && game.waitingFor.uuid === player && choice.length === 2) {
		
		const row = choice.charAt(0);
		const col = choice.charAt(1);
		
		// if cell is empty
		if(game.board[row] != undefined && game.board[row][col] === -1){
			// applying mark
			game.board[row][col] = game.waitingFor.mark;
			
			// alternating player
			if(game.waitingFor.uuid === game.playerA.uuid){
				game.waitingFor = game.playerB;
			} else {
				game.waitingFor = game.playerA;
			}
			dispatchGameInfos(game);
			
		}
		
		
	} else {
		console.log('ERR: playing on an inexistant game');
	}
	
}

let dispatchGameInfos = function(game) {
	if(game.waitingFor.uuid === game.playerA.uuid){
		game.playerA.write(JSON.stringify({
			"game": gameObjectForClient(game),
			"message": "Your turn to play..",
			"myid": game.playerA.uuid
		}));
		
		game.playerB.write(JSON.stringify({
			"game": gameObjectForClient(game),
			"message": "Waiting for other player.",
			"myid": game.playerB.uuid
		}));
	
	} else {
		game.playerB.write(JSON.stringify({
			"game": gameObjectForClient(game),
			"message": "Your turn to play..",
			"myid": game.playerB.uuid
		}));
		
		game.playerA.write(JSON.stringify({
			"game": gameObjectForClient(game),
			"message": "Waiting for other player.",
			"myid": game.playerA.uuid
		}));
	}
	
}

let playAuto = function (board, mark) {
	let choices = [];
	for(let row of ["A","B","C"]){
		for(let col = 0; col < 3; col++){
			// if empty cell
			if(board[row][col] === -1){
				choices.push(row + col);
			}
		}
	}
	
	const random = Math.floor(Math.random()*choices.length);
	const randomChoice = choices[random];
	
	const row = randomChoice.charAt(0);
	const col = randomChoice.charAt(1);
	
	board[row][col] = mark;
	
	return board;
}

//////////////
// client-side
//////////////



let gameObjectForClient = function(game) {
	return {
		"id": game.id,
		"board": game.board,
		"playerA": game.playerA.uuid,
		"playerB": game.playerB.uuid,
		"finished": game.finished,
		"winner": game.winner,
		"moves": game.moves,
		"waitingFor": game.waitingFor.uuid
	};
}




module.exports = {
	addPlayerToQueue: addPlayerToQueue,
	arrangeGame: arrangeGame,
	dispatchGameInfos: dispatchGameInfos,
	play: play,
	playRandomly: playAuto
}