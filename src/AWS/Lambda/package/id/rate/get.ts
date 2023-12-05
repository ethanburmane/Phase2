/**
 * This file hosts the code for executing the code for GET host/package/{id}
 *
 * This Lambda function should return the package with the given id.
 *
 */

const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb")
const AWS_REGION = "us-east-2"

const DB = new DynamoDBClient( {region: AWS_REGION })

export const handler = async (event: any) => {
  // TODO implement
  
  
  console.log(event)
  //Extract id from ^^
  //const itemID = ...

  const itemParams = {
    TableName: "Packages",
    Item: {
      "id": ""
    }
  }

  const result = await DB.send(new GetItemCommand(itemParams))

  console.log(result)

  if (result.$metadata.httpStatusCode === 200)
  {
    //Success 
    
    //Extract score from item based on result

    //Create response from extracted score
    
    //return response
  }

  //error 
  // - Handle id DNE
  if (!result.Item) {
    return {
        statusCode: 404,
        body: JSON.stringify({ error: 'ID not found' }),
    };
  }
  
  return {}
}
