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
import lineEventsController from '../controllers/lineEvents'
import employerController from '../controllers/employers'
import qrController from '../controllers/qrCodeValues'

// authentication
router.post('/register', authController.register);
router.post('/login', authController.login);

// users
router.get('/users', auth, userController.getUsers);
router.get('/users/auth', auth, userController.getUserByAuthUser);
router.patch('/users/auth/profile', auth, userController.patchProfileByAuthUser);
router.get('/users/:id', auth, userController.getUserById);
router.get('/users/auth/favorites', auth, userController.getFavoritesByAuthUser);
router.patch('/users/auth/favorites', auth, userController.patchFavoritesByAuthUser);

// lines
router.get('/lines/auth', auth, lineController.getLineByAuthUser);
router.get('/lines/auth/stats', auth, lineController.getStatsByEmployerId);
router.get('/lines/stats', lineController.getStatsByEmployerIdNoAuth); // UNAUTHENTICATED
router.get('/lines/users', auth, lineController.getUsersByEmployerId); // get inline users for company
router.get('/lines/:id', auth, lineController.getLineById);
router.post('/lines', auth, lineController.createLine);
router.put('/lines/:id', auth, lineController.updateLine);
router.delete('/lines/:id', auth, lineController.deleteLine);
router.patch('/lines/:id/status', auth, lineController.updateLineStatus); //to update line status field

// lineEvents
router.get('/events', auth, lineEventsController.getLineEvents); // returns array of all events, + query parameters. probably admin only for now.
router.get('/events/auth', auth, lineEventsController.getLineEventsByAuthUser); //returns array of all events, + query parameters
router.get('/events/:id', auth, lineEventsController.getLineEventById);

// employers
router.get('/employers', employerController.getEmployerBySearch); // UNAUTHENTICATED
router.get('/employers/auth', auth, employerController.getEmployerByAuthUser);
router.get('/employers/:id', employerController.getEmployerById); // UNAUTHENTICATED
router.post('/employers', auth, employerController.createEmployer);
router.put('/employers/:id', auth, employerController.updateEmployer);
router.patch('/employers/auth/profile', auth, employerController.patchEmployersProfileByAuthUser); // recruiter only
router.delete('/employers/:id', auth, employerController.deleteEmployer);

// QR
router.get('/qr', auth, qrController.getQRWithQuery); //get qr code given emp_id or qr_code_value in query

module.exports = router;
