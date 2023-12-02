import { boolean } from "@oclif/core/lib/flags";
import { unzip } from "zlib";

/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */
 const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
 const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
 const axios = require('axios')
//import { calculateNetScore } from '../../../middleware/net-score'
const JSZip = require('jszip')

const MIN_PKG_SCORE = 0.5
const AWS_REGION = "us-east-2"
const PACKAGE_S3 = "main-storage-bucket"

export const handler = async (event: any, context: any) => {
  let response

  // TODO: Log request

  const headers = event.headers
  const body = event.body

  // Validate request
  console.log("Validating event" + event)
  if (!isValidRequest(event)) {
    // Return 4xx code since the body is not formatted correctly
    console.log("Event was not valid")
    response = {
      statusCode: 400,
      body: {
        error: 'Invalid request format.',
      },
    }
    // TODO: Log response

    return response
  }

  console.log("Extracing URL from body")
  let urlResult = await extractUrlFromBody(body)  
  if (urlResult[0] == false)
  {
    console.log("Unable to get url from body")
    return urlResult[1]
  }
  let url = urlResult[1]


  // TODO log "scoring url"
  console.log("Calculating score for url" + url)
  const score = await calculateNetScore(url)

  if (score > MIN_PKG_SCORE) {
    // Perform S3 update let s3response = 

    // TODO log "package has valid score of ..."
    console.log("Getting package info from body")
    let packageInfo = await packageInfoFromBody(body)
    const zipContent = packageInfo.zip
    const packageName = packageInfo.name
    const packageVersion = packageInfo.version

    const objKey =  "package/" + packageName + "/" + packageVersion + ".zip"

    const cmdInput = {
      Body: zipContent,
      Bucket: PACKAGE_S3,
      Key: objKey,
    }

    const config = {
      "region": AWS_REGION
    }

    // TODO log "sending PutObjectCommand for ..."
    console.log("Sending command to s3")
    const s3Client = new S3Client(config)
    const s3command = new PutObjectCommand(cmdInput)
    const cmdResponse = await s3Client.send(s3command)

    if (!isSuccessfulS3Response(cmdResponse))
    {
      console.log("s3 upload failed. Response:\n" + cmdResponse)
      // TODO log response info

      // TODO send response to client
      response = {
        statusCode: 500,
        body: {
          error: 'Unable to upload package',
        },
      }
      return response
    }

    const itemId = createPackageID(packageName, packageVersion)

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
        "ActionHistory":
        {
          "L": [
            {
              M: {
                "type": { S: "CREATE" },
                "date": { S: dateString },
              }
            }
          ]
        }
      }
    }

    console.log("Sending dynamo command")
    const db = new DynamoDBClient(config)
    const dbcommand = new PutItemCommand(itemParams)
    const dbcmdResponse = db.send(dbcommand)

    if (!isSuccessfulDBResponse(dbcmdResponse)) {
      // TODO log response info
      console.log("Upload to db failed. Response:\n" + dbcmdResponse)

      // TODO send response to client
      response = {
        statusCode: 500,
        body: {
          error: "Unable to upload package",
        },
      }
    }

    const base64Content = base64FromZip(zipContent)
    // TODO check base64

    response = {
      statusCode: 201,
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
    // TODO log response

  } else {
    // TODO log response
    response = {
      statusCode: 424,
      body: {
        error: 'Package rating was not high enough',
        score: score
      },
    }
  }
  return response
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
    const packageData = await packageDataFromZip(unzip_result, root)

    // Need the url from the package data
    url = packageData.homepage || (packageData.repository && packageData.repository.url);
    if (!url)
    {
      const response = {
        statusCode: 400,
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
        body: {
          error: "No package.json found in the ZIP package."
        }
      }
      return [false, response]
  }

  return [true, url]
}

function calculateNetScore(url: any)
{
  return 1
}

function isValidRequest(event: any)
{
  /**
   * Validates event for 
   *    - body existing
   *    - Neither both content & url or neither of them
   *    - Maybe add checking github url or base64 content as well
   */

  const body = event.body
  if (!body)
  {
    return false
  }

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
  const zipURL = `${repoURL}/archive/main.zip`;

  const response = await axios.get(zipURL, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
}

function createPackageID(packageName: string, packageVersion: string)
{
  return packageName + packageVersion
}

async function packageInfoFromBody(body: Record<string, any>)
{
  if (body.Content) { return await packageInfoFromContent(body.Content) }
  return await packageInfoFromURL(body.URL)
}

async function packageDataFromZip(zip: any, root: string)
{
  const file = zip.files[root + '/package.json'];
  const content = await file.async('text');
  // Parse package.json content to extract the URL
  const packageData = JSON.parse(content);

  return packageData
}

async function packageInfoFromURL(url: string)
{
  const zip = await fetchGitHubRepoAsZip(url)
  return await packageInfoFromZip(zip)
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
  const unzipped = await jszip.loadAsync(zip)

  // Locate and read the package.json file
  const packageJsonFound = findPackageJson(unzipped)

  if (!packageJsonFound)
  {
    throw new Error("Package json not found in zip file")
  }
  
  let packageJsonFile
  packageJsonFile = await packageDataFromZip(unzipped, rootFromZip(unzipped))
  const packageJsonContent = await packageJsonFile.async('text');

  // Parse the package.json content
  const parsedPackageJson = JSON.parse(packageJsonContent);

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
  return packageInfoFromZip(zipped)
}