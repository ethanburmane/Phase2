/**
 * This file hosts the code for executing the code for POST host/package/byRegEx
 *
 * This Lambda function should return any packages matching the regex by name or readme.
 *
 */

export const handler = async (event: any) => {
  // TODO implement
  
  //Validate bearer token

  //Extract regex

  //Validate regex

  //Run the regex against the registry

  //Craft response with matched packages

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
