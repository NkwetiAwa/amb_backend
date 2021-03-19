const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');


const urlEncodedParser = bodyParser.urlencoded({
    extended: true,
 });

const chatController = require('../Controllers/chatController');

//posting a new message
router.post('/newmessage', urlEncodedParser, chatController.addNewMessage);

//get all the messages according to the receiver
router.get('/allmessages', chatController.getAllMessages);

//Create new conversation
router.get('/createconvo', chatController.createConversation);

//get infos about a particular user in the chat
router.get('/roomUser', chatController.getUserRoom);

//get infos about all user in the chat room
router.get('/allrooms', chatController.getAllUserRoom);

//Contact from the products page
router.get('/productcontact', chatController.contactProduct);


router.post('/totalMessages', chatController.unReadMessages);


module.exports = router;
