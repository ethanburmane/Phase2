/**
 * This file hosts the code for executing the code for GET host/package/byName/{name}
 *
 * This Lambda function should return the package given by name.
 * 
 * Path parameters:
 * 
 * Headers:
 *
 */
const {DynamoDBClient, ScanCommand }= require("@aws-sdk/client-dynamodb")

const AWS_REGION = "us-east-2"
const DB_TABLE_NAME = "Packages"
const DB = new DynamoDBClient({ region: AWS_REGION })

export const handler = async (event: any) => {
  let response
  const target = event.Name

  console.log("Checking if package %s exists", target)
  const existenceResult = await getPackage(target)

  if (existenceResult === 500)
  {
    return {
      statusCode: 500,
      body: {
        error: "Server Error"
      }
    }
  }

  if (existenceResult === 404)
  {
    return {
      statusCode: 404,
      body: {
        error: "Package Not Found"
      }
    }
  }

  //Maybe sort by version
  let history: any[] = []
  existenceResult.Items.forEach((item: any) => {
    item.History.L.forEach((M: any) => {
      const actionItem = M.M
      const temp = {
        Date: actionItem.date.S,
        PackageMetaData: {
          Name: item.Name.S,
          Version: item.Version.S,
          ID: item.id.S
        },
        Action: actionItem.type.S
      }
      history.push(temp)
    })
  })
  response = {
    statusCode: 200,
    body: history
  }
  return response
}


async function getPackage(target: string)
{
  try {
    const itemParams = {
      TableName: DB_TABLE_NAME,
      FilterExpression: '#N = :n',
      ExpressionAttributeNames: {
          '#N': 'Name'
      },
      ExpressionAttributeValues: {
          ':n': { S: target }
      }
    }
    console.log("Scanning db for name: ", target)
    const scanRes = await DB.send(new ScanCommand(itemParams))
    if (scanRes.$metadata.httpStatusCode === 200 && scanRes.Items.length > 0)
    {
      console.log("Scan Result Successful.")
      return scanRes
    }
    console.log("Scan Result Unsuccessful\n", scanRes)
    return 404
  }
  catch {
    console.error("Error occurred when checking if package exists.")
    return 500
  }
}
