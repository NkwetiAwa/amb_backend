const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path")
const fs = require("fs");
const https = require("https");
const http = require("http");

var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};

const app = express();
var cron = require('node-cron');


var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

const { Disactivator } = require("./routes/functions/Disactivator");


cron.schedule('0 0 0 * * *', () => {
  Disactivator();
});

//Middle wares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, '')))

//Static File
app.use('/profiles', express.static('profiles'));
app.use('/products', express.static('products'));
app.use('/chats', express.static('chats'));

//Connect to Database
const db = require("./models");
db.sequelize.sync();

//Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AMB" });
});


//import route scripts
const merchants = require('./routes/merchants');
const products = require('./routes/products');
const chat = require('./routes/chatsRoutes');
const review= require('./routes/reviewsRoutes');
const userManupulation = require('./routes/userManupulation');
const search = require('./routes/search');

//Assign route scripts to routes
app.use('/merchants', merchants);
app.use('/products', products);
app.use('/chat', chat);
app.use('/review', review);
app.use('/userManupulation', userManupulation)
app.use('/search', search);


//defining the server


httpServer.listen(8080);
httpsServer.listen(8443);

