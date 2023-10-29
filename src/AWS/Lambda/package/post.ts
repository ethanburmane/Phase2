
/**
 * This file hosts the code for executing the code for POST host/package
 * 
 * This Lambda function should interact with the S3 bucket containing all of the package information
 * 
 *
*/


export const handler = async (event: any) => {
    // TODO implement
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    console.log(event);
    return response;
};
  
  