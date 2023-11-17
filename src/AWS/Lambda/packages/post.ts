/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should return all of the packages in the registry.
 *
 */

import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

export const handler = async (event: any) => {
  // TODO implement

  // Authenticate credentials

  // Returns 'ls AWS/S3/Packages/*'
  const s3_credentials = {}
  
  const region = "us-east-2"
  const bucket_name = "main-storage-bucket"
  const folder_key = "packages/"

  const s3 = new S3Client({ region, s3_credentials });

  try {
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: bucket_name,
      Prefix: folder_key,
    });

    const resp = await s3.send(listObjectsCommand);

    const contents = resp.Contents;

    contents.forEach((object: any) => {
      console.log('Object Key:', object.Key);
    });
  }
  catch (error) {
    console.error('Error listing contents of the folder:', error);
  }
  // Create response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
