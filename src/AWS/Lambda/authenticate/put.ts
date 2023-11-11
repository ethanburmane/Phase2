/**
 * This file hosts the code for executing the code for PUT host/authenticate
 *
 * This Lambda function should create an access token. When a user passes in a username and secret
 *
 */
import * as crypto from 'crypto';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

export const handler = async (event: any) => {
  // TODO implement

  //Process event for valid user credentials (check against registered users)
  try {
    const user = event.User?.name;
    const isAdmin = event.User?.isAdmin;
    const password = event.User?.password;

    // Incorrect AuthenticationRequest Handling
    if (!user || typeof user !== 'string' || !password || typeof password !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify('There is missing field(s) in the AuthenticationRequest or it is formed improperly.'),
      };
    }
  
  // Create response
  const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
  const bearerToken = '${user}.${hashedPassword}';   //Generate bearer token
  
  // Update Database
  const tokenTimestamp = new Date().toISOString();

  // DynamoDB update
  const dynamoParams = {
    TableName: 'YourDynamoDBTableName',
    Item: {
      'UserID': user, // Assuming you use UserID as a primary key
      'LastBearer': {
        'date': tokenTimestamp,
        'value': bearerToken
      }
    }
  };

  // S3 Update
  const s3Params = {
    Bucket: 'YourBucketName', // replace with your bucket name
    Key: `bearerTokens/${user}.txt`, // the file will be named after the user
    Body: JSON.stringify({
      token: bearerToken,
      timestamp: new Date().toISOString()
    }),
    ContentType: 'application/json'
  };

  await dynamoDb.put(dynamoParams).promise();
  await s3.putObject(s3Params).promise();

  // Send response
  // Return code 200 and bearer token if successful
  const response = {
    statusCode: 200,
    body: JSON.stringify({token : bearerToken}),
  };
  console.log(event)
  return response;
  } catch (error) {
    console.log(error)
    return {
      statusCode: 500,
      body: JSON.stringify('There was an error with the request.'),
    };
  }
}
