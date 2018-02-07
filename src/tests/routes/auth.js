// This file consists of tests purely for testing all of the api routes
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
                        done();
                    });
            });
        })
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
                    expect(res.body).to.have.property('token')
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
                    done();
                });
        });
    });

});

// describe('Models API Tests', function() {
    // before(function(done) {
    //     chai.request(app)
    //         .post('/api/register')
    //         .send(mockUser)
    //         .end(function(err, res) {
    //             expect(res.body.token).to.exist;
    //             token = res.body.token; // Or something
    //             done();
    //         });
    // });
    
    // describe('Users', function() {
    //     describe('get /users', function() {
    //         it('returns auth student user json', function() {
    //             chai.request(app)
    //                 .get('/api/users')
    //                 .set({ Authorization: 'Bearer ' + token })
    //                 .end(function(err, res) {
    //                     validator.isMongoID(res.body._id).should.be.true
    //                     res.body.name.should.exist
    //                     res.body.user_type.should.equal('student')
    //                     res.body.employer_id.should.be.null
    //                     done()
    //                 });
    //         });
    //     });
    //     describe('get /users/:id', function() {

    //     });
    // });
    // describe('Lines', function() {

    // });
    // describe('Employers', function(){

    // });
// });