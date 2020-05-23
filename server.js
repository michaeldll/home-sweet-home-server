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

let usersDB = { mobile: [], desktop: [] };
let consoleDataMobile;
let consoleDataDesktop;

wss.on('connection', (ws) => {
	console.log('Client connected');
	ws.uuid = v4();
	ws.on('message', function incoming(data) {
		if (typeof data === 'string') { consoleDataMobile = data; }
		else if (typeof data === 'object') { consoleDataDesktop = data.toString('utf8'); }
		wss.clients.forEach(function each(client) {
			//only send if two different clients connected
			if (client !== ws) {
				let accessCode;
				//Unity sends a buffer in binary
				if (typeof data === 'object') {
					//get access code
					accessCode = getWebSocketDataFrom(data.toString('utf8')).accessCode;
					//store 
					if(!usersDB.desktop.find(user=>user.ws && user.ws.uuid === ws.uuid)){
						usersDB.desktop.push({
							accessCode: accessCode,
							connected: false,
							ws: ws
						});
					}
					//find access codes on mobile
					const matchingClient = getClient('mobile', accessCode);
					//send
					if(matchingClient){
						matchingClient.connected = true;
						matchingClient.ws.send(data)
					}
				}
				//Vue app sends a JSON string
				else if (typeof data === 'string') {
					//get access code
					accessCode = JSON.parse(data).id;
					//store
					if(!usersDB.mobile.find(user=>user.ws && user.ws.uuid === ws.uuid)){
						usersDB.mobile.push({
							accessCode: accessCode,
							connected: false,
							ws: ws
						});
					}
					//find access codes on desktop
					const matchingClient = getClient('desktop', accessCode);
					//send
					if(matchingClient){
						matchingClient.connected = true;
						matchingClient.ws.send(data)
					}
				}
			}
		});
	});
	ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
	console.log(usersDB.mobile, usersDB.desktop)
	console.log(consoleDataDesktop, consoleDataMobile)
}, 3500);

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
