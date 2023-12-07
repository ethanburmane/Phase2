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

export const handler = async (event: any, context: any) => {
  console.log("UPDATE PACKAGE STARTING");
  const packageId = event.id
  console.log("Package ID: ", packageId);

  const body = event.body;
  console.log("Body: ", JSON.stringify(body));
  const metadata = body.metadata;
  console.log("Metadata: ", JSON.stringify(metadata));
  const packageName = JSON.stringify(metadata.Name);
  console.log("Package Name: ", packageName);
  const packageVersion = JSON.stringify(metadata.Version);
  console.log("Package Version: ", packageVersion);

  // TODO implement
  // Check if the package exists
  const packageExists = await checkPackageExists(packageId);
  if (!packageExists) {
      return { statusCode: 404, body: JSON.stringify("Package does not exist") };
  }
  console.log("Package exists");
  // Update package in S3 and DB
    try {
        await updatePackageInS3(packageName, packageVersion, body.data.Content);
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

async function checkPackageExists(packageId: string) {
  console.log("Checking if package exists: ", packageId);
  const params = {
      "TableName": "Packages",
      "Key": { "id": { S: packageId } }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return !!Item;
}

async function updatePackageInS3(packageName: string, packageVersion: string, content: string) {
  console.log("Updating package in S3");
  let name = JSON.parse(packageName);
  let version = JSON.parse(packageVersion);
  const cmdInput = {
      "Body": Buffer.from(content, 'base64'), // assuming content is base64 encoded
      "Bucket": "main-storage-bucket",
      "Key": `package/${name}/${version}.zip`
  };

  const Item = await s3Client.send(new PutObjectCommand(cmdInput));
  console.log("Updated package in S3: ", Item);
}


async function updatePackageInDB(packageId: string, metadata: any) {
  console.log("Updating package in DB");
  const uploadDate = new Date();
  const dateString = uploadDate.toISOString();
  const new_history = {
    M: {
      "type": {S: "UPDATE"},
      "date": {S: dateString},
    }
  }

  const get_item_params = {
    "TableName": "Packages",
    "Key": { "id": { S: packageId } },
    "ProjectionExpression": "History"
  };
  
  let curr_history;
  try {
    const data = await dynamoDBClient.send(new GetItemCommand(get_item_params));
    curr_history = data.Item ? data.Item.History.L : [];
  }
  catch (error) {
    console.error("Error getting package history", error);
    throw error;
  } 

  curr_history.push(new_history);

  const params = {
      "TableName": "Packages",
      "Key": { "id": { S: packageId } },
      "UpdateExpression": "SET #N = :n, #V = :v, #L = :l, #H = :h",
      "ExpressionAttributeNames": {
          "#N": "Name",
          "#V": "Version",
          "#L": "LastUpdated",
          "#H": "History"
      },
      "ExpressionAttributeValues": {
          ":n": { S: metadata.Name },
          ":v": { S: metadata.Version },
          ":l": { S: dateString},
          ":h": { L: curr_history }
      },
      "ReturnValues": "UPDATED_NEW"
  };
  const Item = await dynamoDBClient.send(new UpdateItemCommand(params));
  console.log("Updated package in DB: ", Item)
}
