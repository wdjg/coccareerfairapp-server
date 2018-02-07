// This file contains shared behaviors.
import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../app.js'
import validator from 'validator'

import response from '../api/controllers/response.js'
import mongoose from 'mongoose'

const expect = chai.expect
const should = chai.should()

//During the test the env variable is set to test

chai.use(chaiHttp);

// function shouldBeAuthenticated() {
//     it    
// }

// export default { shouldBeAuthenticated } 

function clearDatabase() {
    for (var collection in mongoose.connection.collections) {
        mongoose.connection.collections[collection].remove(function () { });
    }
}

before(function(done){
    clearDatabase();
    return done();
});

afterEach(function (done) {
    clearDatabase();
    return done();
});

after(function(done) {
    mongoose.disconnect();
    app.close();
    return done();
});