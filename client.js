const net = require('net');
const readline = require('readline-sync');
const tools = require('./clientHelperFunctions');


let myPlayerId;

const client = net.createConnection({port: 1234}, () => {
});

client.on('connect', () => {
	console.log('connected to game server');
});

client.on('data', (data) => {
	
	let response = JSON.parse(data.toString('utf8'));
	
	// storing given id
	if(response['myid'] != undefined) myPlayerId = response['myid'];
	
	// display board
	if(response['game'] != undefined) tools.print(response['game']['board']);
	
	// display message received if any
	if(response['message'] != undefined) console.log(response['message']);
	
	
	
	if(response['game'] != undefined && response['game']['waitingFor'] === myPlayerId){
		
		let hasChosen = false;
		let choice;
		
		while(!hasChosen){
			
			choice = readline.question('Where do you want to play ? ');
			
			if(choice.length === 2 
				&& response['game']['board'][choice.charAt(0)] != undefined 
				&& parseInt(choice.charAt(1)) >= 0
				&& parseInt(choice.charAt(1)) < 3
				&& response['game']['board'][choice.charAt(0)][parseInt(choice.charAt(1))] === -1) {
						
				hasChosen = true;
				console.log("Communicating choice...");
				
				client.write(JSON.stringify({
					"action": "player_selection",
					"game": response['game']['id'],
					"choice": choice
				}));
			} else {
				console.log("Wrong choice ! Please type a two letter string (ex: 'A0', 'B1', 'C2', ...)");
			}
		
		}
		
	}
	
});

client.on('error', (err) => {
	console.log('ERROR: Server has suddenly closed ! Sorry for the inconvenience.');
});
	
client.on('end', () => {
	console.log('disconnected');
});