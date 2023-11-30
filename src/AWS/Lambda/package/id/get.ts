/**
 * This file hosts the code for executing the code for GET host/package/{id}
 *
 * This Lambda function should return the package with the given id.
 *
 */


const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');

const AWS_REGION = "us-east-2";

export const handler = async (event: any, context: any) => {
  const s3Client = new S3Client({ region: AWS_REGION });
  const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });
  let response;
  console.log(event);
  // TODO implement
  //Extract id
  const packageId = event.queryStringParameters.id;
  const bearerToken = event.headers.Authorization;

  //Validate bearer token --- SECURITY TEAM
  if (!isValidToken(bearerToken)) {
    response = {
        statusCode: 400,
        body: JSON.stringify({
            error: 'Invalid Authentication Token'
        }),
    };
    return response;
  }
  

  // - Handle id exists
  // -- Grab the package with the given id
  //Create response with package data
  try {
    const packageMetadata = await getPackageMetadata(packageId, dynamoDBClient);
    if (!packageMetadata) {
        response = {
            statusCode: 404,
            body: JSON.stringify({
                error: 'Package does not exist'
            }),
        };
        return response;
    }

    const s3Response = await s3Client.send(new GetObjectCommand({
        Bucket: "main-storage-bucket",
        Key: `packages/${packageId}/content.zip`
    }));

    response = {
        statusCode: 200,
        body: JSON.stringify({
            metadata: packageMetadata,
            data: {
                Content: s3Response.Body.toString('base64'),
                JSProgram: "<your_js_program_here>" // Replace with actual JS program
            }
        })
    };
} catch (error) {
    console.error(error);
    response = {
        statusCode: 400,
        body: JSON.stringify({
            error: 'There was an error processing your request'
        }),
    };
}

return response;
}

function isValidToken(token: string) {
  // Implement your token validation logic here
  return true; // Placeholder
}

async function getPackageMetadata(packageId: string, dynamoDBClient: string) {
  const params = {
      TableName: "<your_dynamodb_table>",
      Key: { 'ID': { S: packageId } }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return Item ? AWS.DynamoDB.Converter.unmarshall(Item) : null;
}