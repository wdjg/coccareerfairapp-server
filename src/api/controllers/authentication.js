import passport from 'passport'
import mongoose from 'mongoose'
import response from './response.js'
const User = mongoose.model('User');
const Employer = mongoose.model('Employer');

function sendJSONresponse(res, status, content) {
    res.status(status);
    res.json(content);
}

function register(req, res) {
    if(!req.body.name || !req.body.email || !req.body.password) {
      sendJSONresponse(res, 400, {
        "message": response.authRegisterMissingFields 
      });
      return;
    } else if (req.body.employer_id) {
        sendJSONresponse(res, 400, {
            "message": response.authRegisterWithEmpIdNotAllowed
        });
      return;
    }

    User.findOne({email: req.body.email}).exec(async function(err, user) {
        // if user is found, already exists
        if(user) {
            sendJSONresponse(res, 400, {
                "message": response.userAlreadyExists
            })
        } else {
            // user not found, make new one.
            var user = new User();

            user.name = req.body.name;
            user.email = req.body.email;

            user.setPassword(req.body.password);

            //need to enforce default here since jwt builds off of this.
            user.user_type = (req.body.user_type === undefined) ? 'student' : req.body.user_type;

            //check if they're trying to register at a specific company
            if (req.body.passcode) {
                try {
                    let emp_query = Employer.findOne({passcode: req.body.passcode});
                    var found_emp = await emp_query.exec();
                } catch (err) {
                    console.log(err);
                    return sendJSONresponse(res, 400, {
                        "message": err
                    });
                }

                if (found_emp) {
                    user.employer_id = found_emp._id;
                    return saveUser(res, user);
                } else {
                    return sendJSONresponse(res, 404, {
                        "message": response.authRegisterNoEmployerFound
                    });
                }
            } else {
                //no passcode specified, they're just a student. go ahead and save
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
                "token": token
            });
        } else {
            console.log(err);
            return sendJSONresponse(res, 400, {
                "message": err
            })
        }
    });
}

function login(req, res) {

    if(!req.body.email || !req.body.password) {
      sendJSONresponse(res, 400, {
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