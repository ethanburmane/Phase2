/**
 * This file hosts the code for executing the code for PUT host/package/{id}
 *
 * This Lambda function should update the package given, much match name version, etc
 */
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient, GetItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
import { calculateNetScore } from "../../../../middleware/net-score";
const JSZip = require('jszip');


const AWS_REGION = "us-east-2";
const s3Client = new S3Client({ region: AWS_REGION });
const dynamoDBClient = new DynamoDBClient({ region: AWS_REGION });

export const handler = async (event: any, context: any) => {
  let response;
  console.log("UPDATE PACKAGE STARTING");
  // Validate request
  console.log("Validating event" + event);
  /*
  if (!isValidRequest(event)) {
    // Return 4xx code since the body is not formatted correctly
    console.log("Event was not valid");
    response = {
      statusCode: 400,
      body: {
        error: 'Invalid request format.',
      },
    }
    // TODO: Log response
    return response;
  }
  */

  const packageId = event.id;
  console.log("Package ID: ", packageId);

  const body = event.body;
  console.log("Body: ", JSON.stringify(body));
  const metadata = body.metadata;
  console.log("Metadata: ", JSON.stringify(metadata));
  const packageName = JSON.stringify(metadata.Name);
  console.log("Package Name: ", packageName);
  const packageVersion = JSON.stringify(metadata.Version);
  console.log("Package Version: ", packageVersion);

  let url = await extractUrlFromBody(body);
  console.log("URL: ", url);
  if (url[0] == false) {
    console.log("URL not found");
    return url[1];
  }
  

  // TODO implement
  // Check if the package exists
  const packageExists = await checkPackageExists(packageId);
  if (!packageExists) {
      return { statusCode: 404, body: JSON.stringify("Package does not exist") };
  }
  console.log("Package exists");
  // Update package in S3 and DB
    try {
        await updatePackageInS3(packageName, packageVersion, body.data.Content);
        await updatePackageInDB(packageId, body.metadata, url);
        console.log("FINISHING PACKAGE UPDATE");
        return {
            statusCode: 200,
            body: JSON.stringify("Version is updated")
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 400, body: JSON.stringify("Error updating the package") };
    }
}

function isValidRequest(event: any)
{
  /**
   * Validates event for 
   *    - body existing
   *    - Neither both content & url or neither of them
   *    - Maybe add checking github url or base64 content as well
   */

  const body = event.body;
  // check if event has id
  if (event.id === undefined || event.id === null) {
    return false
  }

  // check if body exists
  if (!body)
  {
    return false
  }

  // check if body has content or url, but not both
  if ((body.Content && body.URL) || (!(body.Content) && !(body.URL)))
  {
    return false
  }

  return true
}

async function checkPackageExists(packageId: string) {
  /**
   * Validates event for 
   *    - body existing
   *    - Neither both content & url or neither of them
   *    - Maybe add checking github url or base64 content as well
   */
  console.log("Checking if package exists: ", packageId);
  const params = {
      "TableName": "Packages",
      "Key": { "id": { S: packageId } }
  };
  const { Item } = await dynamoDBClient.send(new GetItemCommand(params));
  return !!Item;
}

async function updatePackageInS3(packageName: string, packageVersion: string, content: string) {
  console.log("Updating package in S3");
  let name = JSON.parse(packageName);
  let version = JSON.parse(packageVersion);
  const cmdInput = {
      "Body": Buffer.from(content, 'base64'), 
      "Bucket": "main-storage-bucket",
      "Key": `packages/${name}/${version}.zip`
  };

  const Item = await s3Client.send(new PutObjectCommand(cmdInput));
  console.log("Updated package in S3: ", Item);
}


