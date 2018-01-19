var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'user'
});

// var ctrlProfile = require('../controllers/profile');
var authController = require('../controllers/authentication');
var userController = require('../controllers/users');
var lineController = require('../controllers/lines');
var employerController = require('../controllers/employers');

// profile
// router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// users
router.get('/users', auth, userController.getUserByAuthUser)
router.get('/users/:id', auth, userController.getUserById)

// lines
router.get('/lines', auth, lineController.getLineByAuthUser)
router.get('/lines/:id', auth, lineController.getLineById)
router.post('/lines', auth, lineController.createLine)
router.put('/lines/:id', auth, lineController.updateLine)
router.delete('/lines/:id', auth, lineController.deleteLine)

// employers
router.get('/employers', auth, employerController.getEmployerBySearch)
router.get('/employers/:id', auth, employerController.getEmployerById)
router.post('/employers', auth, employerController.createEmployer)
router.put('/employers/:id', auth, employerController.updateEmployer)
router.delete('/employers/:id', auth, employerController.deleteEmployer)

module.exports = router;
