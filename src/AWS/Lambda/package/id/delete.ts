/**
 * This file hosts the code for executing the code for DELETE host/package/{id}
 *
 * This Lambda function should delete the package with the given id.
 *
 */

const {DynamoDBClient, DeleteItemCommand, GetItemCommand } = require("@aws-sdk/client-dynamodb")
const {S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3")

const AWS_REGION = "us-east-2";
const S3_NAME = "main-storage-bucket";
const S3_ROOT = "packages/";
const DB_TABLE_NAME = "Packages";
const DB = new DynamoDBClient({ region: AWS_REGION });
const S3 = new S3Client({ region: AWS_REGION });
const handler = async (event: any) => {
  let response
  const targetID = event.id
  if (!targetID)
  {
    console.error("No id found in request")
  }

  const pkgItem = await getPackageFromDB(targetID)
  if (pkgItem === 500)
  {
    console.log("Sent 500")
    return {
      statusCode: 500,
      body: {
        error: "Server Error."
      }
    }
  }
  if (pkgItem === 404)
  {
    console.log("Sent 404")
    return {
      statusCode: 404,
      body: {
        error: "Package not found"
      }
    }
  }

  const dbDelResult = await deleteFromDB(targetID)
  if (dbDelResult === 500)
  {
    console.log("Sent 500")
    return {
      statusCode: 500,
      body: {
        error: "Server Error."
      }
    }
  }

  const pkgName = pkgItem.Name.S
  const pkgVersion = pkgItem.Version.S
  const s3DelResult = await deleteFromS3(pkgName, pkgVersion)
  if (s3DelResult === 500)
  {
    // Error but deleted from DB so return 200
  }

  
  response = {
    statusCode: 200,
    body: "Package Version Deleted.",
  }
  return response
}

async function getPackageFromDB(id: string)
{
  const db_cmd_input = {
    TableName: DB_TABLE_NAME,
    Key: {
      id: id
    }
  }
  try 
  {
    console.log("Getting item from db ", id)
    const dbGetCommand = new GetItemCommand(db_cmd_input)
    const dbGetResult = await S3.send(dbGetCommand)
    console.log("Retrieval result", dbGetResult)
    if (dbGetResult.$metadata.httpStatusCode === 200)
    {
      return dbGetResult.Item
    }
    console.log("DB returned non 200 code.")
    return 404

  }
  catch (e)
  {
    console.error("Error when retrieving from DB", e)
    return 500
  }
}

async function deleteFromDB(id: string)
{
  const db_cmd_input = {
    TableName: DB_TABLE_NAME,
    Key: {
      id: id
    }
  }
  try 
  {
    console.log("Deleting from DB")
    const dbDelcommand = new DeleteObjectCommand(db_cmd_input)
    const dbDelResult = await S3.send(dbDelcommand)
    console.log("Deletion result", dbDelResult)
    if (dbDelResult.$metadata.httpStatusCode === 200)
    {
      return 200
    }
    console.log("DB returned non 200 code.")
    return 404

  }
  catch (e)
  {
    console.error("Error when deleting from DB", e)
    return 500
  }
}

async function deleteFromS3(name: string, version: string)
{
  const s3_cmd_input = {
    Bucket: "main-storage-bucket",
    Key: S3_ROOT + name + "/" + version + ".zip"
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
    console.log("S3 returned non 200 code.")
    return 404
  }
  catch (e)
  {
    console.error("Error when deleting from s3", e)
    return 500
  }
}

async function clearTable(tableName: string) {
  let exclusiveStartKey = null
  const scanParams = {
      TableName: tableName,
      ExclusiveStartKey: exclusiveStartKey
  };

  let scanResult;
  let deleteResult
  do {
   const scanParams: any = {
       TableName: tableName,
       ExclusiveStartKey: scanResult ? scanResult.LastEvaluatedKey : undefined
   };

   // TODO Log scanning DB
   scanResult = await DB.send(new ScanCommand(scanParams));

   // TODO Log items scanned
   if (scanResult.Items && scanResult.Items.length > 0) {
       const deletePromises = scanResult.Items.map((item: any) => {
           const deleteParams = {
               TableName: tableName,
               Key: {
                   // Adjust according to your table's primary key structure
                   id: item.id
               }
           };
           // TODO Log deleting items
           return DB.send(new DeleteItemCommand(deleteParams));
       });

       deleteResult = await Promise.all(deletePromises);

       if (!isDBDeleteSuccess(deleteResult)) {
           // TODO log deletion failure
           return false;
       }
   }
 } while (scanResult.LastEvaluatedKey);
 // TODO Log deletion success
 return true
}

function isDBDeleteSuccess(result: any)
{
  return result[0].$metadata.httpStatusCode === 200
}

function isS3DeleteSuccess(result: any)
{
  return result.$metadata.httpStatusCode === 200
}


async function clearS3(s3_name: string, root: string)
 {
   let continuationToken = null;
   let deleteResult
   try {
     do {
       const listParams: any = {
           Bucket: S3_NAME,
           Prefix: S3_ROOT,
           ContinuationToken: continuationToken
       };
 
       const listResult = await S3.send(new ListObjectsCommand(listParams));
       if (listResult.Contents && listResult.Contents.length > 0) {
         const objectsToDelete = listResult.Contents.map((obj: any) => ({ Key: obj.Key }));
         
         const deleteParams = {
             Bucket: S3_NAME,
             Delete: { Objects: objectsToDelete }
         };
         deleteResult = await S3.send(new DeleteObjectsCommand(deleteParams));
       }
       if (!isS3DeleteSuccess(deleteResult)) { return false }
       continuationToken = listResult.NextContinuationToken;
     } while (continuationToken);
     return true
   }
   catch {
     return false
   }
 }