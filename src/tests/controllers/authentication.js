// This file consists of tests for authentication routes, login and register.
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

var token = null;

describe('Authentication API Tests', function() {
    describe('post /register', function() {
        it('creates user and token', function(done) {
            chai.request(app)
                .post('/api/register')
                .send(mockUser)
                .end(function(err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
        it('doesnt have all fields', function(done) {
            chai.request(app)
                .post('/api/register')
                .send({
                    //name
                    email: 'test@gmail.com',
                    password: '12345'
                })
                .end(function(err, res) {
                    expect(err).to.exist;
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(response.authRegisterMissingFields);
                    expect(res.body).to.not.have.property('token');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
        describe('already registered', function() {
            beforeEach(function(done) {
                chai.request(app).post('/api/register').send(mockUser).end(function(err, res) { done(); });
            });
            it('errors when user already exists', function(done) {
                chai.request(app)
                    .post('/api/register')
                    .send(mockUser)
                    .end(function(err, res) {
                        expect(err).to.exist;
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property('message');
                        expect(res.body.message).to.equal(response.userAlreadyExists);
                        expect(res.body).to.not.have.property('token');
                        expect(res.body).to.have.property('message');
                        done();
                    });
            });
        });
    });

    describe('post /login', function() {
        beforeEach(function(done) {
            chai.request(app).post('/api/register').send(mockUser).end(function(err, res) { done(); });
        });
        it('returns token', function(done) {
            chai.request(app)
                .post('/api/login')
                .send(mockUser)
                .end(function(err, res){
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.property('token');
                    expect(res.body).to.not.have.property('message');
                    done();
                });
        });
        it('fails with no password field', function(done) {
            chai.request(app)
                .post('/api/login')
                .send({
                    email: mockUser.email,
                })
                .end(function(err, res){
                    expect(err).to.exist;
                    expect(res).to.have.status(400);
                    expect(res.body.message).to.equal(response.authLoginMissingFields)
                    expect(res.body).to.not.have.property('token');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
        it('fails with wrong password', function(done) {
            chai.request(app)
                .post('/api/login')
                .send({
                    email: mockUser.email,
                    password: '123456'
                })
                .end(function(err, res){
                    expect(err).to.exist;
                    expect(res).to.have.status(401);
                    expect(res.body.message).to.equal(response.authLoginInvalid)
                    expect(res.body).to.not.have.property('token');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
        it('fails with wrong email', function(done) {
            chai.request(app)
                .post('/api/login')
                .send({
                    email: 'test-fake@gmail.com',
                    password: mockUser.password
                })
                .end(function(err, res){
                    expect(err).to.exist;
                    expect(res).to.have.status(401);
                    expect(res.body.message).to.equal(response.authLoginNoUserFound)
                    expect(res.body).to.not.have.property('token');
                    expect(res.body).to.have.property('message');
                    done();
                });
        });
    });
});