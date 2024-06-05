process.env.DB_DATABASE = process.env.DB_DATABASE
process.env.LOGLEVEL = 'trace'

const chai = require('chai')
const chaiHttp = require('chai-http')

const db = require('../src/dao/mysql-db')
const server = require('../index')
const tracer = require('tracer')

const logger = require('../src/util/logger')
const jwtSecretKey = require('../src/util/config').secretkey
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

const INSERT_MEAL =
    'INSERT INTO `meal` (`id`, `isActive`, `isVega`, `isVegan`, `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`, `price`, `imageUrl`, `cookId`, `name`, `description`) VALUES' +
    '(1, 1, 0, 0, 0, "2022-04-13 11:24:46", 5, 6.30, "https://www.google.com/url?sa=i&url=https%3A%2F%2Fveneto.ro%2Fproduct%2Fpizza-tonno-e-cipolla-41cm%2F&psig=AOvVaw2E05JDhyUVJ6D0S8g1eEuQ&ust=1717698585809000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCPDx94KMxYYDFQAAAAAdAAAAABAJ", 1, "Pizza Tonno", "De lekkerste pizza van Rome!"),' +
    '(2, 0, 1, 0, 1, "2022-05-11 16:34:12", 5, 7.10, "https://www.google.com/url?sa=i&url=https%3A%2F%2Fnl.pngtree.com%2Ffreebackground%2Fcaesar-salad-bowl-on-black-background_2611852.html&psig=AOvVaw02qBBW8DcBnBY26miA9gW6&ust=1717698609096000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKj33I2MxYYDFQAAAAAdAAAAABAE", 3, "Caesar Salad", "Een feestelijke groene maaltijd."),' +
    '(3, 1, 0, 0, 1, "2023-04-21 18:47:37", 5, 9.50, "https://www.google.com/url?sa=i&url=https%3A%2F%2Fstock.adobe.com%2Fnl%2Fsearch%3Fk%3Dburger%2Bpng&psig=AOvVaw2JpjV8jaESBJSpBi3TJ7i-&ust=1717698626497000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJiB_pSMxYYDFQAAAAAdAAAAABAE", 2, "Hamburger", "Heb jij ook zin in een heerlijke hamburger met friet?");'


const endpointToTest = '/api/meal'

function generateToken(payload, secret, options) {
    const jwt = require('jsonwebtoken')
    return jwt.sign(payload, secret, options)
}

describe('UC-303 Opvragen van alle maaltijd', () => {
    beforeEach((done) => {
        logger.debug('beforeEach called')
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        db.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEAL,
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

    it('TC-303-1 Lijst van maaltijden geretourneerd', (done) => {
        const token = generateToken({ userId: 151 }, jwtSecretKey, {
            expiresIn: '1h'
        })

        chai.request(server)
            .get(endpointToTest)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                chai.expect(res).to.have.status(200)
                chai.expect(res.body).to.be.a('object')
                chai.expect(res.body).to.have.property('status').equals(200)
                chai.expect(res.body)
                    .to.have.property('message')
                    .equals('3 maaltijden gevonden.')
                chai
                    .expect(res.body)
                    .to.have.property('data')
                    .that.is.a('array').that.is.not.empty
                chai.expect(res.body.data.length).to.equal(3)
                done()
            })
    })
})