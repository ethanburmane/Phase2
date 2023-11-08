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

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"; // ES Modules import

const config = {}
const s3_client = new S3Client(config)

export const handler = async (event: any) => {
  // TODO implement

  //Validate bearer token --- SECURITY

  //Grab the target name from the path parameters

  //Check if the package exists in the registry

  // - Handle package DNE

  // - Handle package exists

  // -- Remove all versions from S3

  // -- Update DB 

  //Return success code

  const target = "test.zip"
  const s3_cmd_input = {
  Bucket: "main-storage-bucket", // required
  Key: "packages/test/test.zip" // required
  }
  const command = new DeleteObjectCommand(s3_cmd_input)
  const r = await s3_client.send(command)
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
