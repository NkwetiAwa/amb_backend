const RoomChat = require('../models/chatMessagesModel');
const CatchAsync = require('../Utils/CatchAsync');
const db = require("./../models");
const chatMessage = db.chats;
const Merchants = db.merchant;
const {Op} = require("sequelize");

//adding a new message
exports.addNewMessage = CatchAsync(async (req, res, next) => {
    
    const body = req.body;
    const userId = req.param('userId');
    //const current = req.param('current');//testing with postman

    if(!userId || typeof userId == 'undefined' || typeof userId == 'null'){
        console.log("error");
    }else{
        const newMessage = {sender: body.sender, receiver: userId, time: body.time, message: body.message};
    
        const save = await chatMessage.create(newMessage);
        if(save){
            return res.send({
                save, 
                status: true
            });
        }else{
            return res.send({
                status:false,
            });
        }
    }

 });
 
 //get all messages according to sender and receiver
 exports.getAllMessages = CatchAsync(async (req, res, next) => {
    const userId = req.param('userId');
    const current = req.param('current');

    const user1=  await Merchants.findOne({
        where:{
            id:{
                [Op.eq]: userId
            }
        }
    })
    const user2=  await Merchants.findOne({
        where:{
            id:{
                [Op.eq]: current
            }
        }
    })


    const messages = await chatMessage.findAll({
        where:{
            [Op.or]:[
                {
                    receiver:{
                        [Op.eq]:user1.id
                    },
                    sender:{
                        [Op.eq]:user2.id
                    }
                },
                {
                    receiver:{
                        [Op.eq]:user2.id
                    },
                    sender:{
                        [Op.eq]:user1.id
                    }
                }
            ]
        }
    });
    if (messages){
        messages.forEach(async(message)=>{
            if(message.receiver === userId && message.seen_by_receiver===false){
                await chatMessage.update({
                    seen_by_receiver: true,
                },{
                    where:{
                        id:message.id
                    }
                })
            }
        })
        return res.send(messages);
    }
 });
 
 //get infos on one user
 exports.getUserRoom = CatchAsync(async (req, res, next) => {
    const userId = req.param('userId');
    const save = await Merchants.findOne({
        where: { 
            id: {
                [Op.eq]:userId,
            }
        } 
    });
    if(save){
        return res.send([save]);
    }else{
        return res.send({
            status:false,
        });
    }
 });

 //get all the room users 
 exports.getAllUserRoom = CatchAsync(async(req, res, next)=>{
    var Arr = [];
    const currentUserId = req.param('currentUserId');

    const messages = await chatMessage.findAll(
        {
        where:{
            [Op.or]:[
                {
                    receiver:{
                        [Op.eq]: currentUserId
                    },
                    sender:{
                        [Op.ne]: currentUserId
                    }
                },
                {
                    receiver:{
                        [Op.ne]: currentUserId
                    },
                    sender:{
                        [Op.eq]: currentUserId
                    }
                }
            ]
        },
        order:[
            ['createdAt', 'DESC']
        ]
    }
    );

    if(messages){
        var response = await Promise.all(messages.map(async(message)=>{

            const newMessages = await chatMessage.findAll({
                where:{
                    [Op.and]:[
                        {
                            id: message.id,
                        },
                        {
                            seen_by_receiver: false
                        }
                    ]        
                }
            })
            const unread = newMessages.length;


            const users = await Merchants.findOne({
                where:{
                    [Op.and]:[
                        {
                            [Op.or]:[
                                {
                                    id: {
                                        [Op.eq]:message.sender,
                                    }
                                },
                                {
                                    id: {
                                        [Op.eq]:message.receiver,
                                    }
                                }
                            ]
                        },
                        {
                            id: {
                                [Op.ne]:currentUserId,
                            }
                        }
                    ]  
                },
            })
            Arr.push(users)
            return {unread:unread};
             
        }));
        let respo = Arr.map(ele=>ele.id)
        let filtered = Arr.filter(({id}, index)=> !respo.includes(id, index+1));
        return res.send({filtered:filtered, response:response});
    }else{
        return res.send({satus:"no message found"})
    }  
  })
