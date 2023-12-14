/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should reset the registry
 *
 */



 const { DynamoDBClient, DeleteItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb")
 const {S3Client, DeleteObjectsCommand, ListObjectsCommand } = require("@aws-sdk/client-s3")
 const AWS_REGION = "us-east-2"
 const S3_NAME = "main-storage-bucket"
 const S3_ROOT = "packages/"
 const DB_TABLE_NAME = "Packages"
 const DB = new DynamoDBClient({ region: AWS_REGION })
 const S3 = new S3Client({ region: AWS_REGION })
 
 export const handler = async (event: any) => {
   let response

   console.log("Clearing Table")
   const clearTableResult = await clearTable(DB_TABLE_NAME)
 
   if (!clearTableResult)
   {
     console.log("Sent 500.")
     response = {
       statusCode: 500,
       body: {
         error: "Server Error Resetting Registry."
       }
     }
     return response
   }
 
   console.log("Clearing S3.")
   const clearS3Result = await clearS3(S3_NAME, S3_ROOT)
 
   if (!clearS3Result)
   {
     console.error("Unable To Clear S3.")
 
     //Return success still since DB was successfull cleared
   }
   
   console.log("Sent 200.")
   response = {
     statusCode: 200,
     body: "Registry Reset.",
   }
   return response
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
 