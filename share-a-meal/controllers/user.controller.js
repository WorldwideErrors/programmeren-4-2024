const database = require("../dao/inmem-db");
const assert = require("assert");
var logger = require("tracer").console();

// const pool = require('../util/mysql-db');
// const jwt = require('jsonwebtoken');

let userController = {
  create: (req, res, next) => {
    const user = req.body;
    logger.info("create user", user.firstName, user.lastName);
    userService.create(user, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: success.status,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  getAll: (req, res, next) => {
    logger.trace("getAll");
    userService.getAll((error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: 200,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  getById: (req, res, next) => {
    const userId = req.params.userId;
    logger.trace("userController: getById", userId);
    userService.getById(userId, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: success.status,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  getProfile: (req, res, next) => {
    const userId = req.userId;
    logger.trace("getProfile for userId", userId);
    userService.getProfile(userId, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: 200,
          message: success.message,
          data: success.data,
        });
      }
    });
  },

  deleteUser: (req, res, next) => {
    let id = req.params.id;
    let userId = req.userId;
    logger.info("Deleting user with id: ", id);
    userService.deleteUser(userId, (error, success) => {
      if (error) {
        return next({
          status: error.status,
          message: error.message,
          data: {},
        });
      }
      if (success) {
        res.status(200).json({
          status: 200,
          message: success.message,
          data: success.data,
        });
      }
    });
  },
};

module.exports = userController;
