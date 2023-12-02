/**
 * This file hosts the code for executing the code for GET host/package/{id}
 *
 * This Lambda function should return the package with the given id.
 *
 */

import { S3Client, GetObjectCommand, GetObjectLegalHoldCommand } from "@aws-sdk/client-s3"; // ES Modules import
import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { calculateNetScore } from "../../../../middleware/net-score";
const dynamoDb = new DynamoDB.DocumentClient();

const config = {}
const s3_client = new S3Client(config)


export const handler = async (event: any) => {
  // TODO implement
  // let response 
  // const headers = event.headers
  // const body = event.body

  // //Validate bearer token --- SECURITY TEAM
  // if ((body.Content && body.URL) || (!(body.Content) && !(body.URL))) {
  //   // Return 4xx code since the body is not formatted correctly
  //   response = {
  //     statusCode: 400,
  //     body: {
  //       error: 'Invalid request format.',
  //     },
  //   }
  //   return response
  // }
  //Extract id
  const path = event.path;
  const id = path.split('/')[1];

  const pkgName = "test-name"
  const pkgVersion = "1.0.0"
  const uploadDate = "11/25/2023"

  const params = {
    TableName: "Packages",
    "Item": {
      "id": {
        "S": "hash:name+version" 
      }
    }
  };

  const result = await dynamoDb.get(params).promise();
  // - Handle id DNE
  if (!result.Item) {
    return {
        statusCode: 404,
        body: JSON.stringify({ error: 'ID not found' }),
    };
}
  // - Handle id exists
  const { url, history } = result.Item;
  const score = await calculateNetScore(url);
  // -- Grab the package with the given id
  const newHistoryEntry = { action: 'ID_rate', date: new Date().toISOString() };
  const updatedHistory = history ? [...history, newHistoryEntry] : [newHistoryEntry];
  const updateParams = {
      TableName: 'Package',
      "Item": {
        "id": {
          "S": "hash:name+version" 
        },
      UpdateExpression: 'set history = :h',
      ExpressionAttributeValues: {
          ':h': updatedHistory,
      }
    }
  };
  //Create response with package data
  await dynamoDb.update(updateParams).promise();



  // Perform S3 update
  const target = "test.zip"
  const s3_cmd_input = {
    Bucket: "main-storage-bucket", // required
    Key: "packages/test/" + target // required
  }
  const command = new GetObjectCommand(s3_cmd_input)
  const r = await s3_client.send(command)
  const response = {
    statusCode: 200,
    body: JSON.stringify(score),
    package_content: r.Body
  }
  console.log(event)
  return response
}
