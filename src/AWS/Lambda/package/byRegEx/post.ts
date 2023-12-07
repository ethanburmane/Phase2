
// use the require function

const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb")


// Define the DynamoDBItem interface based on your actual item structure
interface DynamoDBItem {
  id: { S: string };
  Name: { S: string };
  Readme: { S: string };
  // Add more attributes as needed
}

const AWS_REGION = "us-east-2";
const DB_TABLE_NAME = "Packages";
const DB = new DynamoDBClient({ region: AWS_REGION });

// Lambda function handler
export const handler = async (event: any) => {//* format 
  try {
    // Extract regex from the request body or query parameters
    const regex: string | undefined = event.queryStringParameters?.regex || (event.body && JSON.parse(event.body).regex);
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

// Function to fetch packages from DynamoDB that match the given regex
async function getPackagesByRegex(tableName: string, regex: string): Promise<any[]> {
  let exclusiveStartKey: any = null;
  const matchedPackages: any[] = [];

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
      const packages = scanResult.Items.map((item: DynamoDBItem) => ({
        id: item.id.S,
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

// Function to check if a given string is a valid regular expression
function isValidRegex(regex: string): boolean {
  try {
    new RegExp(regex);
    return true;
  } catch (error) {
    return false;
  }
}
