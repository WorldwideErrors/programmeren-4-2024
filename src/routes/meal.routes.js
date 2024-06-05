const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')

const validateMealCreate = (req, res, next) => {
    try {
        // name, description, price, dateTime, maxAmountOfParticipants en imageUrl verplichte inputvelde
        // Name Validation
        assert(req.body.name, 'Missing or incorrect name field')
        chai.expect(req.body.name).to.not.be.empty
        chai.expect(req.body.name).to.be.a('string')

        // Description Validation
        assert(req.body.description, 'Missing or incorrect description field')
        chai.expect(req.body.description).to.not.be.empty
        chai.expect(req.body.description).to.be.a('string')

        // Price Validation
        assert(req.body.price, 'Missing or incorrect price field')
        chai.expect(req.body.price).to.be.an('number')

        // maxAmountOfParticipants Validation
        assert(req.body.maxAmountOfParticipants, 'Missing or incorrect maxAmountOfParticipant field')
        chai.expect(req.body.maxAmountOfParticipants).to.be.an('number')

        // Image Validation
        assert(req.body.imageUrl, 'Missing or incorrect image field')
        chai.expect(req.body.imageUrl).to.not.be.empty
        chai.expect(req.body.imageUrl).to.be.a('string')
        chai.expect(req.body.imageUrl.startsWith('https://')).to.be.true;

        // DateTime Validation
        assert(req.body.dateTime, 'Missing or incorrect dateTime field');

        logger.trace('Meal successfully validated')
        next()
    } catch (ex) {
        logger.trace('Meal validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateMealUpdate = (req, res, next) => {
    try {
        // Name Validation
        assert(req.body.name, 'Missing or incorrect name field')
        chai.expect(req.body.name).to.not.be.empty
        chai.expect(req.body.name).to.be.a('string')

        // Price validation
        assert(req.body.price, 'Missing or incorrect price field')
        chai.expect(req.body.price).to.be.an('number')
        
        // maxAmountOfParticipants Validation
        assert(req.body.maxAmountOfParticipants, 'Missing or incorrect maxAmountOfParticipant field')
        chai.expect(req.body.maxAmountOfParticipants).to.be.an('number')

        logger.trace('Meal successfully validated')
        next()
    } catch (ex) {
        logger.trace('Meal validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Mealroutes
// UC-301 Toevoegen van Maaltijd
router.post('/api/meal', validateToken, validateMealCreate, mealController.create);

// UC-302 Wijzigen van maaltijdgegevens
router.put('/api/meal/:mealId', validateToken, validateMealUpdate, mealController.update)

// UC-303 Opvragen van alle maaltijden
router.get('/api/meal', mealController.getAll);

// UC-304 Opvragen van maaltijd bij ID
router.get('/api/meal/:mealId', mealController.getMealById);

// UC-305 Verwijderen van maaltijd
router.delete('/api/meal/:mealId', validateToken, mealController.delete);

// UC-401 Aanmelden voor maaltijd
router.post('/api/meal/:mealId/participate', validateToken, mealController.participate);

module.exports = router
