import path from 'path';
import Knex from 'knex';

type EnvConfigs = {
  [key: string]: Knex.Config
};

const configs: EnvConfigs = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.RDB_HOST,
      user: process.env.RDB_USER,
      password: process.env.RDB_PASS,
      database: process.env.RDB_NAME
    },
    migrations: {
      directory: path.join(__dirname, 'src', 'db', 'migrations')
    },
    seeds: {
      directory: path.join(__dirname, 'src', 'db', 'seeds')
    }
  }
};
//
// https://stackoverflow.com/questions/52093618/knex-required-configuration-option-client-is-missing-error
module.exports = configs;
export default configs;
