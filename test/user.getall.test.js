process.env.DB_DATABASE = process.env.DB_DATABASE
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')

const db = require('../src/dao/mysql-db')
const server = require('../index')
const tracer = require('tracer')

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

describe('UC-202 Opvragen van overzicht van users', () => {
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

    it('TC-202-1 Toon alle gebruikers (minimaal 2)', (done) => {
        chai.request(server)
            .get(endpointToTest)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('3 gebruikers gevonden.')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('array').that.is.not.empty
                chai.expect(res.body.data.length).to.equal(3)
                done()
            })
    })

    it('TC-202-2 Toon gebruikers met zoekterm op niet-bestaande velden', (done) => {
        chai.request(server)
        .get(endpointToTest + '?onbestaandVeld=value1')
        .end((err, res) => {
            chai.expect(res).to.have.status(200)
            chai.expect(res.body).to.be.a('object')
            chai.expect(res.body).to.have.property('status').equals(200)
            chai.expect(res.body)
                .to.have.property('message')
                .equals('3 gebruikers gevonden.')
            chai
                .expect(res.body)
                .to.have.property('data')
                .that.is.a('array').that.is.not.empty
            chai.expect(res.body.data.length).to.equal(3)
            done()
        })
    })

    it('TC-202-3 Toon gebruikers met gebruik op de zoekterm op het veld isActive=false', (done) => {
        chai.request(server)
        .get(endpointToTest + '?isActive=false')
        .end((err, res) => {
            chai.expect(res).to.have.status(200)
            chai.expect(res.body).to.be.a('object')
            chai.expect(res.body).to.have.property('status').equals(200)
            chai.expect(res.body)
                .to.have.property('message')
                .equals('3 gebruikers gevonden.')
            chai
                .expect(res.body)
                .to.have.property('data')
                .that.is.a('array').that.is.not.empty
            chai.expect(res.body.data.length).to.equal(3)
            done()
        })
    })

    it('TC-202-4 Toon gebruikers met gebruik op de zoekterm op het veld isActive=true', (done) => {
        chai.request(server)
        .get(endpointToTest + '?isActive=true')
        .end((err, res) => {
            chai.expect(res).to.have.status(200)
            chai.expect(res.body).to.be.a('object')
            chai.expect(res.body).to.have.property('status').equals(200)
            chai.expect(res.body)
                .to.have.property('message')
                .equals('3 gebruikers gevonden.')
            chai
                .expect(res.body)
                .to.have.property('data')
                .that.is.a('array').that.is.not.empty
            chai.expect(res.body.data.length).to.equal(3)
            done()
        })
    })

    it('TC-202-5 Toon gebruikers met zoekterm op bestaande velden (max op 2 velden filteren)', (done) => {
        chai.request(server)
        .get(endpointToTest + '?firstName=bob&lastName=green')
        .end((err, res) => {
            chai.expect(res).to.have.status(200)
            chai.expect(res.body).to.be.a('object')
            chai.expect(res.body).to.have.property('status').equals(200)
            chai.expect(res.body)
                .to.have.property('message')
                .equals('1 gebruikers gevonden.')
            chai
                .expect(res.body)
                .to.have.property('data')
                .that.is.a('array').that.is.not.empty
            chai.expect(res.body.data.length).to.equal(1)
            done()
        })
    })
})