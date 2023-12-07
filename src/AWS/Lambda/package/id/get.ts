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
  const packageId = event.id;
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

  const packageName = packageMetadata.Name;
  console.log("Package Name: ", JSON.stringify(packageName));
  const packageVersion = packageMetadata.Version;
  console.log("Package Version: ",JSON.stringify(packageVersion));

  try {
    const s3Response = await s3Client.send(new GetObjectCommand({
      Bucket: "main-storage-bucket",
      "Key": `packages/${packageName}/${packageVersion}.zip`
    }));
    console.log("S3 response body: ", s3Response.Body);
    
    // Function to read stream and convert to base64
    const chunks: Buffer[] = [];
    const stream = s3Response.Body;

    // Listen for data events to read chunks
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Listen for the end of the stream
    await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
    });

    // Combine chunks and convert to base64
    const base64content = Buffer.concat(chunks).toString('base64');
    
    return {
        statusCode: 200,
        body: {
            metadata: packageMetadata,
            data: {
                Content: base64content
            }
        }
    };
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