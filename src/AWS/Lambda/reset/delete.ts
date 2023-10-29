/**
 * This file hosts the code for executing the code for DELETE host/reset
 * 
 * This Lambda function should reset the system to a default state. This includes clearing all stored users and packages.
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
