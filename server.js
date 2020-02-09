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
 * Websockets
 */
const { Server } = require('ws');
const wss = new Server({ server });

const debug = false;

wss.on('connection', ws => {
	console.log('Client connected');
	ws.on('message', data => {
		console.log(data);
		wss.clients.forEach(client => {
			client.send(data);
		});
	});
	ws.on('close', () => console.log('Client disconnected'));
});

if (debug)
	setInterval(() => {
		wss.clients.forEach(client => {
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
