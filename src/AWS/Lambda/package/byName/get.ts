/**
 * This file hosts the code for executing the code for GET host/package/byName
 *
 * This Lambda function should return the package given by name.
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
