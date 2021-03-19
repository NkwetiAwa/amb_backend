module.exports = (sequelize, Sequelize) => {
  const transactions = sequelize.define("transactions", {
    merchant_id: {
      type: Sequelize.INTEGER
    },
  });

  return transactions;
};