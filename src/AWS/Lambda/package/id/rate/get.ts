/**
 
This file hosts the code for executing the code for GET host/package/{id}*
This Lambda function should return the package with the given id.
**/

const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const AWS_REGION = "us-east-2";
const DB = new DynamoDBClient({ region: AWS_REGION });

interface Scores {
  [key: string]: string;
}

const handler = async (event: any) => {
  //console.log("event", event);
  const itemID = event.id;
  console.log("itemID", itemID);

  const itemParams = {
      TableName: "Packages",
      Key: {
          "id": { S: event.id },
      }
  };


  try {
      const result = await DB.send(new GetItemCommand(itemParams));
      console.log("Query Result: ", result);

      if (result.Item && result.Item.Score && result.Item.Score.M) {
          const scoreMap = result.Item.Score.M as { [key: string]: { S?: string } };
          const scores: Scores = {};

          for (const [key, valueObj] of Object.entries(scoreMap)) {
              if (valueObj && valueObj.S) {
                  scores[key] = valueObj.S;
              }
          }

          console.log("Scores: ", scores);
          return {
              statusCode: 200,
              body: JSON.stringify(scores),
          };
      } else {
          console.log("Item not found or Score attribute not in expected format for ID:", itemID);
          return {
              statusCode: 404,
              body: JSON.stringify({ error: 'Item not found or Score attribute not in expected format' }),
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


export { handler };

