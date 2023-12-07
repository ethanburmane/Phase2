/**
 
This file hosts the code for executing the code for GET host/package/{id}*
This Lambda function should return the package with the given id.
**/
const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
 // Import AWS SDK for unmarshalling
const AWS_REGION = "us-east-2";

const DB = new DynamoDBClient({ region: AWS_REGION });

const handler = async (event) => {
  console.log("event", event);

  const path = event.path;
  const pathSegments = path.split('/');
  const itemID = pathSegments[pathSegments.length - 2]; // Adjust according to your path structure
  
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
        body: JSON.stringify(data),
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

module.exports = { handler }; // Export the handler
