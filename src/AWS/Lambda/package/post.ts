/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */
 const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
 const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
 
//import { calculateNetScore } from '../../../middleware/net-score'
const JSZip = require('jszip')

const MIN_PKG_SCORE = 0.5
const AWS_REGION = "us-east-2"

export const handler = async (event: any, context: any) => {
  let response
  console.log(event)
  const headers = event.headers
  const body = event.body

  // Validate request
  if ((body.Content && body.URL) || (!(body.Content) && !(body.URL))) {
    // Return 4xx code since the body is not formatted correctly
    response = {
      statusCode: 400,
      body: {
        error: 'Invalid request format.',
      },
    }
    return response
  }
  // [bool, HTTPresp || url(string)]
  let urlResult = await extractUrlFromBody(body)  
  if (urlResult[0] == false)
  {
    return urlResult[1]
  }

  let url = urlResult[1]

  // Get the zipped content 

  const score = await calculateNetScore(url)

  if (score > MIN_PKG_SCORE) {
    // Perform S3 update let s3response = 
    const cmdInput = {
      Body: "zipped binary",
      Bucket: "main-storage-bucket",
      Key: "filename",
    }

    const config = {
      "region": AWS_REGION
    }

    const s3Client = new S3Client(config)
    const s3command = new PutObjectCommand(cmdInput)
    const cmdResponse = await s3Client.send(s3command)


    // Perform DB update
    const pkgName = "test-name"
    const pkgVersion = "1.0.0"
    const uploadDate = "11/25/2023"
    const itemParams = {
      "TableName": "Packages",
      "Item": {
        "id": {
          "S": "hash:name+version"
        },
        "Name": {
          "S": pkgName
        },
        "Version": {
          "S": pkgVersion
        },
        "UploadedOn": {
          "S": uploadDate
        },
        "LastModified":
        {
          "S": uploadDate
        }
      }
    }
    const db = new DynamoDBClient(config)
    const dbcommand = new PutItemCommand(itemParams)
    const dbcmdResponse = db.send(dbcommand)

    response = {
      statusCode: 200,
      body: JSON.stringify('Hello from Lambda!'),
    }
  } else {
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
  return await extractUrlFromContent(body.content)
}

async function extractUrlFromContent(content: any)
{
  // TODO, make functions and tests
  // isValidBase64(content)
  // extractPackageJSON(unzipped)
  // extractURLFromPackageJSON(packageJSON)
  let url
  const binaryData = Buffer.from(content, 'base64');

  //Unzip the package
  //TODO add try catch
  const unzip_result = await JSZip.loadAsync(binaryData).then(async (zip: any) => {   
    const fileNames = Object.keys(zip.files);
    const root = fileNames[0].split('/')[0]
    let packageJsonFile = undefined
    console.log(fileNames)
    for (let i = 0; i < fileNames.length; i++) {
        const split = fileNames[i].split('/')
        console.log(split)
        if (split.length >= 2) { 
            if (split[1] === 'package.json') { 
                packageJsonFile = true 
                break
            }
        }
    }
    

    //Need package.json file
    if (packageJsonFile) {
      const file = zip.files[root + '/package.json'];
      const content = await file.async('text');
      // Parse package.json content to extract the URL
      const packageData = JSON.parse(content);

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

      console.log('URL found inside package.json:', url);
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
  })

  return unzip_result
}

function calculateNetScore(url: any)
{
  return 1
}