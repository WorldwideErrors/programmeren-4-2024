const database = require("../dao/inmem-db");
const logger = require("../util/logger");

const db = require("../dao/mysql-db");

const userService = {
  create: (user, callback) => {
    logger.info("create user", user);
    database.add(user, (err, data) => {
      if (err) {
        logger.info("error creating user: ", err.message || "unknown error");
        callback(err, null);
      } else {
        logger.trace(`User created with id ${data.id}.`);
        callback(null, {
          message: `User created with id ${data.id}.`,
          data: data,
        });
      }
    });
  },

  getAll: (callback) => {
    logger.info("getAll");

    // Deprecated: de 'oude' manier van werken, met de inmemory database
    // database.getAll((err, data) => {
    //     if (err) {
    //         callback(err, null)
    //     } else {
    //         callback(null, {
    //             message: `Found ${data.length} users.`,
    //             data: data
    //         })
    //     }
    // })

    // Nieuwe manier van werken: met de MySQL database
    db.getConnection(function (err, connection) {
      if (err) {
        logger.error(err);
        callback(err, null);
        return;
      }

      connection.query(
        "SELECT id, firstName, lastName FROM `user`",
        function (error, results, fields) {
          connection.release();

          if (error) {
            logger.error(error);
            callback(error, null);
          } else {
            logger.debug(results);
            callback(null, {
              message: `Found ${results.length} users.`,
              data: results,
            });
          }
        }
      );
    });
  },

  deleteUser: (userId, callback) => {
    logger.info("delete");
    database.getConnection(function (err, connection) {
      if (err) throw err;

      connection.query(
        "SELECT * FROM user WHERE id = ?",
        [id],
        function (error, results, fields) {
          if (error) throw error;

          if (results.length > 0) {
            if (userId == id) {
              connection.query(
                `DELETE FROM user WHERE id = ?; SELECT * FROM user;`,
                [id],
                function (error, results, fields) {
                  if (error) throw error;

                  if (results[0].affectedRows > 0) {
                    res.status(200).json({
                      status: 200,
                      result: results[1],
                    });
                  }
                }
              );
            } else {
              const error = {
                status: 403,
                message: "Logged in user is not allowed to delete this user.",
              };
              next(error);
            }
          } else {
            const error = {
              status: 400,
              message: "User not found",
            };
            next(error);
          }
        }
      );
    });
  },

  getProfile: (userId, callback) => {
    logger.info("getProfile userId:", userId);

    db.getConnection(function (err, connection) {
      if (err) {
        logger.error(err);
        callback(err, null);
        return;
      }

      connection.query(
        "SELECT id, firstName, lastName FROM `user` WHERE id = ?",
        [userId],
        function (error, results, fields) {
          connection.release();

          if (error) {
            logger.error(error);
            callback(error, null);
          } else {
            logger.debug(results);
            callback(null, {
              message: `Found ${results.length} user.`,
              data: results,
            });
          }
        }
      );
    });
  },
};

module.exports = userService;
