/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */

export const handler = async (event: any) => {
  // TODO implement

  //Authenticate Credentials

  //Validate request
  const headers = event.headers
  const authorizationHeader = headers["X-Authorization"]

  const body = JSON.parse(event.body)
  if ((body["Content"] && body["URL"]) || (!body["Content"] && !body["URL"]))
  {
    //Return 4xx code since the body is not formatted correctly
  }
  
  //const url = extractURLFromBody(body)

  


  // - Handle validation failed
  // - Handle validation success

  // -- Upload package into the registry

  // -- Update DB with information

  //Create response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
