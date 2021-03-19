const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.merchant = require("./merchantUser")(sequelize, Sequelize);
db.products = require("./products")(sequelize, Sequelize);
db.transactions = require("./transactions")(sequelize, Sequelize);

db.chats = require("./chatMessagesModel")(sequelize, Sequelize, Sequelize.DataTypes);
db.reviews = require("./reviewModel")(sequelize, Sequelize);
db.conversations = require("./conversationsModel")(sequelize, Sequelize);

db.user = require("./user")(sequelize, Sequelize);

module.exports = db;