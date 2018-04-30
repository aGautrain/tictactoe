const net = require('net');
const uuid = require('uuid/v1');
const gameLogic = require('./logic');



const server = net.createServer((socket) => {
	
	socket.uuid = uuid();
	
	gameLogic.addPlayerToQueue(socket);
	
	socket.on('data', (data) => {
		
		const response = JSON.parse(data.toString('utf8'));
		
		if(response['action'] === 'player_selection'){
			gameLogic.play(response['game'], socket.uuid, response['choice']);
		}
	});
	
	socket.on('error', (err) => {
		console.log('A client has left abruptly !');
		server.getConnections((err, count) => {
			if(err){
				console.log(err);
			} else {
				console.log("Currently " + count + " active connection(s)");
			}
		});
	});
	
	socket.on('end', () => {
		console.log("A client has left");
		server.getConnections((err, count) => {
			if(err){
				console.log(err);
			} else {
				console.log("Currently " + count + " active connection(s)");
			}
		});
	});
});

server.on('error', (err) => {
  // handle errors here
  console.log("Error:", err);
});


server.on('connection', (socket) => {
	// someone connected
	console.log("New active connection");
	server.getConnections((err, count) => {
		if(err){
			console.log(err);
		} else {
			console.log("Currently " + count + " active connection(s)");
		}
	});
});

// grab an arbitrary unused port.
server.listen(1234, () => {
  console.log('opened server on', server.address());
});
