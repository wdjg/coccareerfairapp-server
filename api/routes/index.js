var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
});

// var ctrlProfile = require('../controllers/profile');
var ctrlAuth = require('../controllers/authentication');
var ctrlLine = require('../controllers/line');

// profile
// router.get('/profile', auth, ctrlProfile.profileRead);

// authentication
router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.get('/line', auth, ctrlLine.getLineByUser)
router.get('/line/:id', auth, ctrlLine.getLineById)
router.post('/line', auth, ctrlLine.createLine)
router.put('/line/:id', auth, ctrlLine.updateLine)
router.delete('/line/:id', auth, ctrlLine.deleteLine)

module.exports = router;
