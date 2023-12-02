/**
 * This file hosts the code for executing the code for PUT host/package/{id}
 *
 * This Lambda function should update the package given, much match name version, etc
 */


export const handler = async (event: any) => {
  // TODO implement

  //Validate credentials

  //Extract the id

  //Check if the id exists in DB

  // - Handle id DNE

  // - Handle id exists

  // -- Update package contents

  // -- Update DB

  //Create response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
