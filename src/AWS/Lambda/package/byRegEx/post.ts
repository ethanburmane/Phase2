/**
 * This file hosts the code for executing the code for POST host/package/byRegEx
 *
 * This Lambda function should return any packages matching the regex by name or readme.
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
