/**
 * This file hosts the code for executing the code for PUT host/authenticate
 *
 * This Lambda function should create an access token. When a user passes in a username and secret
 *
 */
import * as crypto from 'crypto';
export const handler = async (event: any) => {
  // TODO implement

  //Process event for valid user credentials (check against registered users)
  try {
    const user = event.User?.name;
    const isAdmin = event.User?.isAdmin;
    const password = event.User?.password;

    // Incorrect AuthenticationRequest Handling
    if (!user || typeof user !== 'string' || !password || typeof password !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify('There is missing field(s) in the AuthenticationRequest or it is formed improperly.'),
      };
    }
  
  // Create response
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const bearerToken = 'bearer ${user}.${hashedPassword}';   //Generate bearer token
  
  // Send response
  // Return code 200 and bearer token if successful
  const response = {
    statusCode: 200,
    body: JSON.stringify({token : bearerToken}),
  };
  console.log(event)
  return response;
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify('There was an error with the request.'),
    };
  }
}
