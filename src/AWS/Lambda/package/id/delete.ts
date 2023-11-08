/**
 * This file hosts the code for executing the code for DELETE host/package/{id}
 *
 * This Lambda function should delete the package with the given id.
 *
 */

export const handler = async (event: any) => {
  // TODO implement
  
  //Authenticate credentials

  //Extract the id

  //Check if the id exists

  // - Handle id DNE

  // - Handle id exists

  // Remove package from S3

  // Update DB?

  //Craft response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
