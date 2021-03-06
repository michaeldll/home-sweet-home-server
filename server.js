/**
 * Server
 */
const express = require('express');
const PORT = process.env.PORT || 1234;
const INDEX = '/index.html';

const server = express()
	.use((req, res) => res.sendFile(INDEX, { root: __dirname }))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));

/**
 * UUID
 */
const { v4 } = require('uuid');

/**
 * Websocket
 */
const { Server } = require('ws');
const wss = new Server({ server });

// const debug = false;
function getWebSocketDataFrom(text) {
	const regex = /.*(type)(\W)(.*)(\W)(message)(\W)(.*)(\W)(id)(\W)(.*).*/gm
	let matches
	let data = {
		accessCode: '',
		type: '',
		message: {},
	}

	while ((matches = regex.exec(text)) !== null) {
		// This is necessary to avoid infinite loops with zero-width matches
		if (matches.index === regex.lastIndex) {
			regex.lastIndex++
		}

		// The result can be accessed through the `matches`-variable.
		matches.forEach((match, groupIndex) => {
			switch (groupIndex) {
				case 3:
					data.type = match
					break
				case 7:
					data.message = match
					break
				case 11:
					data.accessCode = match
					break
				default:
					break
			}
		})
	}

	return data
}

function getClient (device, code) {
	return usersDB[device].find(user=>user.accessCode === code)
}

function getClients (device, code) {
	return usersDB[device].filter(user=>user.accessCode === code)
}

let usersDB = { mobile: [], desktop: [] };
let debug = {
	data: {
		mobile: "",
		desktop: ""
	}
};
//wss://home-sweet-home--ws.herokuapp.com/
wss.on('connection', (ws) => {
	console.log('Client connected');
	ws.uuid = v4();
	ws.on('message', function incoming(data) {
		if (typeof data === 'string') { debug.data.mobile = data; }
		else if (typeof data === 'object') { debug.data.desktop = data.toString('utf8'); }
		wss.clients.forEach(function each(client) {
			//only send if two different clients connected
			if (client !== ws) {
				client.send(data)
				// let accessCode;
				// //Unity sends a buffer in binary
				// if (typeof data === 'object') {
				// 	//get access code
				// 	accessCode = getWebSocketDataFrom(data.toString('utf8')).accessCode;
				// 	//store if new connection
				// 	if(!usersDB.desktop.find(user=>user.ws.uuid === ws.uuid)){
				// 		console.log('storing another desktop user');
				// 		// console.log(ws.uuid)
				// 		usersDB.desktop.push({
				// 			accessCode: accessCode,
				// 			connected: false,
				// 			ws: ws
				// 		});
				// 	}
				// 	//find access codes on mobile
				// 	const matchingClients = getClients('mobile', accessCode);
					
				// 	matchingClients.forEach(client=>{
				// 		//send
				// 		if(client){
				// 			client.connected = true;
				// 			client.ws.send(data)
				// 			console.log(data.toString('utf-8'))
				// 		}
				// 	})

				// }
				// //Vue app sends a JSON string
				// else if (typeof data === 'string') {
				// 	//get access code
				// 	accessCode = JSON.parse(data).id;
				// 	//store if new connection
				// 	if(!usersDB.mobile.find(user=>user.ws.uuid === ws.uuid)){
				// 		console.log('storing another mobile user');
				// 		usersDB.mobile.push({
				// 			accessCode: accessCode,
				// 			connected: false,
				// 			ws: ws
				// 		});
				// 	}
				// 	//find access codes on desktop
				// 	const matchingClients = getClients('desktop', accessCode);

				// 	matchingClients.forEach(client=>{
				// 		//send
				// 		if(client){
				// 			client.connected = true;
				// 			client.ws.send(data)
				// 			// console.log(data.toString('utf-8'))
				// 		}
				// 	})
				// }
			}
		});
	});
	ws.on('close', () => console.log('Client disconnected'));
});

if(debug){
	setInterval(() => {
		// console.log(debug.data.desktop, debug.data.mobile)
	}, 5000);
}


// if (debug)
// 	setInterval(() => {
// 		wss.clients.forEach((client) => {
// 			const now = new Date();

// 			const hours = now.getHours();
// 			const minutes = now.getMinutes();
// 			const seconds = now.getSeconds();
// 			const milliseconds = now.getMilliseconds();

// 			const dateString = `${hours}:${minutes}:${seconds}:${milliseconds}`;
// 			const message = { type: 'time', message: dateString };
// 			const string = JSON.stringify(message);

// 			client.send(string);
// 		});
// 	}, 1);
