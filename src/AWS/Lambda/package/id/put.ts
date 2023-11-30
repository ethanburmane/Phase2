/**
 * This file hosts the code for executing the code for PUT host/package/{id}
 *
 * This Lambda function should update the package given, much match name version, etc
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');

const AWS_REGION = "us-east-2";
const s3Client = new S3Client({ region: AWS_REGION });
const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });
export const handler = async (event) => {
  const packageId = event.pathParameters?.id;
  const bearerToken = event.headers?.Authorization;
  const body = JSON.parse(event.body);

  // TODO implement
  //Validate credentials
  if (!isValidToken(bearerToken)) {
    return { statusCode: 400, body: JSON.stringify("Invalid Authentication Token") };
  }

  // Check if the package exists
  const packageExists = await checkPackageExists(packageId);
  if (!packageExists) {
      return { statusCode: 404, body: JSON.stringify("Package does not exist") };
  }

  // Update package in S3 and DB
    try {
        await updatePackageInS3(packageId, body.data.Content);
        await updatePackageInDB(packageId, body.metadata);

        return {
            statusCode: 200,
            body: JSON.stringify("Version is updated")
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 400, body: JSON.stringify("Error updating the package") };
    }
}

function isValidToken(token: string) {
  // Implement token validation logic here
  return true; // Placeholder
}

async function checkPackageExists(packageId: string) {
  const params = {
      TableName: "<your_dynamodb_table>",
      Key: { 'ID': { S: packageId } }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return !!Item;
}

async function updatePackageInS3(packageId: string, content) {
  const cmdInput = {
      Body: Buffer.from(content, 'base64'), // assuming content is base64 encoded
      Bucket: "main-storage-bucket",
      Key: `packages/${packageId}/content.zip`
  };
  await s3Client.send(new PutObjectCommand(cmdInput));
}

async function updatePackageInDB(packageId: string, metadata) {
  const params = {
      TableName: "<your_dynamodb_table>",
      Key: { 'ID': { S: packageId } },
      UpdateExpression: "set Name = :n, Version = :v",
      ExpressionAttributeValues: {
          ":n": { S: metadata.Name },
          ":v": { S: metadata.Version }
      }
  };
  await dynamoDBClient.send(new UpdateItemCommand(params));
}