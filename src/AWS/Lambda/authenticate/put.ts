/**
 * This file hosts the code for executing the code for PUT host/authenticate
 *
 * This Lambda function should create an access token. When a user passes in a username and secret
 *
 */

export const handler = async (event: any) => {
  // TODO implement
  //Security team needs to implement this code

  //Process event for valid user credentials (check against registered users)

  //Generate bearer token

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!')
    //token: bearer_token
  }
  console.log(event)
  return response
}
