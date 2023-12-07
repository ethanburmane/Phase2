/**
 
This file hosts the code for executing the code for GET host/package/{id}*
This Lambda function should return the package with the given id.
**/

const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const AWS_REGION = "us-east-2";

const DB = new DynamoDBClient({ region: AWS_REGION });

const handler = async (event: any) => {
  console.log("event", event);

  const itemID = event.id
  console.log("itemID", itemID);

  const itemParams = {
    TableName: "Packages",
    Key: { 
      "id": { S: itemID }
    }
  };

  try {
    const result = await DB.send(new GetItemCommand(itemParams));
    console.log("Query Result: ", result);

    if (result.Item) {
      // Convert DynamoDB format to standard JavaScript object
      //const data = AWS.DynamoDB.Converter.unmarshall(result.Item);
      console.log('Item', result.Item);
      // Assuming the result looks as described, create a response
      return {
        statusCode: 200,
        body: JSON.stringify(result.Item),

      };
    } else {
      // Item not found
      console.log("Item not found for ID:", itemID);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'ID not found' }),
      };
    }
  } catch (error) {
    console.error("Error during database query:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

