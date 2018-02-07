// This file is strictly for response message strings
let messages =  {
    unauthorized: "UnauthorizedError: Need to be logged in",
    userAlreadyExists: "RegisterError: User already exists!",
    authRegisterMissingFields: "RegisterError: Need name, email, and password",
    authLoginMissingFields: "LoginError: Need email and password fields",
    authLoginNoUserFound: "LoginError: No user found for email",
    authLoginInvalid: "LoginError: Invalid email password combination",
    success: "Success"

}

export default messages