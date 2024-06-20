process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal'
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')

const db = require('../src/dao/mysql-db')
const server = require('../index')
const tracer = require('tracer')
const jwtSecretKey = require('../src/util/config').secretkey
const logger = require('../src/util/logger')

chai.should()
chai.use(chaiHttp)
tracer.setLevel('warn')

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city`, `phoneNumber` ) VALUES' +
    "(1, 'bob', 'green', 'b.green@server.nl', 'Secret12345', 'lovensdijkstraat 12', 'breda', '0612345678')," +
    "(2, 'Elsa', 'Crown', 'e.crown@gmail.com', 'Secret12345', 'Torenvalk 23', 'oosterhout', '0624145678')," +
    "(3, 'Timo', 'Wilkens', 't.wilkens@msn.com', 'Secret12345', 'Brugweg 55', 'breda', '0649651334');"

const endpointToTest = '/api/user'

function generateToken(payload, secret, options) {
    const jwt = require('jsonwebtoken')
    return jwt.sign(payload, secret, options)
}

describe('UC-205 Updaten van usergegevens', () => {
    beforeEach((done) => {
        logger.debug('beforeEach called')
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        db.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error
                    // Let op dat je done() pas aanroept als de query callback eindigt!
                    logger.debug('beforeEach done')
                    done()
                }
            )
        })
    })

    it('TC-205-1 Verplicht veld “emailAddress” ontbreekt', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Voornaam',
                lastName: 'Achternaam',
                // emailAdress: 'v.a@server.nl', emailAdress ontbreekt
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Missing or incorrect emailAdress field')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-2 De gebruiker is niet de eigenaar van de data', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/3')
            .set('Authorization', `Bearer ${token}`)
            .send({
                firstName: 'Thea',
                lastName: 'Wilkens',
                emailAdress: 't.wilkens@msn.com'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(403)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(403)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Not Authorized')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer (Meer dan 10 tekens)', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '06 123456789'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .contains('Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer (Minder dan 10 tekens)', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '06 1234567'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .contains('Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer (Begint niet met 06)', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '0512345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .contains('Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-3 Niet-valide telefoonnummer (Spatie extra tussen de cijfers)', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '06  12345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(400)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(400)
                chai.expect(res.body)
                    .to.have.property('message')
                    .contains('Phonenumber must be in the format 06-12345678, 06 12345678, or 0612345678')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-4 Gebruiker bestaat niet', (done) => {
        const token = generateToken({ userId: 115 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/115')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '06 12345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(404)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(404)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Gebruiker niet gevonden.')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-5 Niet ingelogd', (done) => {
        chai.request(server)
            .put(endpointToTest + '/1')
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '06 12345678'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(401)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(401)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Authorization header missing!')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('object').that.is.empty
                done()
            })
    })

    it('TC-205-6 Gebruiker succesvol gewijzigd', (done) => {
        const token = generateToken({ userId: 1 }, jwtSecretKey, {
            expiresIn: '1h'
        })
        
        chai.request(server)
            .put(endpointToTest + '/1')
            .set('Authorization', `Bearer ${token}`)
            .send({
                emailAdress: 'b.green@server.nl',
                phoneNumber: '0612345678',
                firstName: 'Bobby'
            })
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('Gebruiker met ID 1 is aangepast.')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('array').that.is.not.empty
                done()
            })
    })
})