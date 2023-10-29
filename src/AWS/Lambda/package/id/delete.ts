/**
 * This file hosts the code for executing the code for DELETE host/package/{id}
 * 
 * This Lambda function should delete the package with the given id.
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
