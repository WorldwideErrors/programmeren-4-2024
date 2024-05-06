process.env['DB_DATABASE'] = process.env.DB_DATABASE || 'shareameal-testdb';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
const assert = require('assert');
const dbconnection = require('../../src/util/mysql-db');
const jwt = require('jsonwebtoken');
const { jwtSecretKey, logger } = require('../../src/util/utils');
require('tracer').setLevel('trace');

chai.should();
chai.use(chaiHttp);

/**
 * Db queries to clear and fill the test database before each test.
 *
 * LET OP: om via de mysql2 package meerdere queries in één keer uit te kunnen voeren,
 * moet je de optie 'multipleStatements: true' in de database config hebben staan.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;';
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;';
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;';
const CLEAR_DB =
  CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE;

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
  'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
  '(1, "first", "last", "name@server.nl", "secret", "street", "city");';

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
  'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
  "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
  "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);";

describe('Users API', () => {
  //
  // informatie over before, after, beforeEach, afterEach:
  // https://mochajs.org/#hooks
  //
  before((done) => {
    logger.trace(
      'before: hier zorg je eventueel dat de precondities correct zijn'
    );
    logger.trace('before done');
    done();
  });

  describe('UC-xyz [usecase beschrijving]', () => {
    //
    beforeEach((done) => {
      logger.trace('beforeEach called');
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) {
          done(err);
          throw err; // no connection
        }
        // Use the connection
        connection.query(
          CLEAR_DB + INSERT_USER,
          function (error, results, fields) {
            if (error) {
              done(error);
              throw error; // not connected!
            }
            logger.trace('beforeEach done');
            // When done with the connection, release it.
            dbconnection.releaseConnection(connection);
            // Let op dat je done() pas aanroept als de query callback eindigt!
            done();
          }
        );
      });
    });

    it.skip('TC-201-1 Voorbeeld testcase, met POST, wordt nu geskipped', (done) => {
      chai
        .request(server)
        .post('/api/movie')
        .send({
          // name is missing
          year: 1234,
          studio: 'pixar'
        })
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an('object');

          res.body.should.be.an('object').that.has.all.keys('code', 'message');
          code.should.be.an('number');
          message.should.be.a('string').that.contains('error');
          done();
        });
    });

    it('TC-201-2 [naam van de test verder zelf aanvullen]', (done) => {
      // Zelf verder aanvullen
      done();
    });

    // En hier komen meer testcases
  });

  describe('UC-203 Opvragen van gebruikersprofiel', () => {
    //
    beforeEach((done) => {
      logger.trace('beforeEach called');
      // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) {
          done(err);
          throw err; // no connection
        }
        // Use the connection
        connection.query(
          CLEAR_DB + INSERT_USER,
          function (error, results, fields) {
            if (error) {
              done(error);
              throw error; // not connected!
            }
            logger.trace('beforeEach done');
            // When done with the connection, release it.
            dbconnection.releaseConnection(connection);
            // Let op dat je done() pas aanroept als de query callback eindigt!
            done();
          }
        );
      });
    });

    it.skip('TC-203-1 Ongeldig token', (done) => {
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer hier-staat-een-ongeldig-token')
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(401);
          res.should.be.an('object');

          res.body.should.be
            .an('object')
            .that.has.all.keys('code', 'message', 'data');
          let { code, message, data } = res.body;
          code.should.be.an('number');
          message.should.be.a('string').equal('Not authorized');
          done();
        });
    });

    it.skip('TC-203-2 Gebruiker ingelogd met geldig token', (done) => {
      // Gebruiker met id = 1 is toegevoegd in de testdatabase. We zouden nu
      // in deze testcase succesvol het profiel van die gebruiker moeten vinden
      // als we een valide token meesturen.
      chai
        .request(server)
        .get('/api/user/profile')
        .set('authorization', 'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);
          res.should.have.status(200);
          res.should.be.an('object');

          res.body.should.be
            .an('object')
            .that.has.all.keys('code', 'message', 'data');
          let { code, message, data } = res.body;
          code.should.be.an('number');
          message.should.be.a('string').that.contains('Get User profile');
          data.should.be.an('object');
          data.id.should.equal(1);
          data.firstName.should.equal('first');
          // Zelf de overige validaties aanvullen!
          done();
        });
    });
  });

  describe('UC-303 Lijst van maaltijden opvragen', () => {
    //
    beforeEach((done) => {
      logger.debug('beforeEach called');
      // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
      dbconnection.getConnection(function (err, connection) {
        if (err) {
          done(err);
          throw err; // not connected!
        }
        connection.query(
          CLEAR_DB + INSERT_USER + INSERT_MEALS,
          function (error, results, fields) {
            // When done with the connection, release it.
            dbconnection.releaseConnection(connection);
            // Handle error after the release.
            if (err) {
              done(err);
              throw err;
            }
            // Let op dat je done() pas aanroept als de query callback eindigt!
            logger.debug('beforeEach done');
            done();
          }
        );
      });
    });

    it.skip('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
      chai
        .request(server)
        .get('/api/meal')
        // wanneer je authenticatie gebruikt kun je hier een token meesturen
        // .set('authorization', 'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey))
        .end((err, res) => {
          assert.ifError(err);

          res.should.have.status(200);
          res.should.be.an('object');

          res.body.should.be
            .an('object')
            .that.has.all.keys('message', 'data', 'code');

          const { code, data } = res.body;
          code.should.be.an('number');
          data.should.be.an('array').that.has.length(2);
          data[0].name.should.equal('Meal A');
          data[0].id.should.equal(1);
          done();
        });
    });
    // En hier komen meer testcases
  });
});
