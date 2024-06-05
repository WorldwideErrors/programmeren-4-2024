const mealService = require('../services/meal.service')
const logger = require('../util/logger')

let mealController = {
    // UC-301 Toevoegen van maaltijd
    create: (req, res, next) => {
        const meal = req.body;
        const userId = req.userId;
        logger.info('create meal ', meal.name);

        mealService.create(meal, userId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                res.status(201).json({
                    status: success.status,
                    message: success.message,
                    data: success.data
                })
            }
        })
    },
    // UC-302 Wijzigen van maaltijdgegevens
    update: (req, res, next) => {
        const meal = req.body;
        const currentUserId = req.userId
        const updateMealId = req.params.mealId

        logger.trace('update mealId', updateMealId)
        mealService.getSpecificMeal(updateMealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                let foundMeal = success.data[0]
                
                // Als ID van user gelijk is aan degene van de cook, wijzig het maar.
                if (currentUserId === foundMeal.cook.id) {
                    
                    logger.trace('update mealId', updateMealId)
                    mealService.update(meal, updateMealId, (error, success) => {
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
                }
                else {
                    return next({
                        status: 403,
                        message: "Not Authorized"
                    })
                }
            }
        })
    },

    // UC-303 Ophalen van alle maaltijden
    getAll: (req, res, next) => {
        logger.trace('getAll')
        mealService.getAll((error, success) => {
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

    // Opvragen van maaltijd bij ID
    getMealById: (req, res, next) => {
        const mealId = req.params.mealId
        logger.trace('mealController: getById', mealId)
        mealService.getSpecificMeal(mealId, (error, success) => {
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
    
    // Verwijderen van Maaltijd
    delete: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId

        // Ophalen meal voor vergelijken van IDs
        mealService.getSpecificMeal(mealId, (error, success) => {
            if (error) {
                return next({
                    status: error.status,
                    message: error.message,
                    data: {}
                })
            }
            if (success) {
                let foundMeal = success.data[0]
                
                // Als ID van user gelijk is aan degene van de cook, verwijder het maar.
                if (userId === foundMeal.cook.id) {
                    
                    logger.trace('delete mealId', mealId)
                    mealService.delete(mealId, (error, success) => {
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
                }
                else {
                    return next({
                        status: 403,
                        message: "Not Authorized"
                    })
                }
            }
        })
    },
    // UC-401 Aanmelden voor maaltijd
    participate: (req, res, next) => {
        const mealId = req.params.mealId
        const userId = req.userId;

        logger.info('participate in meal ', mealId);

        mealService.participate(mealId, userId, (error, success) => {
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
    }
}

module.exports = mealController