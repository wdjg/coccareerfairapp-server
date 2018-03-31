// This file consists of tests for users controller.
import chai from 'chai'
import chaiHttp from 'chai-http'
// import validator from 'validator'
import validator from 'mongoose-validatorjs'

import response from '../../api/controllers/response.js'
import shared from '../shared.js'

import app from '../../app.js'
const expect = chai.expect
const should = chai.should()

chai.use(chaiHttp);

var mockUser = {
    name: 'TestGuy',
    email: 'test@gmail.com',
    password: '12345'
}
var mockAdmin = {
    name: 'Admin',
    email: 'admin@gmail.com',
    password: '12345',
    user_type: 'admin'
}

var token = null;
var adminToken = null;

describe('Users API Tests', function() {
    beforeEach(function(done) {
        chai.request(app).post('/api/register').send(mockUser).end(function(err, res) { 
            token = res.body.token;
            done(); 
        });
    });
    describe('get /users', function() {
        it('should error only admin', function(done) {
            chai.request(app)
                .get('/api/users')
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                    expect(err).to.exist;
                    expect(res).to.have.status(401);
                    expect(res.body).to.not.have.property('users');
                    expect(res.body).to.have.property('message');
                    expect(res.body.message).to.equal(response.getUsersOnlyAdmin);
                    done();
                });
        });
        describe('with admin auth', function() {
            before(function(done){
                chai.request(app).post('/api/register').send(mockAdmin).end(function(err, res) { 
                    adminToken = res.body.token;
                    done(); 
                });
            });
            it('should return all users', function(done) {
                chai.request(app)
                    .get('/api/users')
                    .set('Authorization', 'Bearer ' + adminToken)
                    .end(function(err, res) {
                        expect(err).to.be.null;
                        expect(res).to.have.status(200);
                        expect(res.body).to.have.property('users');
                        done();
                    });
            });
        });
    });
    describe('get /users/auth', function() {
        it('with no token should return unauthorized', function(done) {
                chai.request(app)
                    .get('/api/users/auth')
                    .end(function(err, res) {
                        expect(err).to.exist;
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('message');
                        expect(res.body.message).to.equal(response.unauthorized);
                        done();
                    });
        });
        it('should return auth user json', function(done) {
            chai.request(app)
                .get('/api/users/auth')
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.not.have.property('password');
                    expect(res.body).to.not.have.property('salt');
                    expect(res.body).to.not.have.property('hash');
                    expect(res.body).to.have.property('name');
                    expect(res.body.name).to.equal(mockUser.name);
                    expect(res.body).to.have.property('email');
                    expect(res.body.email).to.equal(mockUser.email);
                    expect(res.body).to.have.property('user_type');
                    expect(res.body.user_type).to.equal('student');
                    done();
                });
        });
    });
    describe('get /users/:id', function() {
        var user_id = null;
        beforeEach(function(done) {
            chai.request(app)
                .get('/api/users/auth')
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                    user_id = res.body._id
                    done();
                });

        });
        it('with no token should return unauthorized', function(done) {
                chai.request(app)
                    .get('/api/users/' + user_id)
                    .end(function(err, res) {
                        expect(err).to.exist;
                        expect(res).to.have.status(401);
                        expect(res.body).to.have.property('message');
                        expect(res.body.message).to.equal(response.unauthorized);
                        done();
                    });
        });
        it('should return user json', function(done) {
            chai.request(app)
                .get('/api/users/' + user_id)
                .set('Authorization', 'Bearer ' + token)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.not.have.property('password');
                    expect(res.body).to.not.have.property('salt');
                    expect(res.body).to.not.have.property('hash');
                    expect(res.body).to.have.property('name');
                    expect(res.body.name).to.equal(mockUser.name);
                    expect(res.body).to.have.property('email');
                    expect(res.body.email).to.equal(mockUser.email);
                    expect(res.body).to.have.property('user_type');
                    expect(res.body.user_type).to.equal('student');
                    done();
                });
        });

    });
    // describe('patch /users/auth/profile', function() {
    // });
    // describe('get /users/auth/favorites', function() {
    // });
    // describe('patch /users/auth/favorites', function() {
    // });
});