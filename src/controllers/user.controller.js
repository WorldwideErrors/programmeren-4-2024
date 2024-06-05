const userService = require('../services/user.service')
const logger = require('../util/logger')

let userController = {
    // UC-201 Registreren van nieuwe user
    create: (req, res, next) => {
        const user = req.body;
        logger.info('create user', user.firstName, user.lastName);

        userService.create(user, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    // UC-202 Opvragen van alle users
    getAll: (req, res, next) => {
        logger.trace('getAll');

        // Filters vullen met link parameters
        const filters = {
            firstName: req.query.firstName,
            lastName: req.query.lastName
        }

        // Undefined? Filter verwijderen uit de lijst
        Object.keys(filters).forEach(
            (key) => filters[key] === undefined && delete filters[key]
        )

        userService.getAll(filters, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    // UC-203 Opvragen van gebruiksprofiel
    getProfile: (req, res, next) => {
        const userId = req.userId
        logger.trace('getProfile for userId', userId)

        userService.getProfile(userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: 200,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    // UC-204 Opvragen van usergegevens bij ID
    getUserById: (req, res, next) => {
        const userId = req.params.userId
        const userToken = req.userId
        logger.trace('userController: getById', userId)

        userService.getUserById(userId, userToken, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(200).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },

    // UC-205 Wijzigen van usergegevens
    update: (req, res, next) => {
        const user = req.body;
        const currentUserId = req.userId
        const updateUserId = req.params.userId

        logger.trace('update userId', updateUserId)
        if (updateUserId == currentUserId) {
            userService.update(user, updateUserId, (error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }
                if (success) {
                    res.status(200).json({
                        status: 200,
                        message: success.message,
                        data: success.data
                    })
                }
            })
        } else {
            return next({
                status: 403,
                message: 'Not Authorized'
            })
        }
    },

    // UC-206 Verwijderen van user
    delete: (req, res, next) => {
        const currentUserId = req.userId
        const deleteUserId = req.params.userId

        logger.trace('delete userId', deleteUserId)
        if (deleteUserId == currentUserId) {
            userService.delete(deleteUserId, (error, success) => {
                if (error) {
                    return next({
                        status: error.status,
                        message: error.message,
                        data: {}
                    })
                }
                if (success) {
                    res.status(200).json({
                        status: 200,
                        message: success.message,
                        data: success.data
                    })
                }
            })
        } else {
            return next({
                status: 403,
                message: 'Not Authorized'
            })
        }
    }
}

module.exports = userController
