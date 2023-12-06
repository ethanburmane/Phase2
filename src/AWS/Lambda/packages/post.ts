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
  
  const reqValidResult = validateRequest(event)

  if (reqValidResult === false)
  {
    response = {
      statusCode: 400,
      body: {
        error: "Bad request."
      }
    }
    return response
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
  return typeof query === 'object' && query.Name && query.Name instanceof String 
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
    return queryArrayIsValid(body)
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
  if (query[0].Name === "*")
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
  let items = [];
    for (const pkg of query) {
        const params = {
            TableName: DB_TABLE_NAME,
            FilterExpression: '#N = :n',
            ExpressionAttributeNames: {
                '#N': 'Name'
            },
            ExpressionAttributeValues: {
                ':n': { S: pkg.Name }
            }
        };

        console.log("Sending Scan command");
        const command = new ScanCommand(params);
        try {
            const result = await DB.send(command);

            if (result && result.Items && result.Items.length > 0) {
                console.log("Scan successful", result);
                items = filterQuery(result.Items, pkg.Version)
                
            } else {
                console.log("No items found for Name:", pkg.Name);
            }
        } catch (error) {
            console.error("Error occurred during scan:", error);
            return false
        }
    }

    console.log(items);
    return items;
}

function filterQuery(items: any[], versionExp: string)
{
  if (!versionExp)
  {
    return items
  }

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
    return isExactVersion(item.Version.S, exp)
  }
  else if (boundedRangeRegex.test(exp))
  {
    return isWithinBoundedRange(item.Version.S, exp)
  }
  else if (caretRegex.test(exp))
  {
    return isCaretVersion(item.Version.S, exp)
  }
  else if (tildeRegex.test(exp))
  {
    return isTildeVersion(item.Version.S, exp)
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
      ID: item.id.S
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
  return 1
}