async function updatePackageInDB(packageId: string, metadata: any, url: any) {
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
    const data = await dynamoDBClient.send(new GetItemCommand(get_item_params));
    curr_history = data.Item ? data.Item.History.L : [];
  }
  catch (error) {
    console.error("Error getting package history", error);
    throw error;
  } 

  curr_history.push(new_history);

  // calculate metrics
  const score = await calculateNetScore(url);
  console.log("Score: ", score);

  /*
  const new_score = {
    M: {
      "BusFactor": { S: score.busFactor },
      "Correctness": { S: score.correctness },
      "RampUp": { S: score.rampUpTime },
      "ResponsiveMaintainer": { S: score.responsiveness },
      "LicenseScore": { S: score.license },
      "GoodPinningPractice": { S: score.dependencies },
      "PullRequest": { S: score.reviewPercentage },
      "NetScore": { S: score.net }
    }
  };
  */
  const params = {
      "TableName": "Packages",
      "Key": { "id": { S: packageId } },
      "UpdateExpression": "SET #N = :n, #V = :v, #L = :l, #H = :h", //, #S = :s",
      "ExpressionAttributeNames": {
          "#N": "Name",
          "#V": "Version",
          "#L": "LastUpdated",
          "#H": "History",
          //"#S": "Score"
      },
      "ExpressionAttributeValues": {
          ":n": { S: metadata.Name },
          ":v": { S: metadata.Version },
          ":l": { S: dateString},
          ":h": { L: curr_history },
          //":s": { M: new_score }
      },
      "ReturnValues": "UPDATED_NEW"
  };
  const Item = await dynamoDBClient.send(new UpdateItemCommand(params));
  console.log("Updated package in DB: ", Item)
}

async function extractUrlFromBody(body: any)
{
  if (body.URL) { return [true, body.URL] }
  return await extractUrlFromContent(body.Content)
}

async function extractUrlFromContent(content: any)
{
  // TODO, make functions and tests
  // isValidBase64(content)
  // extractPackageJSON(unzipped)
  // extractURLFromPackageJSON(packageJSON)
  let url
  const binaryData =  zipFromBase64(content);

  //Unzip the package
  //TODO add try catch
  let jszip = new JSZip()
  const unzip_result = await jszip.loadAsync(binaryData)  
  let packageJsonFile = findPackageJson(unzip_result)
  const root = rootFromZip(unzip_result)

  //Need package.json file
  if (packageJsonFile) {
    const packageData = await packageJsonDataFromZip(unzip_result, root)

    // Need the url from the package data
    url = packageData.homepage || (packageData.repository && packageData.repository.url);
    if (!url)
    {
      const response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: {
          error: "URL not found inside package.json"
        }
      }
      return [false, response]
    }
    if (packageData.homepage)
    {
      url = packageData.homepage
    }
    else 
    {
      url = packageData.repository.url
    }

    console.log('URL found inside package.json:', url);
    // TODO log url found
  } else {
      console.log('No package.json found in the ZIP package.');
      const response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: {
          error: "No package.json found in the ZIP package."
        }
      }
      return [false, response]
  }

  return [true, url]
}

function rootFromZip(zip: any)
{
  const fileNames = Object.keys(zip.files);
  const root = fileNames[0].split('/')[0]
  return root
}

async function packageJsonDataFromZip(zip: any, root: string)
{
  const file = zip.files[root + '/package.json'];
  const content = await file.async('text');
  // Parse package.json content to extract the URL
  const packageData = JSON.parse(content);

  return packageData
}

function findPackageJson(unzipped: any)
{
  const fileNames = Object.keys(unzipped.files);
  const root = fileNames[0].split('/')[0]
  let packageJsonFile = undefined
  console.log("Files found:\n" + fileNames)
  for (let i = 0; i < fileNames.length; i++) {
      const split = fileNames[i].split('/')
      if (split.length >= 2) { 
          if (split[1] === 'package.json') { 
              packageJsonFile = true 
              break
          }
      }
  }
  return packageJsonFile
}

function zipFromBase64(base64: string)
{
  return Buffer.from(base64, "base64")
}
