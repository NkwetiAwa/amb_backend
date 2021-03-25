const RoomChat = require('../models/chatMessagesModel');
const CatchAsync = require('../utils/catchAsync');
const db = require("./../models");
const chatMessage = db.chats;
const Merchants = db.merchant;
const Conversation = db.conversations;
const Products = db.products;
const normalUser = db.user;
const {Op} = require("sequelize");
const formidable = require("formidable");
const fs = require('fs');


//adding a new message
exports.addNewMessage = CatchAsync(async (req, res, next) => {
    
    const body = req.body;
    const convo = req.param("convo");

    if(!convo || typeof convo == 'undefined' || typeof convo == 'null'){
        console.log("error");
    }else{
        const formData = new formidable.IncomingForm();
        formData.parse(req, async(error, fields, files)=>{
            const sender = fields.sender;
            const conversation = fields.convo;
            const mediatype = fields.mediatype;
            const message = fields.message;

            var medialink;
            const time = Date.now();

            if(mediatype == "image"){
                var oldPath = files.media.name.substr(files.media.name.lastIndexOf("."));
                const newPath = "chats/images/" + sender + "_" + time + oldPath;
                fs.rename(files.media.path, newPath, (err)=>{
                    return;
                });
                medialink =  "chats/images/" + sender + "_" + time + oldPath;
            }
            else if(mediatype == "video"){
                var oldPath = files.media.name.substr(files.media.name.lastIndexOf("."));
                const newPath = "chats/videos/" + sender + "_" + time + oldPath;
                fs.rename(files.media.path, newPath, (err)=>{
                    return;
                });
                medialink =  "chats/videos/" + sender + "_" + time + oldPath;
            }
            else{
                medialink="";
            }

            const newMessage = {sender: sender, conversation: conversation, message: message, media: medialink, mediatype:mediatype};
    
            const saver = await chatMessage.create(newMessage);

            //update the time of the conversations
            const long = await Conversation.update({update: Date.now()},{
                where:{
                  id: conversation
                },
            })
            console.log("everything went wellllll");
            return res.send({
                saver,
                convo:convo,
                long
            });
        })
    }

 });
 
 //get all messages according to sender and receiver
 exports.getAllMessages = CatchAsync(async (req, res, next) => {
    const convo = req.param('convo');
    const current = req.param('current');
    var guest, guest_type, user1 = [];

    const conversation = await Conversation.findOne({ where: { id: convo } });
    if(conversation.sender_id == current){
      guest = conversation.receiver_id;
      guest_type = conversation.receiver_type;
    }else{
      guest = conversation.sender_id;
      guest_type = conversation.sender_type;
    }

    if(guest_type == 1){
      const user1 =  await Merchants.findOne({
          where:{
              id:{
                  [Op.eq]: guest
              }
          }
      })
    }else{
      const user1 =  await normalUser.findOne({
        where:{
            id:{
                [Op.eq]: guest
            }
        }
      })
    }

    const user2 =  await Merchants.findOne({
        where:{
            id:{
                [Op.eq]: current
            }
        }
    })

    const messages = await chatMessage.findAll({
        where:{ conversation: convo }
    });
    messages.forEach(async(message)=>{
        if(message.sender != current && message.seen_by_receiver == false){
            await chatMessage.update({
                seen_by_receiver: true,
            },{
                where:{
                    id:{
                        [Op.eq]:message.id
                    }
                }
            })
        }
    })
    return res.send(messages);
 });
 
 //get infos on one user
 exports.getUserRoom = CatchAsync(async (req, res, next) => {
    const convo = req.param('convo');
    const current = req.param('current');
    var guest, guest_type;

    if(convo != null){
      const converstation = await Conversation.findOne({ where: { id: convo }});
      if(converstation){
        if(converstation.sender_id == current){
          guest = converstation.receiver_id;
          guest_type = 1;
        }else{
          guest = converstation.sender_id;
          guest_type = converstation.sender_type;
        }

        if(guest_type == 1){
          const saver = await Merchants.findOne({
            where: { 
              id: {
                [Op.eq]:guest,
              }
            } 
          });
          if(saver){
            return res.send([saver]);
          }else{
            return res.send({
              status:false,
            });
          }
        }else{
          const saver = await normalUser.findOne({
            where: { 
              id: {
                [Op.eq]:guest,
              }
            } 
          });
          if(saver){
            return res.send([saver]);
          }else{
            return res.send({
              status:false,
            });
          }
        }
      }
    }else{
      return res.send({
        message: "The convo is null"
      })
    }

    
 });

 //get all the room users 
 exports.getAllUserRoom = CatchAsync(async(req, res, next)=>{
    var Arr = [];
    const currentUserId = req.param('currentUserId');
    const currentype = req.param('currentype');
    var user;
    if(currentype == 1){
      user = await Merchants.findOne({
          where:{
              id:currentUserId
          }
      })
    }else{
      user = await normalUser.findOne({
        where:{
            id:currentUserId
        }
      })
    }

    const convos = await Conversation.findAll({
        where:{
            [Op.or]:[
                {
                  sender_id:user.id, sender_type: currentype
                },{
                  receiver_id:user.id, receiver_type: currentype
                }
            ]
        },
        order:[
            ['update', 'DESC']
        ]
    });
    var response = await Promise.all(convos.map(async(convo)=>{
        var roomName, picture,room_id;
        var unread, last_message;
        if(convo.sender_id==currentUserId && convo.sender_type == currentype){
            const roomUser = await Merchants.findOne({
              where:{
                id:convo.receiver_id
              }
            });
            room_id = roomUser.id;
            roomName = roomUser.fullname;
            picture = roomUser.picture;
            last_message = await chatMessage.findOne({
                where:{
                    conversation:convo.id
                },
                order:[
                    ['createdAt', 'DESC']
                ]
            })

            
            const newMessages = await chatMessage.findAll({
                where:{ sender: convo.receiver_id, seen_by_receiver: false },
                order:[
                    ['createdAt', 'DESC']
                ]
            });
            unread = newMessages.length;
            
       }else{
         var roomUser = [];
         if(convo.sender_type == 1){
            const yam = await Merchants.findOne({
                where:{
                    id:convo.sender_id
                }
            });
            roomUser = yam;
          }else{
            const yam = await normalUser.findOne({
              where:{
                id: convo.sender_id
              }
            });
            roomUser = yam;
          }
            room_id = roomUser.id;
            roomName = roomUser.fullname;
            picture = roomUser.picture;
            
            const newMessages = await chatMessage.findAll({
                where:{ conversation: convo.id, seen_by_receiver: false, sender: { [Op.ne]: currentUserId} },
                order:[
                    ['createdAt', 'DESC']
                ]
            });
            unread = newMessages.length;
        }  
        


        return {unread:unread, picture:picture, roomName:roomName, id:room_id, convo: convo.id}
    }));

    return res.send({
        status:true,
        response:response,
        convos:convos,
    })
  })



