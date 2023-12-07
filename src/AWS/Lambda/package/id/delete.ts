/**
 * This file hosts the code for executing the code for DELETE host/package/{id}
 *
 * This Lambda function should delete the package with the given id.
 *
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handler = void 0;
const { DynamoDBClient, DeleteItemCommand, ScanCommand } = __nccwpck_require__(23363);
const { S3Client, DeleteObjectsCommand, ListObjectsCommand } = __nccwpck_require__(19250);
const AWS_REGION = "us-east-2";
const S3_NAME = "main-storage-bucket";
const S3_ROOT = "packages/";
const DB_TABLE_NAME = "Packages";
const DB = new DynamoDBClient({ region: AWS_REGION });
const S3 = new S3Client({ region: AWS_REGION });
const handler = async (event) => {
  let response;
  const clearTableResult = await clearTable(DB_TABLE_NAME);
  //Authenticate credentials

  //Extract the id

  //Check if the id exists

  // - Handle id DNE

  // - Handle id exists

  // Remove package from S3

  // Update DB?

  //Craft response

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  }
  console.log(event)
  return response
}
