/**
 * This file hosts the code for executing the code for GET host/package/byName/{name}
 *
 * This Lambda function should return the package given by name.
 * 
 * Path parameters:
 * 
 * Headers:
 *
 */

import { S3Client, GetObjectCommand, GetObjectLegalHoldCommand } from "@aws-sdk/client-s3"; // ES Modules import

const config = {}
const s3_client = new S3Client(config)
const s3_cmd_input = {
  Bucket: "main-storage-bucket", // required
  Key: "packages/test/test.zip" // required
}
const command = new GetObjectCommand(s3_cmd_input)

export const handler = async (event: any) => {
  const target = event.Name

  const r = await s3_client.send(command)
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
