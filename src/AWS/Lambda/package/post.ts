/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */
import * as crypto from 'crypto';
export const handler = async (event: any) => {
  // TODO implement
  //Authenticate Credentials

  // -- Upload package into the registry
  // -- Update DB with information

  // Parse the body of the request
  // Validate request
  try {
    const user = event.User?.name;
    const isAdmin = event.User?.isAdmin;
    const password = event.User?.password;

    // - Handle validation failed
    if (!user || typeof user !== 'string' || !password || typeof password !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify('There is missing field(s) in the AuthenticationRequest or it is formed improperly.'),
      };
    }
  
  // Create response
  // - Handle validation success
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const bearerToken = 'bearer ${user}.${hashedPassword}';
  
  // Send response
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
