const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const cors = require('cors');
const path = require('path');
const { Low, JSONFile } = require('lowdb');
const { pathToRegexpErrorHandler } = require('./middleware');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}));


// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const file = path.join(__dirname, process.env.DB_FILE || 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

async function setupDb() {
    await db.read();
    db.data = db.data || { chatHistory: {}, users: {} };
    await db.write();
}

setupDb();

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_room', async (data) => {
    socket.join(data.room);
    db.data.users[socket.id] = { id: socket.id, username: data.username, room: data.room };
    await db.write();

    if (!db.data.chatHistory[data.room]) {
      db.data.chatHistory[data.room] = [];
      await db.write();
    }

    socket.emit('chat_history', db.data.chatHistory[data.room]);
    io.to(data.room).emit('user_list', Object.values(db.data.users).filter(user => user.room === data.room));
  });

  socket.on('send_message', async (data) => {
    db.data.chatHistory[data.room].push(data);
    await db.write();
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.room).emit('typing', { username: data.username });
  });

  socket.on('disconnect', async () => {
    const user = db.data.users[socket.id];
    if (user) {
      delete db.data.users[socket.id];
      await db.write();
      io.to(user.room).emit('user_list', Object.values(db.data.users).filter(u => u.room === user.room));
    }
    console.log('User Disconnected', socket.id);
  });
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Use the path-to-regexp error handling middleware
app.use(pathToRegexpErrorHandler);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`SERVER IS RUNNING ON PORT ${PORT}`);
});