//Create a new conversation for two users
exports.createConversation = CatchAsync(async (req, res, next) => {
  const senderid = req.param('senderid');
  const sendertype = req.param("sendertype");
  const receiverid = req.param("receiverid");

  var response = [], stat = false;

  const checker = await Conversation.findOne({ where: { 
    [Op.or]:[
      {
        sender_id: senderid, sender_type: sendertype, receiver_id: receiverid
      },
      {
        sender_id: receiverid, sender_type: 1, receiver_id: senderid
      }
    ]
  }})

  if(checker){
    response = checker;
    stat = true;
  }else{
    const newConvo = { sender_id: senderid, sender_type: sendertype, receiver_id: receiverid, receiver_type: 1 }
    const yam = await Conversation.create(newConvo);
    if(yam){
      response = yam;
      stat = true;
    }
  }

  return res.send({
    stat: stat,
    response: response
  });
});



//Create a new conversation for two users From Product Page
exports.contactProduct = CatchAsync(async (req, res, next) => {
  const senderid = req.param('senderid');
  const sendertype = req.param("sendertype");
  const receiverid = req.param("receiverid");
  const productname = req.param("productname");
  const productid = req.param("productid");


  const prod = await Products.findOne({ where: {id: productid}});

  var response = [], stat = false;

  const checker = await Conversation.findOne({ where: { 
    [Op.or]:[
      {
        sender_id: senderid, sender_type: sendertype, receiver_id: receiverid
      },
      {
        sender_id: receiverid, sender_type: 1, receiver_id: senderid
      }
    ]
  }})

  if(checker){
    response = checker;
    const newMessage = { conversation: checker.id, sender: senderid, message: `Interesting in your product ${productname}`, media: prod.images[0], mediatype:"image"};
    await chatMessage.create(newMessage);
    stat = true;
  }else{
    const newConvo = { sender_id: senderid, sender_type: sendertype, receiver_id: receiverid, receiver_type: 1 }
    const yam = await Conversation.create(newConvo);
    if(yam){
      response = yam;
      const newMessage = { conversation: checker.id, sender: senderid, message: `Interested in your product ${productname}`, media: prod.images[0], mediatype:"image"};
      await chatMessage.create(newMessage);
      stat = true;
    }
  }

  return res.send({
    stat: stat,
    response: response
  });
});


exports.unReadMessages = CatchAsync(async(req, res, next)=>{
  const userId = req.body.userId;
  const userType = req.body.userType;
  var User;
  var unread=0;

  const Convos = await Conversation.findAll({
    where: {
      [Op.or]:[
        {
          sender_id: userId, sender_type: userType
        },
        {
          receiver_id: userId, receiver_type: userType
        }
      ]
    }
  });

  const unRead = await Promise.all(Convos.map(async i => {
    const msgs = await chatMessage.findAll({ where: {
      conversation: i.id, seen_by_receiver: false, sender: { [Op.ne]: userId}
    }})
    unread = unread + msgs.length;
  }))
  
  return res.send({
      unread:unread,
  })
  
})