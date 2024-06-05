//
// Authentication controller
//
const jwt = require('jsonwebtoken')
const db = require('../dao/mysql-db')
// const validateEmail = require('../util/emailvalidator')
const logger = require('../util/logger')
const jwtSecretKey = require('../util/config').secretkey

const authController = {
    login: (userCredentials, callback) => {
        logger.info('login');

        db.getConnection((err, connection) => {
            if (err) {
                logger.error(err);
                callback(err.message, null);
                return;
            }
            if (connection) {
                connection.query(
                    'SELECT `id`, `emailAdress`, `password`, `firstName`, `lastName` FROM `user` WHERE `emailAdress` = ?',
                    [userCredentials.emailAdress],
                    (err, rows) => {
                        connection.release();
                        if (err) {
                            logger.error('Error: ', err.toString());
                            callback(err.message, null);
                            return;
                        }
                        if (rows.length === 1 && rows[0].password == userCredentials.password) {
                            logger.debug('passwords DID match, sending userinfo and valid token');
                            const { password, ...userinfo } = rows[0];
                            const payload = { userId: userinfo.id };

                            jwt.sign(payload, jwtSecretKey, { expiresIn: '12d' }, (err, token) => {
                                if (err) {
                                    callback(err.message, null);
                                    return;
                                }
                                logger.info('User logged in, sending: ', userinfo);
                                callback(null, {
                                    status: 200,
                                    message: 'User logged in',
                                    data: { ...userinfo, token }
                                });
                            });
                        } else {
                            logger.debug('User not found or password invalid');
                            callback({
                                status: 400,
                                message: 'User not found or password invalid',
                                data: {}
                            }, null);
                        }
                    }
                );
            }
        });
    }
}

module.exports = authController
