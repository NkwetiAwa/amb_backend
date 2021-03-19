module.exports = (sequelize, Sequelize)=>{
    const chatMessages = sequelize.define("chats",{
        conversation: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        sender:{
            type: Sequelize.INTEGER,
            allowNull:false,
        },
        time:{
            type:Sequelize.STRING
        },
        message:{
            type:Sequelize.STRING
        },
        media:{
            type:Sequelize.STRING,
            allowNull:true
        },
        mediatype:{
            type:Sequelize.STRING,
            allowNull:true
        },
        seen_by_receiver:{
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
    });

    return chatMessages;
}