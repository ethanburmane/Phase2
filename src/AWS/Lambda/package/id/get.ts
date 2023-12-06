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
  console.log("GET PACKAGE STARTING");
  //Extract id
  const path = event.pathParameters.proxy;
  const segments = path.split("/");
  const packageId = segments[segments.length - 2];
  console.log("Package ID: ", packageId);

  // Check if the package exists
  const packageExists = await checkPackageExists(packageId);
  if (!packageExists) {
    return { statusCode: 404, body: JSON.stringify("Package does not exist") };
  }
  console.log("Package exists");

  // - Handle id exists
  // -- Grab the package with the given id
  // get package metadata
  console.log("Retrieving package metadata");
  const params = {
    "TableName": "Packages",
    "Key": { "id": { S: packageId } }
  };

  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  console.log("Returned Item: ", Item);
  const packageMetadata = {
    Name: Item.Name.S,
    Version: Item.Version.S,
    id: Item.id.S
  }
  console.log("Package Metadata: ", JSON.stringify(packageMetadata));

  const packageName = JSON.stringify(packageMetadata.Name);
  console.log("Package Name: ", packageName);
  const packageVersion = JSON.stringify(packageMetadata.Version);
  console.log("Package Version: ", packageVersion);

  try {
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: "main-storage-bucket",
      "Key": `package/${packageName}/${packageVersion}.zip`
    }));
    console.log("content:", s3Response.Body.toString('base64'));
    return {
      statusCode: 200,
      body: JSON.stringify({
        metadata: packageMetadata,
        data: {
          Content: s3Response.Body.toString('base64'),
          JSProgram: "<your_js_program_here>"
        }
      })
    }
  }  catch (error) {
      console.error(error);
      return { statusCode: 400, body: JSON.stringify("There is missing field(s) in the PackageID/AuthenticationToken or it is formed improperly, or the AuthenticationToken is invalid.") };
  }
}


async function checkPackageExists(packageId: string) {
  console.log("Checking if package exists: ", packageId);
  const params = {
    "TableName": "Packages",
    "Key": { "id": { S: packageId } }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return !!Item;
}