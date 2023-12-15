/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */
 const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
 const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
 const axios = require('axios')
 const {calculateNetScore} = require("../../../middleware/net-score")
const JSZip = require('jszip')

const MIN_PKG_SCORE = 0.35
const AWS_REGION = "us-east-2"
const PACKAGE_S3 = "main-storage-bucket"
export const handler = async (event: any, context: any) => {
  let response
  // Validate request
  console.log("Validating event", event)

  if (!isValidRequest(event)) {
    // Return 4xx code since the body is not formatted correctly
    console.log("Event was not valid")
    response = {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: {
        error: 'Invalid request format.',
      },
    }
    // TODO: Log response
    return response
  }
  let body = extractBody(event)
  if (!body)
  {
    body = event
  }

  console.log("Extracing URL from body")
  let urlResult = await extractUrlFromBody(body)  
  if (urlResult[0] == false)
  {
    console.log("Unable to get url from body.")
    return urlResult[1]
  }
  let url = urlResult[1]
  

  console.log("Getting package info from body.")
  let packageInfo = await packageInfoFromBody(body)
  if (typeof packageInfo === 'number')
  {
    console.log("Sent 500")
    return {
      statusCode: 500,
      body: {
        error: "Server Error"
      }
    }
  }
  console.log(packageInfo)

  const zipContent = packageInfo.zip
  const packageName = packageInfo.name
  const packageVersion = packageInfo.version

  if (!packageName)
  {
    return {
      statusCode: 400,
      body: {
        error: "No Package Name in package.json."
      }
    }
  }

  if (!packageVersion)
  {
    return {
      statusCode: 400,
      body: {
        error: "No Version Number in package.json."
      }
    }
  }

  const itemId = createPackageID(packageName, packageVersion)

  console.log("Checking if package exists.")
  const existenceResult = await doesPackageExist(itemId)
  if (existenceResult === 500)
  {
    console.log("Server Error When checking if package exists.")
    return {
      statusCode: 500,
      body: {                
        error: "Server Error"            
      }
    }
  }
  else if (existenceResult === 409)
  {
    console.log("Package exists")
    return {
      statusCode: 409,
      body: {                
        error: "Package Already Exists"            
      }
    }
  }
  console.log("Calculating score for url" + url)
  const score = await calculateNetScore(url)
  console.log("Package Score: ", score)
  

  //Static score for now
  // let itemScore = {
  //   "BusFactor": {"S": "0.7"},
  //   "Correctness": {"S": "0.7"},
  //   "RampUp": {"S": "0.7"},
  //   "ResponsiveMaintainer": {"S": "0.7"},
  //   "LicenseScore": {"S": "1.0"},
  //   "GoodPinningPractice": {"S": "0.7"},
  //   "PullRequest": {"S": "0.7"},
  //   "NetScore": {"S": "0.7"}
  // }
  if (score.net > MIN_PKG_SCORE) {
    const objKey =  "packages/" + packageName + "/" + packageVersion + ".zip"

    const cmdInput = {
      Body: zipContent,
      Bucket: PACKAGE_S3,
      Key: objKey,
    }

    const config = {
      "region": AWS_REGION
    }

    console.log("Sending command to s3")
    const s3Client = new S3Client(config)
    const s3command = new PutObjectCommand(cmdInput)
    let cmdResponse
    try
    {
      cmdResponse = await s3Client.send(s3command)
    }
    catch (e)
    {
      console.error("Error when putting object in s3.", e)
      return {
        statusCode: 500,
        body: {
          error: "Server Error"
        }
      }
    }


    if (!isSuccessfulS3Response(cmdResponse))
    {
      console.log("s3 upload failed. Response:\n" + cmdResponse)
      // TODO log response info

      // TODO send response to client
      response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: {
          error: 'Unable to upload package',
        },
      }
      return response
    }

    // TODO create item score formatted for db entry
    
    let itemScore = {
      "BusFactor": {"S": String(score.busFactor)},
      "Correctness": {"S": String(score.correctness)},
      "RampUp": {"S": String(score.rampUpTime)},
      "ResponsiveMaintainer": {"S": String(score.responsiveness)},
      "LicenseScore": {"S": String(score.license)},
      "GoodPinningPractice": {"S": String(score.dependencies)},
      "PullRequest": {"S": String(score.reviewPercentage)},
      "NetScore": {"S": String(score.net)}
    }
    const uploadDate = new Date()
    const dateString = uploadDate.toISOString()
    const itemParams = {
      "TableName": "Packages",
      "Item": {
        "id": {
          "S": itemId
        },
        "Name": {
          "S": packageName
        },
        "Version": {
          "S": packageVersion
        },
        "UploadedOn": {
          "S": dateString
        },
        "LastModified":
        {
          "S": dateString
        },
        "History":
        {
          "L": [
            {
              "M": {
                "type": { S: "CREATE" },
                "date": { S: dateString },
              }
            }
          ]
        },
        "Score":
        {
          "M": itemScore
        }
      }
    }

    console.log("Sending dynamo command")
    console.log("Params ", itemParams)
    const db = new DynamoDBClient(config)
    const dbcommand = new PutItemCommand(itemParams)
    let dbcmdResponse = await db.send(dbcommand)

    try
    {
      dbcmdResponse = await db.send(dbcommand)
    }
    catch (e)
    {
      console.error("Error when putting object in DB.", e)
      console.log("Params", itemParams)
      return {
        statusCode: 500,
        body: {
          error: "Server Error"
        }
      }
    }

    if (!isSuccessfulDBResponse(dbcmdResponse)) {
      // TODO log response info
      console.log("Upload to db failed. Response:\n" + dbcmdResponse)

      // TODO send response to client
      response = {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST"
        },
        body: {
          error: "Unable to upload package",
        },
      }
    }

    const base64Content = base64FromZip(zipContent)
    // TODO check base64

    response = {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: {
        "metadata": {
          "Name": packageName,
          "Version": packageVersion,
          "ID": itemId
        },
        "data": {
          "Content": base64Content
        }
      },
    }
    console.log("Sent 201 Response With id ", itemId)

  } else {
    console.log("Sent 424 Response.")
    response = {
      statusCode: 424,
      headers: {
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
      },
      body: {
        error: 'Package rating was not high enough',
        score: score
      },
    }
  }
  return response
}

