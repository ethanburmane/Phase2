import { calculateBusFactor, calculateReviewPercentage } from '../src/middleware/metric-calculations'
import axios from 'axios'
import logger from '../src/logger';

async function fetchPullRequests(instance, repoOwner, repoName) {
    let page = 1;
    let pullRequests = [];
    let hasNextPage = true;

    //while (hasNextPage) {
        const response = await instance.get(`${repoOwner}/${repoName}/pulls`, {
            params: { state: 'all', per_page: 100, page },
        });

        pullRequests = pullRequests.concat(response.data);

        // Check if there are more pages
        // hasNextPage = response.data.length === 100;
        // page += 1;
    //}

    return pullRequests;
}

async function checkReviewedPullRequests(instance, repoOwner, repoName, pullRequests) {
    let reviewedpullrequests = 0;

    for (const pr of pullRequests) {
        const eventsResponse = await instance.get(`${repoOwner}/${repoName}/issues/${pr.number}/events`);
        const reviewEvents = eventsResponse.data.filter(event => event.event === 'review_requested' || event.event === 'review_request_removed');
        
        if (reviewEvents.length > 0) {
            reviewedpullrequests += 1;
        }
    }
    return reviewedpullrequests;


}
async function main() {
    const GITHUB_TOKEN = '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'
    const test = 'https://github.com/cloudinary/cloudinary_npm'
    const test2 = 'https://github.com/django/django'

    const instance = axios.create({
        baseURL: 'https://api.github.com/repos/',
        timeout: 10000,
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      });
    
    const repoOwner = test2.split('/')[3];
    const repoName = test2.split('/')[4];
    
    

    try {
        const pullRequests = await fetchPullRequests(instance, repoOwner, repoName);
        const reviewedPRCount = await checkReviewedPullRequests(instance, repoOwner, repoName, pullRequests);

        const totalpullrequests = pullRequests.length;
        const reviewPercentage = (reviewedPRCount / totalpullrequests) * 100;

        console.log("Reviewed Pull Requests:", reviewedPRCount);
        console.log("Total Pull Requests:", totalpullrequests);
        console.log("Review Percentage:", reviewPercentage.toFixed(2) + '%');
    } catch (error) {
        console.error('error', error);
        logger.info('GH_API: getPullRequestData failed');
        return [-1, -1, -1] as const;
    }

//         const response = await instance.get(
//           `${repoOwner}/${repoName}/pulls`,
//           {
//             params: {state: 'all', per_page: 100}, 
//           },
//         )
    
//     let reviewedpullrequests: number = 0
//     const totalpullrequests: number = response.data.length

//     for (let i = 0; i < totalpullrequests; i += 1) {
//         //get the number of reviewed pull requests
//         const pullNumber = response.data[i].number;
//         const reviewResponse = await instance.get(`${repoOwner}/${repoName}/pulls/${pullNumber}/reviews`);
//         if (reviewResponse.data.length > 0) {
//             reviewedpullrequests += 1;
//         }
//         // if (response.data[i].requested_reviewers.length > 0) {
//         //   logger.debug('GH_API: getRequestedReviewers {', response.data[i].requested_reviewers, '}')
//         //   reviewedpullrequests += 1
//         // }
//     }
//     //const testDjango = await calculateReviewPercentage(test)
//     //console.log(testDjango);
    
//     console.log("reviewed requests", reviewedpullrequests);
//     console.log("total requests", totalpullrequests);
//     } catch {
//     console.log('error');
//     logger.info('GH_API: getPullRequestData failed')
//     return [-1, -1, -1] as const
//   }
}


main();