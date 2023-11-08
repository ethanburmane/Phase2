/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should return all of the packages in the registry.
 *
 */

export const handler = async (event: any) => {
  // TODO implement

  // Authenticate credentials

  // Gather all packages in the registry

  // Create response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
