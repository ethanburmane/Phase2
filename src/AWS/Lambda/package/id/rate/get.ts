
/**
 * This file hosts the code for executing the code for GET host/package/{id}/rate
 * 
 * This Lambda function should take the package, then calculate and display the individual metric scores 
 * (part 1 and new metrics) as well as the net score.
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

  