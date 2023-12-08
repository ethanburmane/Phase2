// use the require function
const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

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
export const handler = async (event: any) => {
  try {
    // Extract regex from the request body
    const regex: string | undefined = event?.RegEx;

    console.log('Incoming event:', JSON.stringify(event));
    console.log('The Extracted regex:', regex);

    if (!regex) {
      return {
        statusCode: 400,
        body: JSON.stringify('Missing or invalid RegEx parameter in the request body'),
      };
    }

    // Validate regex
    if (!isValidRegex(regex)) {
      return {
        statusCode: 400,
        body: JSON.stringify('Invalid RegEx'),
      };
    }

    // Run the regex against the registry
    const matchedPackages = await getPackagesByRegex(DB_TABLE_NAME, regex);

    // Check if no packages are found
    if (matchedPackages.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify('No package found under this regex.'),
      };
    }

    // Craft response with matched packages
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Packages matching the regex',
        packages: matchedPackages,
      }),
    };

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
  try {
    const scanParams = {
      TableName: tableName,
      FilterExpression: 'contains(Name, :regex) OR contains(Readme, :regex)',
      ExpressionAttributeValues: {
        ':regex': regex,
      },
    };

    const scanResult = await DB.send(new ScanCommand(scanParams));

    // Log scan result for debugging
    console.log('DynamoDB Scan Result:', JSON.stringify(scanResult));

    // Check for empty results
    if (!scanResult.Items || scanResult.Items.length === 0) {
      console.log('No items found in DynamoDB scan result');
      return [];
    }

    // Handle potential undefined values during mapping
    const packages = scanResult.Items.map((item: DynamoDBItem) => ({
      id: item.id?.S || '',
      Name: item.Name?.S || '',
      Readme: item.Readme?.S || '',
      // Add more attributes as needed
    }));

    return packages;
  } catch (error) {
    // Log any errors during DynamoDB scan
    console.error('Error during DynamoDB scan:', error);
    return [];
  }
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
