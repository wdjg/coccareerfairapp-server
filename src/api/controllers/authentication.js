import passport from 'passport'
import mongoose from 'mongoose'
import response from './response.js'
import { User, Student, Recruiter, Admin } from '../models/users.js'
const Employer = mongoose.model('Employer');

function register(req, res) {
    if(!req.body.name || !req.body.email || !req.body.password) {
      return res.status(400).json({
          "message": response.authRegisterMissingFields
      });
      return;
    } else if (req.body.employer_id) {
        return res.status(400).json({
            "message": response.authRegisterWithEmpIdNotAllowed
        });
      return;
    }

    User.findOne({email: req.body.email}).exec(async function(err, user) {
        // if user is found, already exists
        if(user) {
            return res.status(400).json({
                "message": response.userAlreadyExists
            });
        } else {
            // user not found, make new one
            // set user_type, default is 'student'
            var user_type = (req.body.user_type === undefined) ? 'student' : req.body.user_type;
            var user;
            switch (user_type) {
                case 'student':
                    user = new Student();
                    break;
                case 'recruiter':
                    user = new Recruiter();
                    break;
                case 'admin':
                    user = new Admin();
                    break;
                default:
                    return res.status(400).json({
                        "message": response.authRegisterBadType
                    });
                    //user = new User();
                    break;
            }

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            if (user_type === 'recruiter') {
                // if they're recruiter check if passcode exists
                if (!req.body.passcode) {
                    return res.status(400).json({
                        "message": response.authRegisterRecruiterNoPasscode
                    });
                }
                // query for passcode
                try {
                    let emp_query = Employer.findOne({passcode: req.body.passcode});
                    var found_emp = await emp_query.exec();
                } catch (err) {
                    console.log(err);
                    return res.status(400).json({
                        "message": err
                    });
                }

                if (found_emp) {
                    user.employer_id = found_emp._id;
                    return saveUser(res, user);
                } else {
                    return res.status(404).json({
                        "message": response.authRegisterNoEmployerFound
                    });
                }
            } else {
                // admin or student
                return saveUser(res, user);
            }
        }
    });
};

//helper to save user, to avoid code duplication
function saveUser(res, user) {
    user.save(function (err) {
        if (!err) {
            var token;
            token = user.generateJwt();
            res.status(200);
            return res.json({
                "token": token,
                "message": response.authRegisterSuccess(user)
            });
        } else {
            console.log(err);
            return res.status(400).json({
                "message": err
            });
        }
    });
}

function login(req, res) {

    if(!req.body.email || !req.body.password) {
      return res.status(400).json({
          "message": response.authLoginMissingFields
      });
      return;
    }

    passport.authenticate('local', function (err, user, info) {
        var token;

        // If Passport throws/catches an error
        if (err) {
            res.status(404).json(err);
            return;
        }

        // If a user is found
        if (user) {
            token = user.generateJwt();
            res.status(200);
            res.json({
                "token": token
            });
        } else {
            // If user is not found
            res.status(401).json(info);
        }
    })(req, res);

}

export default { register, login }
