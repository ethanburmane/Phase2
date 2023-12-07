/**
 * This file hosts the code for executing the code for POST host/package/byRegEx
 *
 * This Lambda function should return any packages matching the regex by name or readme.
 *
 */

 import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

const AWS_REGION = "us-east-2";
const DB_TABLE_NAME = "Packages";
const DB = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event: any) => {
  try {
    // Extract regex from the request body or query parameters
    const regex = event.queryStringParameters?.regex || (event.body && JSON.parse(event.body).regex);
    if (!regex) {
      return {
        statusCode: 400,
        body: JSON.stringify('Missing regex parameter'),
      };
    }

    // Validate regex
    if (!isValidRegex(regex)) {
      return {
        statusCode: 400,
        body: JSON.stringify('Invalid regex'),
      };
    }

    // Run the regex against the registry
    const matchedPackages = await getPackagesByRegex(DB_TABLE_NAME, regex);

    // Craft response with matched packages
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Packages matching the regex',
        packages: matchedPackages,
      }),
    };

    console.log(event);
    return response;
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };
  }
};

async function getPackagesByRegex(tableName: string, regex: string) {
  let exclusiveStartKey = null;
  const matchedPackages = [];

  do {
    const scanParams = {
      TableName: tableName,
      FilterExpression: 'contains(Name, :regex) OR contains(Readme, :regex)',
      ExpressionAttributeValues: {
        ':regex': regex,
      },
      ExclusiveStartKey: exclusiveStartKey,
    };

    const scanResult = await DB.send(new ScanCommand(scanParams));

    if (scanResult.Items && scanResult.Items.length > 0) {
      // Extract relevant information from each item
      const packages = scanResult.Items.map((item) => ({
        id: item.id.S, // Adjust according to your table's primary key structure
        Name: item.Name.S,
        Readme: item.Readme.S,
        // Add more attributes as needed
      }));

      matchedPackages.push(...packages);
    }

    exclusiveStartKey = scanResult.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return matchedPackages;
}

function isValidRegex(regex: string): boolean {
  try {
    new RegExp(regex);
    return true;
  } catch (error) {
    return false;
  }
}
