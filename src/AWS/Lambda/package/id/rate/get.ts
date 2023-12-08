/**
 
This file hosts the code for executing the code for GET host/package/{id}*
This Lambda function should return the package with the given id.
**/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const AWS_REGION = "us-east-2";
const DB = new DynamoDBClient({ region: AWS_REGION });

interface Scores {
  [key: string]: string;
}

const handler = async (event: any) => {
  //console.log("event", event);
  const path = event.path;
  const pathSegments = path.split('/');
  const itemID = event.id;
  console.log("itemID", itemID);

  const itemParams = {
      TableName: "Packages",
      Key: {
          "id": { S: event.id },
      }
  };
  const uploadDate = new Date();
  const dateString = uploadDate.toISOString();
  const new_history = {
    M: {
      "type": {S: "UPDATE"},
      "date": {S: dateString},
    }
  }

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

          updatePackageInDB(itemID, event.body.metadata);

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

async function updatePackageInDB(packageId: string, metadata: any) {
  console.log("Updating package in DB");
  const uploadDate = new Date();
  const dateString = uploadDate.toISOString();
  const new_history = {
    M: {
      "type": {S: "UPDATE"},
      "date": {S: dateString},
    }
  }

  const get_item_params = {
    "TableName": "Packages",
    "Key": { "id": { S: packageId } },
    "ProjectionExpression": "History"
  };
  
  let curr_history;
  try {
    const data = await DynamoDBClient.send(new GetItemCommand(get_item_params));
    curr_history = data.Item ? data.Item.History.L : [];
  }
  catch (error) {
    console.error("Error getting package history", error);
    throw error;
  } 

  curr_history.push(new_history);

  const params = {
      "TableName": "Packages",
      "Key": { "id": { S: packageId } },
      "UpdateExpression": "SET #L = :l, #H = :h",
      "ExpressionAttributeNames": {
          "#L": "LastUpdated",
          "#H": "History"
      },
      "ExpressionAttributeValues": {
          ":l": { S: dateString},
          ":h": { L: curr_history }
      },
      "ReturnValues": "UPDATED_NEW"
  };
  const Item = await DynamoDBClient.send(new UpdateItemCommand(params));
  console.log("Updated package in DB: ", Item)
}
export { handler };

