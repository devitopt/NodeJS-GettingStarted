'use strict';

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();

const express = require('express');
var cors = require('cors');
const socketIO = require('socket.io');

const PORT = process.env.PORT || 5000;
const INDEX = '/index.html';

var app = express();
app.use(cors({ origin: INDEX }));

app.get('/', (req, res) => res.sendFile(INDEX, { root: __dirname }));
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

var io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    let userId = "userId";
    console.log('client connected');

    socket.on('UserId', (data) => {
        userId = data.userId;
        console.log(userId, 'connected');
    })

    socket.on('disconnect', async () => {
        console.log(userId, 'disconnected');
        const docRef = db.collection('users').doc(userId);
        await docRef.update({
            connected: false
        })
    })
});