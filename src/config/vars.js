const nodeEnv = require('custom-env');

const {
  APP_PORT,
  APP_ENV,
  BACKEND_URL,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_SCHEMA,
  DB_DIALECT,
  FRONTEND_URL,
  DEFAULTPASSWORDKEY,
  REGIONTEMP,
  ACCESSKEYTEMP,
  SECRETKEYTEMP,
  BODY_PARSER_LIMIT,
} = process.env.APP_SECRET ? JSON.parse(process.env.APP_SECRET) : {};

nodeEnv.env(process.env.NODE_ENV || 'local', './env');

module.exports = {
  app: {
    port: parseInt(APP_PORT || process.env.APP_PORT, 10) || 8090,
    env: APP_ENV || process.env.APP_ENV,
    backendURL: BACKEND_URL || process.env.BACKEND_URL,
    frontendURL: FRONTEND_URL || process.env.FRONTEND_URL,
    accesstoken: ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
    refreshtoken: REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET,
  },
  db: {
    dialect: DB_DIALECT || process.env.DB_DIALECT,
    host: DB_HOST || process.env.DB_HOST,
    port: parseInt(DB_PORT || process.env.DB_PORT, 10) || 3306,
    username: DB_USER || process.env.DB_USER,
    password: DB_PASSWORD || process.env.DB_PASSWORD,
    database: DB_NAME || process.env.DB_NAME,
    debug: process.env.DB_DEBUG,
    schema: DB_SCHEMA || process.env.DB_SCHEMA,
    poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 5,
    poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 0,
    poolAcquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 15000,
    pollIdle: parseInt(process.env.DB_POOLIdLE, 10) || 10000,
  },
  temp: {
    regionTemp: REGIONTEMP || process.env.REGIONTEMP,
    accessKeyTemp: ACCESSKEYTEMP || process.env.ACCESSKEYTEMP,
    secretKeyTemp: SECRETKEYTEMP || process.env.SECRETKEYTEMP,
  },
  bodyParser: {
    limit: BODY_PARSER_LIMIT || process.env.BODY_PARSER_LIMIT,
  },
  credentials: {
    defaultPassword: DEFAULTPASSWORDKEY || process.env.DEFAULTPASSWORDKEY,
  }
};
