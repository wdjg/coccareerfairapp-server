import express from 'express'
import jwt from 'express-jwt'

var router = express.Router();
var auth = jwt({
    secret: process.env.SECRET,
    userProperty: 'user'
});

import authController from '../controllers/authentication'
import userController from '../controllers/users'
import lineController from '../controllers/lines'
import employerController from '../controllers/employers'

// authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// users
router.get('/users', auth, userController.getUserByAuthUser);
router.get('/users/:id', auth, userController.getUserById);

// lines
router.get('/lines', auth, lineController.getLineByAuthUser);
router.get('/lines/:id', auth, lineController.getLineById);
router.post('/lines', auth, lineController.createLine);
router.put('/lines/:id', auth, lineController.updateLine);
router.delete('/lines/:id', auth, lineController.deleteLine);

// employers
router.get('/employers', auth, employerController.getEmployerBySearch);
router.get('/employers/:id', auth, employerController.getEmployerById);
router.post('/employers', auth, employerController.createEmployer);
router.put('/employers/:id', auth, employerController.updateEmployer);
router.delete('/employers/:id', auth, employerController.deleteEmployer);

module.exports = router;
