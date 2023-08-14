const express = require('express');
const server = express();

const bodyParser = require('body-parser');

//template engine , for sending output to interface.
server.set('view engine', 'ejs');

// set up middleware for static files
server.use(express.static('./public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

var controller = require('./controllers/control.js');
controller(server);

var database = require('./controllers/dbconnect.js');

const port = process.env.PORT || 3300;
server.listen(port, ()=>{
    console.log(`AUCTION is running on port ${port} ........`);
})