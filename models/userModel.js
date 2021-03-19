module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user", {
        fullname: {
            type: Sequelize.STRING(60)
        },
        email: {
            type: Sequelize.STRING(60)
        },
        password: {
            type: Sequelize.STRING
        },
        contact: {
            type: Sequelize.STRING(60)
        },
        picture: {
            type: Sequelize.STRING(60)
        },
        country: {
            type: Sequelize.STRING(60)
        },
        state: {
            type: Sequelize.STRING(60)
        },
        user_type:{
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    });
    return User;
}