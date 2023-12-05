/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should search the registry..
 *
 */



const { DynamoDBClient, BatchGetItemCommand } = require("@aws-sdk/client-dynamodb")
const {S3Client, ListObjectsCommand } = require("@aws-sdk/client-s3")
const AWS_REGION = "us-east-2"
const S3_NAME = "main-storage-bucket"
const S3_ROOT = "packages/"
const DB_TABLE_NAME = "Packages"
const DB = new DynamoDBClient({ region: AWS_REGION })
const S3 = new S3Client({ region: AWS_REGION })

export const handler = async (event: any) => {
  let response
  // TODO implement

  
  
  return response
}


