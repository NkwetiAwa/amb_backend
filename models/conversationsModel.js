module.exports = (sequelize, Sequelize)=>{
    const conversations = sequelize.define("conversations",{
        sender_id:{
            type: Sequelize.INTEGER,
            allowNull:false,
        },
        receiver_id:{
            type: Sequelize.INTEGER,
            allowNull: false
        },
        sender_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        receiver_type: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        update:{
            type: Sequelize.DATE
        }
    });

    return conversations;
}