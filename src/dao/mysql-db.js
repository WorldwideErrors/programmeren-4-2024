const mysql = require('mysql2')
const logger = require('../util/logger')
require('dotenv').config()

const dbConfig = {
    host: process.env.DB_HOST || 'sql7.freesqldatabase.com',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'sql7712083',
    password: process.env.DB_PASSWORD || 'kfXw9LPfSn', 
    database: process.env.DB_DATABASE || 'sql7712083',

    connectionLimit: 10,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
}

logger.trace(dbConfig)

const pool = mysql.createPool(dbConfig)

pool.on('connection', function (connection) {
    logger.trace(
        `Connected to database '${connection.config.database}' on '${connection.config.host}:${connection.config.port}'`
    )
})

pool.on('acquire', function (connection) {
    logger.trace('Connection %d acquired', connection.threadId)
})

pool.on('release', function (connection) {
    logger.trace('Connection %d released', connection.threadId)
})

module.exports = pool
