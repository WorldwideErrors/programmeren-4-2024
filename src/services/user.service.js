const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')

const userService = {
    create: (user, callback) => {
        logger.info('create user', user)
        db.getConnection(function (err, connection) {
            if (err) {
                logger.error('Error getting database connection:', err)
                return callback(err, null)
            }

            connection.query(
                'INSERT INTO user SET ?',
                user,
                function (error, results, fields) {
                    if (error) {
                        connection.release()
                        if (error.code === 'ER_DUP_ENTRY') {
                            callback(
                                {
                                    status: 500,
                                    message:
                                        'Gebruiker met het ingegeven e-mailadres bestaat al.'
                                },
                                null
                            )
                        } else {
                            logger.error(error)
                            callback(error, null)
                        }
                    } else {
                        const insertedUserID = results.insertId

                        connection.query(
                            'SELECT * FROM user WHERE id = ?',
                            [insertedUserID],
                            function (error, results, fields) {
                                connection.release()
                                if (error) {
                                    logger.error(
                                        'Error during user retrieval:',
                                        error
                                    )
                                    callback(error, null)
                                } else {
                                    logger.debug(
                                        'User inserted and retrieved:',
                                        results
                                    )
                                    callback(null, {
                                        message: 'Nieuwe gebruiker toegevoegd.',
                                        data: results[0]
                                    })
                                }
                            }
                        )
                    }
                }
            )
        })
    },

    getAll: (filters, callback) => {
        logger.info('getAll')

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }
            logger.info('Filters: ' + filters)
            let query =
                'SELECT id, firstName, lastName, emailAdress, street, city, phonenumber FROM `user`'

            //Arrays voor filters
            let conditions = []
            let values = []

            // Filter condities vullen
            if (filters.firstName) {
                conditions.push('firstName LIKE ?')
                values.push(filters.firstName + '%')
            }

            if (filters.lastName) {
                conditions.push('lastName LIKE ?')
                values.push(filters.lastName + '%')
            }

            console.log(conditions)
            console.log(values)

            // Als er filters zijn, vul de query aan
            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ')
            }

            connection.query(query, values, function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    logger.debug(results)
                    callback(null, {
                        message: `${results.length} gebruikers gevonden.`,
                        data: results
                    })
                }
            })
        })
    },

    getUserById: (userId, userToken, callback) => {
        logger.info('getProfile userId:', userId)
        logger.info(userToken + ' is the token')

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            let query =
                'SELECT id, firstName, lastName, emailAdress, street, city, phonenumber FROM `user` WHERE id = ?'

            // Als user zichzelf opvraagt, geef wachtwoord mee
            if (userToken == userId) {
                logger.info('User = token')
                query =
                    'SELECT id, firstName, lastName, emailAdress, street, city, phonenumber, password FROM `user` WHERE id = ?'
            }

            connection.query(
                query,
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.length === 0) {
                            callback(
                                {
                                    status: 404,
                                    message: 'Gebruiker niet gevonden.'
                                },
                                null
                            )
                        } else {
                            logger.debug(results)
                            callback(null, {
                                status: 200,
                                message: `Gebruiker met ID ${userId} gevonden.`,
                                data: results
                            })
                        }
                    }
                }
            )
        })
    },

    getProfile: (userId, callback) => {
        logger.info('getProfile userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'SELECT id, firstName, lastName, emailAdress, street, city, phonenumber FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.length === 0) {
                            callback(
                                {
                                    status: 404,
                                    message: 'Gebruiker niet gevonden.'
                                },
                                null
                            )
                        } else {
                            logger.debug(results)
                            callback(null, {
                                message: `Gebruiker met ID ${userId} gevonden.`,
                                data: results
                            })
                        }
                    }
                }
            )
        })
    },

    update: (user, userId, callback) => {
        logger.info('Edit userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error('Error getting database connection:', err)
                return callback(err, null)
            }

            connection.query(
                'UPDATE user SET ? WHERE id = ?',
                [user, userId],
                function (error, results, fields) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        return callback(error, null)
                    }

                    // Controleer of er rijen zijn bijgewerkt
                    if (results.affectedRows === 0) {
                        connection.release()
                        return callback(
                            {
                                status: 404,
                                message: 'Gebruiker niet gevonden.'
                            },
                            null
                        )
                    }
                    connection.query(
                        'SELECT * FROM user WHERE id = ?',
                        [userId],
                        function (error, results, fields) {
                            connection.release()
                            if (error) {
                                logger.error(
                                    'Error during user retrieval:',
                                    error
                                )
                                callback(error, null)
                            } else {
                                if (results.affectedRows === 0) {
                                    callback(
                                        {
                                            status: 404,
                                            message: 'Gebruiker niet gevonden.'
                                        },
                                        null
                                    )
                                } else {
                                    logger.debug(
                                        'User updated and retrieved:',
                                        results
                                    )
                                    callback(null, {
                                        status: 200,
                                        message: `Gebruiker met ID ${userId} is aangepast.`,
                                        data: results
                                    })
                                }
                            }
                        }
                    )
                }
            )
        })
    },

    delete: (userId, callback) => {
        logger.info('Delete userId:', userId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM `user` WHERE id = ?',
                [userId],
                function (error, results, fields) {
                    connection.release()

                    if (error) {
                        logger.error(error)
                        callback(error, null)
                    } else {
                        if (results.affectedRows === 0) {
                            callback(
                                {
                                    status: 404,
                                    message: 'Gebruiker niet gevonden.'
                                },
                                null
                            )
                        } else {
                            logger.debug(
                                `Deleted ${results.affectedRows} users`
                            )
                            callback(null, {
                                status: 200,
                                message: `Gebruiker met ID ${userId} is verwijderd`
                            })
                        }
                    }
                }
            )
        })
    }
}

module.exports = userService
