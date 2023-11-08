/**
 * This file hosts the code for executing the code for GET host/package/{id}
 *
 * This Lambda function should return the package with the given id.
 *
 */

import { S3Client, GetObjectCommand, GetObjectLegalHoldCommand } from "@aws-sdk/client-s3"; // ES Modules import

const config = {}
const s3_client = new S3Client(config)


export const handler = async (event: any) => {
  // TODO implement

  //Validate bearer token --- SECURITY TEAM

  //Extract id

  // - Handle id DNE

  // - Handle id exists

  // -- Grab the package with the given id

  //Create response with package data

  const target = "test.zip"
  const s3_cmd_input = {
    Bucket: "main-storage-bucket", // required
    Key: "packages/test/" + target // required
  }
  const command = new GetObjectCommand(s3_cmd_input)
  const r = await s3_client.send(command)
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    package_content: r.Body
  }
  console.log(event)
  return response
}
