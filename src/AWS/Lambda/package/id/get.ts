/**
 * This file hosts the code for executing the code for GET host/package/{id}
 *
 * This Lambda function should return the package with the given id.
 *
 */


const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, GetItemCommand } = require('@aws-sdk/client-dynamodb');

const AWS_REGION = "us-east-2";
const s3Client = new S3Client({ region: AWS_REGION });
const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event: any, context: any) => {
  let response;
  console.log(event);
  // TODO implement
  //Extract id
  const packageId = event.pathParameters?.id;
  const bearerToken = event.headers?.Authorization;


  //Validate bearer token --- SECURITY TEAM
  if (!isValidToken(bearerToken)) {
    response = {
        statusCode: 400,
        body: JSON.stringify({
            error: 'The AuthenticationToken is invalid.'
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

    const packageName = packageMetadata.Name;
    const packageVersion = packageMetadata.Version;

    const s3Response = await s3Client.send(new GetObjectCommand({
        Bucket: "main-storage-bucket",
        Key: `package/${packageName}/${packageVersion}.zip`
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
            error: 'There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.'
        }),
    };
}

return response;
}

function isValidToken(token: string) {
  // Implement your token validation logic here
  return true; // Placeholder
}

async function getPackageMetadata(packageId: string, dynamoDBClient: typeof DynamoDBClient) {
  const params = {
      TableName: "Packages",
      Key: { 'ID': { S: packageId } },
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return Item ? DynamoDBClient.Converter.unmarshall(Item) : null;
}

/*
async function getPackageContent(packageId: string, s3Client: string) {
    const params = {
        Bucket: "main-storage-bucket",
        Key: `package/${packageName}/${packageVersion}.zip`
    };
    const { Body } = await s3Client.send(new GetObjectCommand(params));
    return Body ? Body.toString('base64') : null;
}
*/