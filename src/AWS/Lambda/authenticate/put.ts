/**
 * This file hosts the code for executing the code for PUT host/authenticate
 *
 * This Lambda function should create an access token. When a user passes in a username and secret
 *
 */

export const handler = async (event: any) => {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
