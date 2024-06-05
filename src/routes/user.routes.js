const express = require('express')
const assert = require('assert')
const chai = require('chai')
chai.should()
const router = express.Router()
const userController = require('../controllers/user.controller')
const validateToken = require('./authentication.routes').validateToken
const logger = require('../util/logger')

const validateUserCreate = (req, res, next) => {
    try {
        // Firstname Validation
        assert(req.body.firstName, 'Missing or incorrect firstName field')
        chai.expect(req.body.firstName).to.not.be.empty
        chai.expect(req.body.firstName).to.be.a('string')
        chai.expect(req.body.firstName).to.match(
            /^[a-zA-Z]+$/,
            'FirstName must be a string'
        )

        // Lastname Validation
        assert(req.body.lastName, 'Missing or incorrect lastName field')
        chai.expect(req.body.lastName).to.not.be.empty
        chai.expect(req.body.lastName).to.be.a('string')
        chai.expect(req.body.lastName).to.match(
            /^[a-zA-Z]+$/,
            'LastName must be a string'
        )

        // Email Validation
        const { firstName, lastName } = req.body
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        chai.expect(req.body.emailAdress).to.not.be.empty
        chai.expect(req.body.emailAdress).to.be.a('string')
        // Construct the dynamic email regex
        const emailRegex = new RegExp(
            `^${firstName[0]}\.${lastName}@[a-zA-Z]{2,}\.[a-zA-Z]{2,3}$`,
            'i'
        )

        chai.expect(req.body.emailAdress).to.match(
            emailRegex,
            'Email must be in the format n.lastname@domain.com, where n is the first letter of the first name and lastname is the full last name'
        )

        // Password Validation
        assert(req.body.password, 'Missing or incorrect password field')
        chai.expect(req.body.password).to.not.be.empty
        chai.expect(req.body.password).to.be.a('string')
        chai.expect(req.body.password).to.match(
            /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
            'Password must be at least 8 characters long, contain at least one uppercase letter, and one digit'
        )

        // Street Validation
        assert(req.body.street, 'Missing or incorrect street field')
        chai.expect(req.body.street).to.not.be.empty
        chai.expect(req.body.street).to.be.a('string')
        chai.expect(req.body.street).to.match(
            /^[a-zA-Z]+\s\d+$/,
            'Street must be in format [streetname] [housenumber]'
        )

        // City Validation
        assert(req.body.city, 'Missing or incorrect city field')
        chai.expect(req.body.city).to.not.be.empty
        chai.expect(req.body.city).to.be.a('string')
        chai.expect(req.body.city).to.match(
            /^[a-zA-Z]+$/,
            'City must be a string'
        )

        // Phonenumber Validation
        assert(req.body.phoneNumber, 'Missing or incorrect phoneNumber field')
        chai.expect(req.body.phoneNumber).to.not.be.empty
        chai.expect(req.body.phoneNumber).to.be.a('string')
        chai.expect(req.body.phoneNumber).to.match(
            /^06[- ]?\d{8}$/,
            'Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678'
        )

        logger.trace('User successfully validated')
        next()
    } catch (ex) {
        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

const validateUserUpdate = (req, res, next) => {
    logger.info('Reached ValidateUserUpdate')
    try {
        // Email validations
        assert(req.body.emailAdress, 'Missing or incorrect emailAdress field')
        chai.expect(req.body.emailAdress).to.not.be.empty
        chai.expect(req.body.emailAdress).to.be.a('string')

        // phoneNumber validation
        if (req.body.phoneNumber) {
            chai.expect(req.body.phoneNumber).to.be.a('string')
            chai.expect(req.body.phoneNumber).to.match(
                /^06[- ]?\d{8}$/,
                'Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678'
            )
        }
        next()
    } catch (ex) {
        logger.info('Fail')

        logger.trace('User validation failed:', ex.message)
        next({
            status: 400,
            message: ex.message,
            data: {}
        })
    }
}

// Userroutes
// UC-201 Registreren als nieuwe user
router.post('/api/user', validateUserCreate, userController.create)

// UC-202 Opvragen van overzicht van users
router.get('/api/user', userController.getAll)

// UC-203 Opvragen van een gebruikersprofiel
router.get('/api/user/profile', validateToken, userController.getProfile)

// UC-204 Opvragen van usergegevens bij ID
router.get('/api/user/:userId', validateToken, userController.getUserById)

// UC-205 Wijzigen van usergegevens
router.put(
    '/api/user/:userId',
    validateToken,
    validateUserUpdate,
    userController.update
)

// UC-206 Verwijderen van user
router.delete('/api/user/:userId', validateToken, userController.delete)

module.exports = router
