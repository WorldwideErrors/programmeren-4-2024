const database = require('../dao/inmem-db')
const logger = require('../util/logger')

const db = require('../dao/mysql-db')
const { participate } = require('../controllers/meal.controller')

const mealService = {
    // UC-301 Toevoegen van Maaltijd
    create: (Meal, UserId, callback) => {
        logger.info('create meal', Meal)
        logger.info('cook: ' + UserId)
        logger.info(Meal)

        // Add the userId as the cookid in the meal object
        Meal.cookid = UserId

        if (Meal.allergenes === undefined) {
            Meal.allergenes = ''
        }

        logger.info(Meal)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'INSERT INTO meal SET ?',
                Meal,
                function (error, results, fields) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        callback(error, null)
                    } else {
                        const insertedMealID = results.insertId

                        connection.query(
                            'SELECT * FROM meal WHERE id = ?',
                            [insertedMealID],
                            function (error, results, fields) {
                                connection.release()
                                if (error) {
                                    logger.error(error)
                                    callback(error, null)
                                } else {
                                    logger.debug(results)
                                    callback(null, {
                                        status: 201,
                                        message: `Nieuwe maaltijd toegevoegd.`,
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

    // UC-302 Wijzigen van maaltijdgegevens
    update: (meal, mealId, callback) => {
        logger.info('Edit mealId:', mealId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error('Error getting database connection:', err)
                return callback(err, null)
            }

            connection.query(
                'UPDATE meal SET ? WHERE id = ?',
                [meal, mealId],
                function (error, results, fields) {
                    if (error) {
                        connection.release()
                        logger.error(error)
                        callback(error, null)
                    } else {
                        connection.query(
                            'SELECT * FROM meal WHERE id = ?',
                            [mealId],
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
                                        'Meal updated and retrieved:',
                                        results
                                    )
                                    callback(null, {
                                        message: `Maaltijd met ID ${mealId} gevonden.`,
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

    // UC-303 Opvragen van alle maaltijden
    getAll: (callback) => {
        logger.info('getAll')

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            const query = `
            SELECT 
                meal.id AS mealId, 
                meal.name AS mealName, 
                meal.description, 
                meal.allergenes, 
                user.id AS cookId, 
                user.firstName AS cookFirstName, 
                user.lastName AS cookLastName, 
                user.emailAdress AS cookEmailAdress, 
                user.street AS cookStreet, 
                user.city AS cookCity, 
                user.phoneNumber AS cookPhoneNumber
            FROM meal 
            JOIN user ON meal.cookid = user.id
            `

            connection.query(query, function (error, results, fields) {
                connection.release()

                if (error) {
                    logger.error(error)
                    callback(error, null)
                } else {
                    const meals = results.map((row) => ({
                        id: row.mealId,
                        name: row.mealName,
                        description: row.description,
                        allergenes: row.allergenes,
                        cook: {
                            id: row.cookId,
                            firstName: row.cookFirstName,
                            lastName: row.cookLastName,
                            emailAdress: row.cookEmailAdress,
                            street: row.cookStreet,
                            city: row.cookCity,
                            phoneNumber: row.cookPhoneNumber
                        }
                    }))

                    logger.debug(results)
                    callback(null, {
                        message: `${results.length} maaltijden gevonden.`,
                        data: meals
                    })
                }
            })
        })
    },

    // UC-304 Opvragen van maaltijd bij ID
    getSpecificMeal: (mealId, callback) => {
        logger.info('getProfile mealId:', mealId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            const query = `
            SELECT 
                meal.id AS mealId, 
                meal.name AS mealName, 
                meal.description, 
                meal.allergenes, 
                user.id AS cookId, 
                user.firstName AS cookFirstName, 
                user.lastName AS cookLastName, 
                user.emailAdress AS cookEmailAdress, 
                user.street AS cookStreet, 
                user.city AS cookCity, 
                user.phoneNumber AS cookPhoneNumber
            FROM meal 
            JOIN user ON meal.cookid = user.id 
            WHERE meal.id = ?
            `

            connection.query(
                query,
                [mealId],
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
                                    message: 'Maaltijd niet gevonden.'
                                },
                                null
                            )
                        } else {
                            const meals = results.map((row) => ({
                                id: row.mealId,
                                name: row.mealName,
                                description: row.description,
                                allergenes: row.allergenes,
                                cook: {
                                    id: row.cookId,
                                    firstName: row.cookFirstName,
                                    lastName: row.cookLastName,
                                    emailAdress: row.cookEmailAdress,
                                    street: row.cookStreet,
                                    city: row.cookCity,
                                    phoneNumber: row.cookPhoneNumber
                                }
                            }))
                            logger.debug(results)
                            callback(null, {
                                status: 200,
                                message: `Maaltijd met ID ${mealId} gevonden.`,
                                data: meals
                            })
                        }
                    }
                }
            )
        })
    },

    // UC-305 Verwijderen van maaltijd
    delete: (mealId, callback) => {
        logger.info('Delete mealId:', mealId)

        db.getConnection(function (err, connection) {
            if (err) {
                logger.error(err)
                callback(err, null)
                return
            }

            connection.query(
                'DELETE FROM `meal` WHERE id = ?',
                [mealId],
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
                                    message: 'Maaltijd niet gevonden.'
                                },
                                null
                            )
                        } else {
                            logger.debug(
                                `Deleted ${results.affectedRows} meals`
                            )
                            callback(null, {
                                message: `Maaltijd met ID ${mealId} is verwijderd.`
                            })
                        }
                    }
                }
            )
        })
    },

    // UC-401 Aanmelden voor maaltijd
    participate: (mealId, userId, callback) => {
        logger.info('participate at mealId: ', mealId)

        db.getConnection((err, connection) => {
            if (err) {
                logger.error('Error getting database connection:', err)
                return callback(err, null)
            }

            const selectMealQuery =
                'SELECT name, description, maxAmountOfParticipants FROM meal WHERE id = ?'
            connection.query(selectMealQuery, [mealId], (error, results) => {
                if (error) {
                    connection.release()
                    logger.error(error)
                    return callback(error, null)
                }

                if (results.length === 0) {
                    connection.release()
                    return callback(
                        { status: 404, message: 'Maaltijd niet gevonden.' },
                        null
                    )
                }

                const maxAmountOfParticipants =
                    results[0].maxAmountOfParticipants

                const countParticipantsQuery =
                    'SELECT COUNT(*) as Participants FROM meal_participants_user WHERE mealId = ?'
                connection.query(
                    countParticipantsQuery,
                    [mealId],
                    (error, results) => {
                        if (error) {
                            connection.release()
                            logger.error(error)
                            return callback(error, null)
                        }

                        const participants = results[0].Participants

                        if (participants >= maxAmountOfParticipants) {
                            connection.release()
                            return callback(
                                {
                                    status: 200,
                                    message:
                                        'Maximumaantal aanmeldingen is bereikt.'
                                },
                                null
                            )
                        }

                        const insertParticipantQuery =
                            'INSERT INTO meal_participants_user SET ?'
                        const participantData = {
                            mealId: mealId,
                            userId: userId
                        }
                        connection.query(
                            insertParticipantQuery,
                            participantData,
                            (error, results) => {
                                connection.release()

                                if (error) {
                                    if (error.code === 'ER_DUP_ENTRY') {
                                        return callback(
                                            {
                                                status: 500,
                                                message:
                                                    'Je bent al aangemeld voor deze maaltijd.'
                                            },
                                            null
                                        )
                                    } else {
                                        logger.error(error)
                                        return callback(error, null)
                                    }
                                }

                                const selectParticipantQuery = `
                                SELECT 
                                meal_participants_user.mealId, 
                                meal_participants_user.userId,
                                meal.name AS mealName,
                                meal.description AS mealDescription,
                                user.firstName AS participantFirstName,
                                user.lastName AS participantLastName,
                                user.emailAdress AS participantEmailAdress,
                                user.phoneNumber AS participantPhoneNumber
                            FROM meal_participants_user
                            JOIN meal ON meal_participants_user.mealId = meal.id
                            JOIN user ON meal_participants_user.userId = user.id
                            WHERE meal_participants_user.mealId = ?
                    `
                                connection.query(
                                    selectParticipantQuery,
                                    [mealId, userId],
                                    (error, participantResults) => {
                                        connection.release()
                                        if (error) {
                                            logger.error(error)
                                            return callback(error, null)
                                        }

                                        if (participantResults.length === 0) {
                                            return callback(
                                                {
                                                    status: 404,
                                                    message:
                                                        'Deelname niet gevonden.'
                                                },
                                                null
                                            )
                                        }
                                        //Format meal_participant
                                        // Meal indelen
                                        const meal = {
                                            id: mealId,
                                            name: participantResults[0].mealName,
                                            description: participantResults[0].mealDescription,
                                        };
                
                                        // Alle deelnemers mappen
                                        const participants = participantResults.map((row) => ({
                                            userId: row.userId,
                                            firstName: row.participantFirstName,
                                            lastName: row.participantLastName,
                                            emailAdress: row.participantEmailAdress,
                                            phoneNumber: row.participantPhoneNumber,
                                        }));
                
                                        // Samenvoegen in format
                                        const response_meal_participants = {
                                            meal: meal,
                                            participants: participants,
                                        };
                                        logger.debug(participantResults)
                                        callback(null, {
                                            status: 200,
                                            message:
                                                'Nieuwe deelname toegevoegd.',
                                            data: response_meal_participants
                                        })
                                    }
                                )
                            }
                        )
                    }
                )
            })
        })
    }
}

module.exports = mealService
