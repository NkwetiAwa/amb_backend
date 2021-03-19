module.exports = (sequelize, Sequelize) => {
  const products = sequelize.define("products", {
    merchant_id: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING(100)
    },
    price: {
      type: Sequelize.INTEGER
    },
    newprice: {
      type: Sequelize.INTEGER
    },
    color: {
      type: Sequelize.STRING
    },
    quantity: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING(5000)
    },
    rating: {
      type: Sequelize.INTEGER
    },
    images: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    video: {
      type: Sequelize.STRING
    },
    category: {
      type: Sequelize.ARRAY(Sequelize.STRING)
    },
    clicks: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  });

  return products;
};