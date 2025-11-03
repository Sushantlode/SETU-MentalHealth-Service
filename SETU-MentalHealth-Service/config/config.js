require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres123',
  database: process.env.DB_NAME || (env === 'test' ? 'jobs_test' : 'jobs'),
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

const withSsl = (config) => {
  if (process.env.DB_SSL === 'true') {
    return {
      ...config,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  }
  return config;
};

module.exports = {
  development: withSsl(base),
  test: withSsl({
    ...base,
    database: process.env.DB_NAME_TEST || 'jobs_test',
    logging: false,
  }),
  production: withSsl({
    ...base,
    database: process.env.DB_NAME_PROD || process.env.DB_NAME || 'jobs',
    logging: false,
  }),
};
