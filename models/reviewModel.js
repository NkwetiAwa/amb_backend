module.exports = (sequelize, Sequelize)=>{
    const review = sequelize.define("reviews",{
        sender:{
            type: Sequelize.INTEGER
        },
        comment:{
            type:Sequelize.STRING
        },
        product:{
            type:Sequelize.INTEGER
        },
        rate:{
            type:Sequelize.INTEGER
        },
    });

    return review;
}