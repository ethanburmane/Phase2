/**
 * This file hosts the code for executing the code for DELETE host/reset
 *
 * This Lambda function should reset the system to a default state. This includes clearing all stored users and packages.
 *
 */

import { ListObjectsV2Command, DeleteObjectsCommand, S3Client } from '@aws-sdk/client-s3'

const AWS_REGION = "us-east-2"
const PACKAGE_S3 = "main-storage-bucket"
const S3_PACKAGE_ROOT = "packages/"

export const handler = async (event: any) => {
  // TODO implement

  //Authenticate credentials

  //Empty the S3
  const s3_credentials = {}
  
  const bucket_name = "main-storage-bucket"
  const folder_key = "packages/"

  const s3 = new S3Client({ "region": region });

  // try {
  //   const listObjectsCommand = new ListObjectsV2Command({
  //     Bucket: bucket_name,
  //     Prefix: folder_key,
  //   });

  //   const resp = await s3.send(listObjectsCommand);

  //   const contents = resp.Contents;

  //   contents.forEach((object: any) => {
  //     console.log('Object Key:', object.Key);
  //   });
  // }
  // catch (error) {
  //   console.error('Error listing contents of the folder:', error);
  // }
  // try
  // {
  //   const command = new DeleteObjectsCommand({
  //     Bucket: bucket_name,
  //     Delete: {
  //       Objects:[

  //       ]
  //     }
  //     });
  // }
  // catch (error)
  // {
  //   //Return 500
  // }
  
  //Empty the DB

  //Create response
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
