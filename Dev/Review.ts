import { calculateBusFactor} from '../src/middleware/metric-calculations'
import axios from 'axios'
import logger from '../src/logger';
import {PR} from '../src/models/middleware-inputs';

const dotenv = require('dotenv');
dotenv.config();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const instance = axios.create({
    baseURL: 'https://api.github.com/repos/',
    timeout: 10000,
    headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
});

async function fetchAllPullRequests(repoOwner: string, repoName: string): Promise<PR[]> {
    let page = 1;
    let pullRequests = [];
    let mergedPullRequests = [];
    let hasNextPage = true;

    console.log(`Starting to fetch pull requests for ${repoOwner}/${repoName}`);

    while (hasNextPage && page <= 3) {
        try {
            const response = await instance.get(`${repoOwner}/${repoName}/pulls`, {
                params: { state: 'all', per_page: 100, page },
            });
            console.log(`Fetched page ${page} with ${response.data.length} pull requests.`);
            const mergedPRs = response.data.filter((pr: { merged_at: any; }) => pr.merged_at);
            mergedPullRequests = mergedPullRequests.concat(mergedPRs);
            hasNextPage = response.data.length === 100;
            page += 1;
        } catch (error) {
            console.error(`Error fetching pull requests for page ${page}:`, error.message);
            throw error;
        }
    }

    console.log(`Finished fetching pull requests. Total count: ${mergedPullRequests.length}`);
    return mergedPullRequests;
}

async function checkIfPullRequestReviewed(repoOwner: string, repoName: string, pullNumber: number) {
    try {
        const reviewsResponse = await instance.get(`${repoOwner}/${repoName}/pulls/${pullNumber}/reviews`);
        return reviewsResponse.data.length > 0;
    } catch (error) {
        console.error(`Error checking reviews for pull request #${pullNumber}:`, error.message);
        throw error;
    }
}

async function calculateReviewPercentage(repoOwner: string, repoName: string) {
    try {
        const pullRequests = await fetchAllPullRequests(repoOwner, repoName);
        let reviewedPRCount = 0;

        for (const pr of pullRequests) {
            const isReviewed = await checkIfPullRequestReviewed(repoOwner, repoName, pr.number);
            if (isReviewed) {
                reviewedPRCount += 1;
            }
        }

        const totalPullRequests = pullRequests.length;
        const reviewPercentage = (reviewedPRCount / totalPullRequests) * 100;

        console.log(`Reviewed Pull Requests: ${reviewedPRCount}`);
        console.log(`Total Pull Requests: ${totalPullRequests}`);
        console.log(`Review Percentage: ${reviewPercentage.toFixed(2)}%`);
    } catch (error) {
        console.error(`Error calculating review percentage:`, error.message);
        return [-1, -1, -1];
    }
}

const repoOwner = 'django'; // Example, replace with actual values
const repoName = 'django'; // Example, replace with actual values

calculateReviewPercentage(repoOwner, repoName);

async function fetchPageOfPullRequests(repoOwner: string, repoName: string, page: number): Promise<PR[]> {
    const response = await instance.get(`${repoOwner}/${repoName}/pulls`, {
        params: { state: 'closed', per_page: 100, page },
    });
    return response.data.filter(pr => pr.merged_at);
}

// async function fetchAllPullRequests(repoOwner: string, repoName: string, maxConcurrentPages: number = 5): Promise<PR[]> {
//     let page = 1;
//     let allMergedPullRequests: PR[] = [];
//     let shouldContinue = true;

//     console.log(`Starting to fetch merged pull requests for ${repoOwner}/${repoName}`);

//     while (shouldContinue) {
//         Explicitly type the array to match the expected promise type
//         const pageFetchPromises: Promise<PR[]>[] = [];

//         for (let i = 0; i < maxConcurrentPages; i++) {
//             pageFetchPromises.push(fetchPageOfPullRequests(repoOwner, repoName, page + i));
//         }

//         Wait for all the page fetches to complete
//         const results = await Promise.all(pageFetchPromises);

//         Process results and determine if we should continue
//         for (const pullRequests of results) {
//             allMergedPullRequests = allMergedPullRequests.concat(pullRequests);
//             shouldContinue = pullRequests.length === 100; // If any page has less than 100, it's the last page
//         }

//         Update the page counter
//         page += maxConcurrentPages;

//         If we didn't get a full page of results, we've reached the last page
//         if (!shouldContinue) {
//             break;
//         }
//     }

