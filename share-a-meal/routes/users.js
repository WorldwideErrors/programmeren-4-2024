var express = require('express');
var router = express.Router();

const userController = require('../controllers/user.controller');

// UC-201 Registreren als nieuwe user
router.post('/', userController.createUser);

// UC-202 Opvragen van overzicht van users
router.get('/', userController.getAllUsers);

// UC-203 Haal het userprofile op van de user die ingelogd is
/*router.get(
  '/profile',
  authController.validateToken,
  authController.validateLogin,
  // userController.getUserProfile
);*/

// UC-204 Opvragen van usergegevens bij ID
router.get('/:id', userController.getUserByID);

// UC-205 Wijzigen van usergegevens
router.put('/:userId', userController.editUser)

// UC-206 Verwijderen van een user
router.delete('/:userId', userController.deleteUser);

module.exports = router;
