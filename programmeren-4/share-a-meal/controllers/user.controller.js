const database = require('../dtb/inmem-db');
const assert = require('assert');
var logger = require('tracer').console();
// const pool = require('../util/mysql-db');
// const jwt = require('jsonwebtoken');

const userController = {
  getAllUsers: (req, res, next) => {
    logger.info('Get all users');
    
    database.getAll((err, data) => {
        if (err) {
            console.error(err);
        } else {
            console.log(data);
        }
    });
  },

  getUserByID: (req, res, next) => {
    req.userId = 1;
    logger.trace('Get user profile for user', req.userId);
    
    database.getById(req.userId, (err, data) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log(data);
        }
    });
  },

  createUser: (req, res, next) => {
    logger.info('Register user');

    database.add(
        {
            firstName: "Abdi",
            lastName: "Nageeye",
            emailAdress: "a.nageeye@server.com",
        },
        (err, data) => {
            if (err) {
                console.error(err);
            } else {
                console.log(data);
            }
        }
    );
  },

  deleteUser: (req, res) => {
    const idToDelete = 1; 
    logger.info('Deleting user with ID: ' + idToDelete);

    database.delete(idToDelete, (err, deletedUser) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Deleted user:', deletedUser);
        }
    });
  },

  editUser: (req, res) => {
    const userId = 1; // Id of the user to be edited
    const newData = {
        firstName: "Bob",
        lastName: "Green",
        emailAdress: "bob.green@example.com",
    };

    logger.info('Editing user with id:', userId);

    database.edit(userId, newData, (err, editedUser) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Edited user:', editedUser);
        }
    });
  }
};

module.exports = userController;