//     console.log(`Finished fetching merged pull requests. Total count: ${allMergedPullRequests.length}`);
//     return allMergedPullRequests;
// }

async function searchMergedPullRequests(repoOwner: string, repoName: string, page: number): Promise<PR[]> {
    const query = `repo:${repoOwner}/${repoName}+is:pr+is:merged`;
    const response = await instance.get(`search/issues`, {
        params: { q: query, per_page: 100, page },
    });
    // The Search API returns items within an object
    return response.data.items || [];
}

// async function fetchAllMergedPullRequests(repoOwner: string, repoName: string): Promise<PR[]> {
//     let page = 1;
//     let allMergedPullRequests: PR[] = [];
//     let shouldContinue = true;

//     console.log(`Starting to fetch merged pull requests for ${repoOwner}/${repoName}`);

//     while (shouldContinue) {
//         const pullRequests = await searchMergedPullRequests(repoOwner, repoName, page);

//         if (pullRequests.length > 0) {
//             allMergedPullRequests = allMergedPullRequests.concat(pullRequests);
//             page++;
//         } else {
//             shouldContinue = false;
//         }

//         // Be cautious of the rate limit
//         if (page % 30 === 0) {
//             console.log('Approaching rate limit, taking a short break...');
//             await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
//         }
//     }

//     console.log(`Finished fetching merged pull requests. Total count: ${allMergedPullRequests.length}`);
//     return allMergedPullRequests;
// }


// fetchAllMergedPullRequests(repoOwner, repoName)
//     .then(mergedPullRequests => {
//         console.log(`Fetched ${mergedPullRequests.length} merged pull requests.`);
//     })
//     .catch(error => {
//         console.error('Error fetching pull requests:', error.message);
//     });
//calculateReviewPercentage(repoOwner, repoName);
// async function main() {
//     dotenv.config();
//     const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
//     const test = 'https://github.com/cloudinary/cloudinary_npm'
//     const test2 = 'https://github.com/django/django'

//     const instance = axios.create({
//         baseURL: 'https://api.github.com/repos/',
//         timeout: 10000,
//         headers: {
//           Accept: 'application/vnd.github+json',
//           Authorization: `Bearer ${GITHUB_TOKEN}`,
//         },
//       });
    
//     const repoOwner = test2.split('/')[3];
//     const repoName = test2.split('/')[4];
    
    

//     try {
//         const pullRequests = await fetchPullRequests(instance, repoOwner, repoName);
//         const reviewedPRCount = await checkReviewedPullRequests(instance, repoOwner, repoName, pullRequests);

//         const totalpullrequests = pullRequests.length;
//         const reviewPercentage = (reviewedPRCount / totalpullrequests) * 100;

//         console.log("Reviewed Pull Requests:", reviewedPRCount);
//         console.log("Total Pull Requests:", totalpullrequests);
//         console.log("Review Percentage:", reviewPercentage.toFixed(2) + '%');
//     } catch (error) {
//         console.error('error', error);
//         logger.info('GH_API: getPullRequestData failed');
//         return [-1, -1, -1] as const;
//     }

// //         const response = await instance.get(
// //           `${repoOwner}/${repoName}/pulls`,
// //           {
// //             params: {state: 'all', per_page: 100}, 
// //           },
// //         )
    
// //     let reviewedpullrequests: number = 0
// //     const totalpullrequests: number = response.data.length

// //     for (let i = 0; i < totalpullrequests; i += 1) {
// //         //get the number of reviewed pull requests
// //         const pullNumber = response.data[i].number;
// //         const reviewResponse = await instance.get(`${repoOwner}/${repoName}/pulls/${pullNumber}/reviews`);
// //         if (reviewResponse.data.length > 0) {
// //             reviewedpullrequests += 1;
// //         }
// //         // if (response.data[i].requested_reviewers.length > 0) {
// //         //   logger.debug('GH_API: getRequestedReviewers {', response.data[i].requested_reviewers, '}')
// //         //   reviewedpullrequests += 1
// //         // }
// //     }
// //     //const testDjango = await calculateReviewPercentage(test)
// //     //console.log(testDjango);
    
// //     console.log("reviewed requests", reviewedpullrequests);
// //     console.log("total requests", totalpullrequests);
// //     } catch {
// //     console.log('error');
// //     logger.info('GH_API: getPullRequestData failed')
// //     return [-1, -1, -1] as const
// //   }
// }


//main();