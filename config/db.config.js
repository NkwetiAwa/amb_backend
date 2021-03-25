module.exports = {
  HOST: "localhost",
  USER: "primeu",
  PASSWORD: "cypher",
  DB: "amb",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// const Pool = require('pg').Pool
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'amb',
//   password: 'password',
// })


// module.exports = { pool }