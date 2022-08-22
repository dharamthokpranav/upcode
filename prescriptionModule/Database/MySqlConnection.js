const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: 'pinkypromise-mysql.chrnnbie7jll.ap-south-1.rds.amazonaws.com',
        port: 3306,
        user: 'admin',
        password: 'PinkyPromiseMySQL',
        database: 'master',
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