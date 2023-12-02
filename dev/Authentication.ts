import logger from "../src/logger"
function  VerifyUser(username: string): Promise<string> {
    // Get user from database
    // return user
    s3Client = 
    return ''
}
function AuthenticateBearrerToken(token: string): Promise<string> {
    //token should be event.headers['X-Auth]
    isValid = VerifyUser(token)
    if (isValid != '') {
        return User
    }
    else {
        console.log("Invalid Bearrer Token")
        return null
    }
}
