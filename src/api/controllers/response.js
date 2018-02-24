// This file is strictly for response message strings
let messages =  {
    unauthorized: "UnauthorizedError: Need to be logged in",

    // authentication
    userAlreadyExists: "RegisterError: User already exists!",
    authRegisterMissingFields: "RegisterError: Need name, email, and password",
    authLoginMissingFields: "LoginError: Need email and password fields",
    authLoginNoUserFound: "LoginError: No user found for email",
    authLoginInvalid: "LoginError: Invalid email password combination",

    // authentication off user type
    authNoStudentsAllowed: "UnauthorizedError: Not available to students",

    // lines
    postLinesAlreadyExists: "UniqueError: Line for this user already exists",
    getLinesUsersMissingEmployeId: "InputError: Needs employer_id as a query parameter in url",

    // employers
    // getEmployersMissingNameQuery: "InputError: Missing name parameter in query",
    postEmployersMissingNameBody: "InputError: Missing name parameter in body",
    postEmployersQRMissingValueBody: "InputError: Missing value parameter in body",

    // QR
    getQRNotFound: "NotFound: no QR found for your input",
    getQRMissingQuery: "InputError: Missing employer_id or qr_code_value as a query parameter in url",

    // misc
    success: "Success"

}

export default messages