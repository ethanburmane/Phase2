/**
 * This file hosts the code for executing the code for DELETE host/package/byName/{name} - deleting all versions of the given package.
 *
 * This Lambda function should delete the package given by name.
 * 
 * Path parameters:
 * 
 * Headers:
 *
 */


const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { DynamoDBClient, ScanCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb")

const AWS_REGION = "us-east-2"
const S3_ROOT = "packages/"
const DB_TABLE_NAME = "Packages"

const S3 = new S3Client({ region: AWS_REGION })
const DB = new DynamoDBClient( { region: AWS_REGION })

export const handler = async (event: any) => {
  let response
  // The package name is in the path parameters

  const target = event.Name
  if (!target)
  {
    // TODO Log no path parameter name
    console.log("Name not found in path parameters.")
    return {
      statusCode: 500,
      body: "Server Error"
    }
  }


  const keys = await doesPackageExist(target)
  if (keys === 404)
  {
    return {
      statusCode: 404,
      body: "Package Does Not Exist"
    }
  }
  else if (keys === 500)
  {
    return {
      statusCode: 500,
      body: "Server Error"
    }
  }

  const dbDeletionResult = await deletePackageDB(keys)
  if (dbDeletionResult === 500)
  {
    return {
      statusCode: 500,
      body: "Server Error"
    }
  }
  // else === 200

  const s3DeletionResult = await deletePackageS3(target)
  if (s3DeletionResult === 500)
  {
    // TODO log but RETURN SUCCESS --- Package was deleted from DB
  }
  else if (s3DeletionResult === 404)
  {
    // TODO log but RETURN SUCCESS --- Package was deleted from DB
  }

  response = {
    statusCode: 200,
    body: "Package is Deleted",
  }
  console.log(event)
  return response
}

async function deletePackageS3(target: string)
{
  const s3_cmd_input = {
    Bucket: "main-storage-bucket",
    Key: S3_ROOT + target
  }
  try 
  {
    console.log("Deleting from s3")
    const s3Delcommand = new DeleteObjectCommand(s3_cmd_input)
    const s3DelResult = await S3.send(s3Delcommand)
    console.log("Deletion result", s3DelResult)
    if (s3DelResult.$metadata.httpStatusCode === 200)
    {
      return 200
    }
    return 404

  }
  catch (e)
  {
    console.error("Error when deleting from s3", e)
    return 500
  }
}

async function doesPackageExist(target: string)
{
  console.log("Checking if package exists.")
  const scanParams = {
    TableName: DB_TABLE_NAME,
    FilterExpression: '#N = :n',
    ExpressionAttributeNames: {
      '#N': 'Name'
    },
    ExpressionAttributeValues: {
        ':n': { S: target }
    }
  }

  try {
    console.log("Scanning DB for target ", target)
    const scanResult = await DB.send(new ScanCommand(scanParams));
    console.log("Scan Result", scanResult)

    if (scanResult.Items && scanResult.Items.length > 0) {
        const keys: any[] = []
        scanResult.Items.forEach((item: any) =>
        {
          keys.push(item.id.S)
        })
        return keys
    } 
    else {
        console.log('No items found with name', target);
        return 404
    }
  } 
  catch (err) {
      console.error('Error scanning/deleting items:', err);
      return 500
  }
}

async function deletePackageDB(keys: any[])
{
  console.log("Deleting items from database. Keys: ", keys)
  try
  {

    for (const k of keys) 
    {
      const deleteParams = {
          TableName: DB_TABLE_NAME, 
          Key: {
              id: { S: k }
          }
      };
      
      console.log("Deleting id ", k)
      const deletionResult = await DB.send(new DeleteItemCommand(deleteParams));
      console.log(deletionResult)
      if (deletionResult.$metadata.httpStatusCode !== 200)
      {
        console.error("Error deleting ", k, "from database")
      }
      console.log('Item deleted:', k);
    }
  }
  catch (e)
  {
    console.error("Error deleting items from DB", e)
    return 500
  }
  return 200
}