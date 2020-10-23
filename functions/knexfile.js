// Update with your config settings.
module.exports = {

    development: {
      client: 'mysql',
      connection: {
        host : '52.204.119.95',
        user : 'root',
        password : 'w$YF2$1v*eKuz1',
        database : 'node'
      },
      migrations: {
        tableName: 'migrations',
        directory: 'database/migrations'
      }
    },
  
    staging: {
      client: 'postgresql',
      connection: {
        database: 'my_db',
        user:     'username',
        password: 'password'
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    },
  
    production: {
      client: 'mysql',
      connection: {
        host : process.env.MYSQL_HOST,
        user : process.env.MYSQL_USER,
        password : process.env.MYSQL_PASS,
        database : process.env.MYSQL_DB
      },
      migrations: {
        tableName: 'migrations'
      }
    }
  
  };
  