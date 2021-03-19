module.exports = (sequelize, Sequelize) => {
  const merchantUser = sequelize.define("merchants", {
    fullname: {
      type: Sequelize.STRING(100)
    },
    username: {
      type: Sequelize.STRING(20),
      unique: true
    },
    email: {
      type: Sequelize.STRING(30),
      unique: true
    },
    password: {
      type: Sequelize.STRING
    },
    contact: {
      type: Sequelize.STRING(20)
    },
    picture: {
      type: Sequelize.STRING,
      defaultValue: 'profiles/merchants/default.png'
    },
    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    payment_date: {
      type: Sequelize.DATE,
    },
    country: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING
    }
  });

  return merchantUser;
};