function extractBody(event: any)
{
  if (event.body) { return event.body }
  else { return false }
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
  const binaryData = zipFromBase64(content);

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


export function isValidRequest(event: any)
{
  /**
   * Validates event for 
   *    - body existing
   *    - Neither both content & url or neither of them
   *    - Maybe add checking github url or base64 content as well
   */

  let body = event.body
  if (!body)
  {
    body = event
  }
  
  // Can't have both or neither
  if ((body.Content && body.URL) || (!(body.Content) && !(body.URL)))
  {
    return false
  }

  return true
}

function rootFromZip(zip: any)
{
  const fileNames = Object.keys(zip.files);
  const root = fileNames[0].split('/')[0]
  return root
}

function zipFromBase64(base64: string)
{
  return Buffer.from(base64, "base64")
}

function base64FromZip(zipContent: Buffer)
{
  return zipContent.toString("base64")
}

function isSuccessfulS3Response(response: Record<string, any>)
{
  return response.$metadata.httpStatusCode == 200
}

function isSuccessfulDBResponse(response: Record<string, any>)
{
  return response.$metadata.httpStatusCode == 200
}

async function fetchGitHubRepoAsZip(repoURL: string): Promise<Buffer> {
  async function getPrimaryBranchName(repoURL: string): Promise<string> {
    const apiURL = repoURL.replace('github.com', 'api.github.com/repos') + '/branches';
    try {
      const response = await axios.get(apiURL);
      const branches = response.data;
      const primaryBranch = branches.find((branch: any) => branch.protected) || branches[0];
      return primaryBranch.name;
    } catch (error) {
      console.log("Error fetching primary branch name.", error)
      throw new Error('Error fetching primary branch name');
    }
  }

  try {
    const primaryBranchName = await getPrimaryBranchName(repoURL);
    console.log(`Attempting to fetch branch ${primaryBranchName}.`)
    const zipURL = `${repoURL}/archive/${primaryBranchName}.zip`;

    const response = await axios.get(zipURL, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.log("Error when fetching primary branch ", error)
    throw error;
  }
}


export function createPackageID(packageName: string, packageVersion: string)
{
  return packageName + packageVersion
}

async function packageInfoFromBody(body: any)
{
  if (body.Content) 
  { 
    const res = await packageInfoFromContent(body.Content) 
    return res
  }
  else 
  {
    const res = await packageInfoFromURL(body.URL)
    return res
  }
}

async function packageJsonDataFromZip(zip: any, root: string)
{
  const file = zip.files[root + '/package.json'];
  const content = await file.async('text');
  // Parse package.json content to extract the URL
  const packageData = JSON.parse(content);

  return packageData
}

async function packageInfoFromURL(url: string)
{
  try 
  {
    console.log("Attempting to fetch repo as zip.")
    const zip = await fetchGitHubRepoAsZip(url)
    console.log("Using zip to get package info.")
    return await packageInfoFromZip(zip)
  }
  catch (error: any)
  {
    console.error("Error fetching repo as zip ", error)
    return 500
  }
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

async function packageInfoFromZip(zip: Buffer)
{
  let jszip = new JSZip()
  let unzipped
  try 
  {
    console.log("Unzipping package.")
    unzipped = await jszip.loadAsync(zip)
  }
  catch (error: any)
  {
    console.log("Error unzipping package. ", error)
    return 500
  }

  // Locate and read the package.json file
  const packageJsonFound = findPackageJson(unzipped)

  if (!packageJsonFound)
  {
    return 500
  }
  
  const parsedPackageJson = await packageJsonDataFromZip(unzipped, rootFromZip(unzipped))

  // Extract package name and version
  const packageName: string = parsedPackageJson.name;
  const packageVersion: string = parsedPackageJson.version;

  return {
    "name": packageName,
    "version": packageVersion,
    "zip": zip
  }
}

async function packageInfoFromContent(content: string)
{
  const zipped = zipFromBase64(content)
  return await packageInfoFromZip(zipped)
}

async function doesPackageExist(id: string) {
  console.log("Checking if package exists")
  try {
    const db = new DynamoDBClient({ region: AWS_REGION})
    const itemParams = {
            TableName: "Packages",
            Key: {
                id: {"S": id}
            }
    }
    const data = await db.send(new GetItemCommand(itemParams));
    if (data.Item) {
        console.log("Package already exists");
        return 409
    } else {
        console.log("Package doesn't exists", data)
        return 200
    }
} catch (err) {
    console.error("Error when checking if package exists", err);
    return 500
}
}
