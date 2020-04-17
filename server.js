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
 * Websocket
 */
const { v4 } = require('uuid');
const { Server } = require('ws');
const wss = new Server({ server });

const debug = false;
// let seconds = new Date().getSeconds();

wss.on('connection', (ws) => {
	console.log('Client connected');
	ws.id = v4();
	ws.on('message', (data) => {
		wss.clients.forEach((client) => {
			let originalData = JSON.parse(data);
			originalData.id = ws.id;
			// console.log(data);
			// console.log(originalData);
			client.send(JSON.stringify(originalData));
		});
	});
	ws.on('close', () => console.log('Client disconnected'));
});

if (debug)
	setInterval(() => {
		wss.clients.forEach((client) => {
			const now = new Date();

			const hours = now.getHours();
			const minutes = now.getMinutes();
			const seconds = now.getSeconds();
			const milliseconds = now.getMilliseconds();

			const dateString = `${hours}:${minutes}:${seconds}:${milliseconds}`;
			const message = { type: 'time', message: dateString };
			const string = JSON.stringify(message);

			client.send(string);
		});
	}, 1);
