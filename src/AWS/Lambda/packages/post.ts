/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should search the registry..
 *
 */

const { DynamoDBClient, BatchGetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb")
const AWS_REGION = "us-east-2"
const DB_TABLE_NAME = "Packages"
const DB = new DynamoDBClient({ region: AWS_REGION })
 

export const handler = async (event: any) => {
  let response
  
  //const reqValidResult = validateRequest(event)
  const reqValidResult = event.body && event.body instanceof Array && event.body[0].Name && event.body[0].Name === "*"

  if (!reqValidResult)
  {
    response = {
      statusCode: 400,
      body: {
        error: "Bad request."
      }
    }
  }

  //const pkgQuery: any[] = extractQueryFromEvent(event)
  const pkgQuery = [{ Name: "*" }]

  const searchResult = await performDBQuery(pkgQuery)

  if (searchResult === false)
  {
    response = {
      statusCode: 500,
      body: {
        error: "Server Error Searching DB"
      }
    }
  }

  let items: any[] = formatScanItems(searchResult)
  response = {
    statusCode: 200,
    body: {
      items: items
    }
  }
  return response
}

function queryArrayIsValid(query: any[]) : boolean
{
  return query.every(queryIsValid)
}

function queryIsValid(query: any)
{
  return typeof query === 'object' && query.Name && query.Version && typeof query.Name === 'string' && typeof query.Version === 'string'
}

function validateRequest(event: any)
{
  if (!(event.body))
  {
    return false
  }
  const body = event.body

  if (body instanceof Array)
  {
    if (body.length == 1)
    {
      return (body[0] == "*")
    }
    else 
    {
      return queryArrayIsValid(body)
    } 
  }
  return false
}

function extractQueryFromEvent(event: any) : any[]
{
  return event.body
}

async function performDBQuery(query: any[])
{
  if (query[0].Name === "*")
  {
    const scanResult = await scanDB()
    if (scanResult === false)
    {
      return false
    }

    const items = scanResult.Items

    return items
  }
  return false

  // if (query.length == 1)
  // {
  //   //fullDBSearch
  // }
  // else 
  // {

  // }
}

async function scanDB()
{
  let exclusiveStartKey = null
   const scanParams = {
       TableName: DB_TABLE_NAME,
       ExclusiveStartKey: exclusiveStartKey
   };
 
   const scanResult = await DB.send(new ScanCommand(scanParams))
   if (scanResult.$metadata.httpStatusCode !== 200) {return false}

  // TODO Log deletion success
  return scanResult
}

function formatScanItems(scanItems: any[])
{
  let items: any[] = []
  scanItems.forEach((item: any) =>
  {
    // Need name and version
    items.push({
      Name: item.Name,
      Version: item.Version
    })
  })
  return items
}