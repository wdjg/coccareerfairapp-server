// This file is strictly for response message strings
let messages =  {
    unauthorized: "UnauthorizedError: Need to be logged in",

    // authentication
    userAlreadyExists: "RegisterError: User already exists!",
    authRegisterMissingFields: "RegisterError: Need name, email, and password",
    authRegisterNoEmployerFound: "RegisterError: No employer found with that passcode",
    authRegisterWithEmpIdNotAllowed: "RegisterError: Passing in employer_id is not allowed. Use company passcode",
    authRegisterRecruiterNoPasscode: "RegisterError: If recruiter, must pass in company passcode",
    authRegisterNoAdmins: "RegisterError: Cannot register as admin. Contact the webmaster",
    authLoginMissingFields: "LoginError: Need email and password fields",
    authLoginNoUserFound: "LoginError: No user found for email",
    authLoginInvalid: "LoginError: Invalid email password combination",

    // authentication off user type
    onlyStudent: "UnauthorizedError: Only available to students",
    notStudent: "UnauthorizedError: Not available to students",
    onlyRecruiters: "UnauthorizedError: Only available to recruiters",
    notRecruiters: "UnauthorizedError: Not available to recruiters",
    onlyAdmins: "UnauthorizedError: Only available to admins",

    // users
    getUsersOnlyAdmin: "UnauthorizedError: Only available to admin",
    patchUsersMissingDataBody: "InputError: Missing data in body",
    profileNoAdmins: "UnauthorizedError: Admins don't have profiles",

    // lines
    postLinesAlreadyExists: "UniqueError: Line for this user already exists",
    getLinesUsersMissingEmployerId: "InputError: Needs employer_id as a query parameter in url",
    getLineStatsMissingEmployerId: "InputError: Needs employer_id as a query parameter in url",

    // lineEvents
    getLineEventsByAuthUserUnauthorizedUserIdQuery: "UnauthorizedError: Attempting to access other user line info. Don't put user_id in your query",

    // employers
    // getEmployersMissingNameQuery: "InputError: Missing name parameter in query",
    postEmployersMissingNameBody: "InputError: Missing name parameter in body",
    postEmployersQRMissingValueBody: "InputError: Missing value parameter in body",
    patchEmployersMissingDataBody: "InputError: Missing profile fields in body",

    // QR
    getQRNotFound: "NotFound: no QR found for your input",
    getQRMissingQuery: "InputError: Missing employer_id or qr_code_value as a query parameter in url",

    // misc
    success: "Success",
    deleteSuccess: (num) => "Success: Deleted " + num + " element(s)", //assumes num > 0
    deleteNotFound: "NotFound: Queried item(s) don't exist"

}

export default messages
