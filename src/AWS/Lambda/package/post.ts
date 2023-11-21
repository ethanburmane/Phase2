/**
 * This file hosts the code for executing the code for POST host/package
 *
 * This Lambda function should interact with the S3 bucket containing all of the package information
 *
 *
 */


const MIN_PKG_SCORE = 0.5

export const handler = async (event: any, context: any) => {
  let response
  console.log(event)
  const headers = event.headers
  const body = event.body

  // Validate request
  if ((body.Content && body.URL) || (!body.Content && !body.URL)) {
    // Return 4xx code since the body is not formatted correctly
    response = {
      statusCode: 400,
      body: {
        error: 'Invalid request format.',
      },
    }
    return response
  }
  // Need the url for the package
  let url
  if (body.Content) {
    url = extractUrlFromContent(body.Content)
  } else {
    url = body.URL
  }

  // Need to score the package
  const score = calculateNetScore(url)
  if (score > MIN_PKG_SCORE) {
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