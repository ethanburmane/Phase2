/**
 * This file hosts the code for executing the code for GET host/package/{id}/rate
 *
 * This Lambda function should take the package, then calculate and display the individual metric scores
 * (part 1 and new metrics) as well as the net score.
 *
 */

export const handler = async (event: any) => {
  // TODO implement

  //Authenticate credentials

  //Extract the id

  //Check if the id is in the database

  // - Handle id DNE

  // - Handle id exists

  // -- Run metrics on the package 
  
  //Create response with the package score

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
