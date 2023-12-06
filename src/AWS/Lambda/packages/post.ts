/**
 * This file hosts the code for executing the code for POST host/packages
 *
 * This Lambda function should search the registry..
 *
 */

const { DynamoDBClient, QueryCommand, ScanCommand } = require("@aws-sdk/client-dynamodb")
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

  const offset = extractOffset(event)
  const pkgQuery: any[] = extractQueryFromEvent(event)

  const searchResult = await performDBQuery(pkgQuery, offset)

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
      packages: items
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

async function performDBQuery(query: any[], offset: number)
{
  return await scanDB(query, offset)
}

async function scanDB(query: any[], offset: number)
{
  let scanResult
  if (query[0] === "*")
  {
    scanResult = await fullDBScan(offset)
  }
  else 
  {
    scanResult = await partialDBScan(query)
  }

  return scanResult
}

async function partialDBScan(query: any[])
{
  let items: any[] = []
  await query.forEach(async (pkg: any) =>
  {  const params = {
      TableName: DB_TABLE_NAME,
      KeyConditionExpression: '#N = :n',
      ExpressionAttributeNames: {
        '#N': 'Name' // Replace 'Name' with your actual attribute name
      },
      ExpressionAttributeValues: {
        ':n': { S: pkg.Name } // Replace 'S' with the appropriate data type of the attribute
      }
    };

    const command = new QueryCommand(params);
    const result = await DB.send(command);
    if (result.$metadata.httpStatusCode === 200 && result.Items)
    {
      let filtered = filterQuery(result.Items, pkg.Version)
      filtered.forEach((item: any) =>
      {
        items.push(item)
      })
    }
    else 
    {
      return false
    }
  })

  return items;
}

function filterQuery(items: any[], versionExp: string)
{
  let filtered: any[] = []
  items.forEach((item: any) =>
  {
    if (versionMatch(versionExp, item))
    {
      filtered.push(item)
    }
  })
  return filtered
}

function versionMatch(exp: string, item: any) : boolean
{
  const exactVersionRegex = /^\(?(\d+)\.(\d+)\.(\d+)\)?$/;
  const boundedRangeRegex = /^(\()?\d+\.\d+\.\d+(-\d+\.\d+\.\d+)?(\))?$/;
  const caretRegex = /^\^(\d+)\.(\d+)\.(\d+)$/;
  const tildeRegex = /^~(\d+)\.(\d+)\.(\d+)$/;

  if (exactVersionRegex.test(exp))
  {
    return isExactVersion(item.Version, exp)
  }
  else if (boundedRangeRegex.test(exp))
  {
    return isWithinBoundedRange(item.Version, exp)
  }
  else if (caretRegex.test(exp))
  {
    return isCaretVersion(item.Version, exp)
  }
  else if (tildeRegex.test(exp))
  {
    return isTildeVersion(item.Version, exp)
  }

  return false
}

function isExactVersion(version: string, targetVersion: string): boolean 
{
  return version === targetVersion;
}

function isCaretVersion(version: string, caretRange: string): boolean 
{
  const caretRegex = /^\^(\d+)\.(\d+)\.(\d+)$/;

  const [, major, minor, patch] = caretRange.match(caretRegex) || [];
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);

  return (
    vMajor === Number(major) &&
    vMinor >= Number(minor) &&
    (vMinor > Number(minor) || vPatch >= Number(patch))
  );
}

function isWithinBoundedRange(version: string, range: string): boolean 
{
  const boundedRangeRegex = /^(\()?\d+\.\d+\.\d+(-\d+\.\d+\.\d+)?(\))?$/;

  const [startRange, endRange] = range.split('-').map(v => v.replace(/[()]/g, ''));

  const isGreaterThanOrEqualToStart = compareVersions(version, startRange) >= 0;
  const isLessThanOrEqualToEnd = compareVersions(version, endRange || startRange) <= 0;

  return isGreaterThanOrEqualToStart && isLessThanOrEqualToEnd;
}

function compareVersions(v1: string, v2: string): number
{
  const s1 = v1.split('.').map(Number);
  const s2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(s1.length, s2.length); i++) {
    const n1 = s1[i] || 0;
    const n2 = s2[i] || 0;
    if (n1 !== n2) {
      return n1 - n2;
    }
  }
  return 0;
}

function isTildeVersion(version: string, tildeRange: string): boolean
{
  const tildeRegex = /^~(\d+)\.(\d+)\.(\d+)$/;

  const [, major, minor, patch] = tildeRange.match(tildeRegex) || [];
  const [vMajor, vMinor, vPatch] = version.split('.').map(Number);

  return (
    vMajor === Number(major) &&
    vMinor === Number(minor) &&
    vPatch >= Number(patch)
  );
}



async function fullDBScan(offset: number)
{
  const pageSize = 100;

  let lastEvaluatedKey = null;
  let items: any[] = [];

  for (let i = 0; i < offset; i++) {
    const params = {
      TableName: DB_TABLE_NAME,
      Limit: pageSize,
      ExclusiveStartKey: lastEvaluatedKey
    };

    const command = new ScanCommand(params);
    const dbScanResult = await DB.send(command);
    console.log("Scan Result\n", dbScanResult)
    if (dbScanResult.$metadata.httpStatusCode !== 200) {return false}
    
    const lastKey: any = dbScanResult.LastEvaluatedKey
    const scanItems = dbScanResult.Items


    if (lastKey === undefined || lastKey === null) {
      // No more items to read, break the loop
      items = scanItems;
      break;
    }

    lastEvaluatedKey = lastKey;
    items = scanItems;
  }

  return items;
}

function formatScanItems(scanItems: any)
{
  let items: any[] = []
  scanItems.forEach((item: any) =>
  {
    // Need name and version
    items.push({
      Name: item.Name.S,
      Version: item.Version.S,
      id: item.id.S
    })
  })
  return items
}

function extractOffset(event: any)
{
  if (event.queryStringParameters && event.queryStringParameters.offset)
  {
    return event.queryStringParameters.offset
  }
  return false
}