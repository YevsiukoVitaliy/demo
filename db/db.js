const { Sequelize } = require('sequelize');

module.exports = new Sequelize(
  process.env.DATABASE_URL ||
    `postgresql://${process.env.USER_DB}:${process.env.PASSWORD_DB}@${process.env.HOST_DB}:${process.env.PORT_DB}/${process.env.DATABASE_DB}`
);
// process.env.DATABASE_DB,
//   process.env.USER_DB,
//   process.env.PASSWORD_DB,
//   {
//     dialect: 'postgres',
//     host: process.env.HOST_DB,
//     port: process.env.PORT_DB,
//   }
