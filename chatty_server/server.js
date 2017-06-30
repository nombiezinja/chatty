// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const socket = require('ws')

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });


wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === socket.OPEN) {
      client.send(data);
    }
  });
};

let users = 0

wss.on('connection', (ws) => {
  users++;
  userColour = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
  const newUser = {
    type: 'incomingNotification',
    id: Math.random(),
    colour: userColour,
    content: 'Rejoice! A new lover of the arcane powers has just joined the channel.',
  }
  wss.broadcast(JSON.stringify(newUser));
  const usersOnline = {
    type: 'usersOnline',
    number: users
  }
  wss.broadcast(JSON.stringify(usersOnline));

 ws.on('message', (data) => {
  const message = JSON.parse(data);
  if(message.type === 'postMessage'){
    const imgUrlRegex = /(https?:\/\/[^\s]+[.png|.jpg|.gif])/g
    if(message.content.match(imgUrlRegex)){
      console.log('issa picture');
      const imgUrl = message.content.match(imgUrlRegex).toString();
      const content = message.content.replace(message.content.match(imgUrlRegex),'\n');
      const newMessage = {
        type: 'incomingPicMessage',
        id: Math.random(),
        username: message.username,
        content: message.content,
        imgUrl: imgUrl,
        content:content
      };
      wss.broadcast(JSON.stringify(newMessage));
    } else {
      const newMessage = {
        type: 'incomingMessage',
        id: Math.random(),
        username: message.username,
        content: message.content,
      };
      console.log('server received message:',newMessage);
      wss.broadcast(JSON.stringify(newMessage));
    }
  }

  if(message.type === 'postNotification'){
    const newNotification = {
      type: 'incomingNotification',
      id: Math.random(),
      content: message.content
    };
    console.log('server received notification:', newNotification);
    wss.broadcast(JSON.stringify(newNotification));
  }
  const newUser = {
    type: 'incomingUser',
    id: Math.random(),
    content: ''
  }
 });

  ws.on('close', () => {
    console.log('Client disconnected');
    users--;
    const usersOnline = {
      type: 'usersOnline',
      number: users
    }
    wss.broadcast(JSON.stringify(usersOnline));
  });

});




