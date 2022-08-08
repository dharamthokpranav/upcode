const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.HOST,
        port: process.env.DBPORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        requestTimeout: 600000,
        options: {
            enableArithAbort: true,
            idleTimeoutMillis: 600000
        }
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations'
    }

  });
module.exports = knex