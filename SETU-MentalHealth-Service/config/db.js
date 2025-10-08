// // db.js
// require('dotenv').config();
// const { Sequelize } = require('sequelize');

// const env = process.env.NODE_ENV || 'development';

// const config = {
//   development: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres123',
//     database: process.env.DB_NAME || 'jobs',
//     host: process.env.DB_HOST || 'setu-db.cfou2gmogf98.ap-south-1.rds.amazonaws.com',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: console.log,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   },

//   test: {
//     username: process.env.DB_USER || 'postgres',
//     password: process.env.DB_PASSWORD || 'postgres123',
//     database: process.env.DB_NAME_TEST || 'jobs_test',
//     host: process.env.DB_HOST || 'setu-db.cfou2gmogf98.ap-south-1.rds.amazonaws.com',
//     port: process.env.DB_PORT || 5432,
//     dialect: 'postgres',
//     logging: false,
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,
//       idle: 10000,
//     },
//     dialectOptions: {
//       ssl: {
//         require: true,
//         rejectUnauthorized: false,
//       },
//     },
//   },

//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'postgres',
//     logging: false,
//     pool: {
//       max: 10,
//       min: 2,
//       acquire: 30000,
//       idle: 10000,
//     },
//     dialectOptions: {
//       ssl: {
//         require: false,
//         rejectUnauthorized: false,
//       },
//     },
//   },
// }[env]; // pick env config

// // Create Sequelize instance
// const sequelize = new Sequelize(
//   config.database,
//   config.username,
//   config.password,
//   config
// );

// module.exports = sequelize;


// config/db.js
require('dotenv').config();
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';

const baseConfig = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database:
    process.env.DB_NAME ||
    (env === 'test' ? 'jobs_test' : 'jobs'),
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  dialect: 'postgres',
  logging: env === 'development' ? console.log : false,
  pool: {
    max: env === 'production' ? 10 : 5,
    min: env === 'production' ? 2 : 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Enable SSL only if DB_SSL=true
let dialectOptions = {};
if (process.env.DB_SSL === 'true') {
  dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = new Sequelize(
  baseConfig.database,
  baseConfig.username,
  baseConfig.password,
  {
    ...baseConfig,
    dialectOptions,
  }
);

module.exports = sequelize;
