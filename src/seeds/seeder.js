import mongoose from 'mongoose'
import faker from 'faker'
import { User, Student, Recruiter, Admin } from '../api/models/users.js'
import Employer from '../api/models/employers.js'
import Line from '../api/models/lines.js'

const NUM_USERS = 5;

async function demoSeed() {
    clearLines();
    // clearUsers();

    // first create employer
    var query = Employer.findOne({name: 'Jacket'});
    employer = await query.exec();
    if (!employer) {
        var employer = Employer();
        employer.name = 'Jacket';
        employer.passcode = 111111;
        try {
            employer = await employer.save();
            console.log('SEEDER: Created employer named "' + dbemployer.name + '" with passcode "' + dbemployer.passcode + '"');
        } catch (err) {
            console.log(err);
        }
    }

    // create admin user
    query = Admin.findOne({email: 'admin@gmail.com'});
    admin = await query.exec();
    if (!admin) {
        var admin = Admin();
        admin.name = 'admin';
        admin.email = 'admin@gmail.com';
        admin.user_type = 'admin';
        admin.setPassword('test');
        try {
            admin = await admin.save();
            console.log('SEEDER: Created admin with email: "' + admin.email + '" with password "test"');
        } catch (err) {
            console.log(err);
        }
    }

    // create recruiter user
    query = Recruiter.findOne({email: 'recruiter@gmail.com'});
    recruiter = await query.exec();
    if (!recruiter) {
        var recruiter = Recruiter();
        recruiter.name = 'recruiter';
        recruiter.email = 'recruiter@gmail.com';
        recruiter.user_type = 'recruiter';
        recruiter.employer_id = employer._id;
        recruiter.setPassword('test');
        try {
            recruiter = await recruiter.save();
            console.log('SEEDER: Created recruiter with email: "' + recruiter.email + '" with password "test"');
        } catch (err) {
            console.log(err);
        }
    }

    // create dummy users
    query = Student.find({ "email": { "$regex": "test", "$options": "i" } }).count();
    var count = await query.exec();
    for (var i = 0; i < NUM_USERS - count; i++) {
        var user = Student();
        user.name = faker.name.findName();
        user.email = "test_" + faker.random.number() + "@gmail.com";
        user.user_type = 'student';
        user.setPassword('test');
        try {
            user = await user.save();
            console.log('SEEDER: Created user with email: "' + user.email + '" with password "test"');
        } catch (err) {
            console.log(err);
        }
    }

    // only students with test in their email will populate line info
    query = Student.find({ "email": { "$regex": "test", "$options": "i" } });
    var students = await query.exec();
    for (var i = 0; i < students.length; i++) {
        var student = students[i];
        // create line entry for each.
        var line = Line();
        line.user_id = student._id;
        line.employer_id = employer._id;
        line.status = 'inline';
        try {
            line = await line.save();
            console.log('SEEDER: Created line with user name: "' + student.name + '" with status "' + line.status + '"');
        } catch (err) {
            console.log(err);
        }
    }
}



function clearLines() {
    return Line.remove({}, function(){});
}

function clearUsers() {
    return User.remove({}, function(){});
}

export default { demoSeed }