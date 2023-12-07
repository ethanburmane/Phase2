"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var axios_1 = require("axios");
var dotenv = require('dotenv');
dotenv.config();
var GITHUB_TOKEN = process.env.GITHUB_TOKEN;
var instance = axios_1["default"].create({
    baseURL: 'https://api.github.com/repos/',
    timeout: 10000,
    headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: "Bearer ".concat(GITHUB_TOKEN)
    }
});
function fetchAllPullRequests(repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var page, pullRequests, mergedPullRequests, hasNextPage, response, mergedPRs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    page = 1;
                    pullRequests = [];
                    mergedPullRequests = [];
                    hasNextPage = true;
                    console.log("Starting to fetch pull requests for ".concat(repoOwner, "/").concat(repoName));
                    _a.label = 1;
                case 1:
                    if (!(hasNextPage && page <= 1)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/pulls"), {
                            params: { state: 'all', per_page: 100, page: page }
                        })];
                case 3:
                    response = _a.sent();
                    console.log("Fetched page ".concat(page, " with ").concat(response.data.length, " pull requests."));
                    mergedPRs = response.data.filter(function (pr) { return pr.merged_at; });
                    mergedPullRequests = mergedPullRequests.concat(mergedPRs);
                    hasNextPage = response.data.length === 100;
                    page += 1;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error fetching pull requests for page ".concat(page, ":"), error_1.message);
                    throw error_1;
                case 5: return [3 /*break*/, 1];
                case 6:
                    console.log("Finished fetching pull requests. Total count: ".concat(mergedPullRequests.length));
                    return [2 /*return*/, mergedPullRequests];
            }
        });
    });
}
function checkIfPullRequestReviewed(repoOwner, repoName, pullNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var reviewsResponse, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/pulls/").concat(pullNumber, "/reviews"))];
                case 1:
                    reviewsResponse = _a.sent();
                    return [2 /*return*/, reviewsResponse.data.length > 0];
                case 2:
                    error_2 = _a.sent();
                    console.error("Error checking reviews for pull request #".concat(pullNumber, ":"), error_2.message);
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function calculateReviewPercentage(repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var pullRequests, reviewedPRCount, _i, pullRequests_1, pr, isReviewed, totalPullRequests, reviewPercentage, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, fetchAllPullRequests(repoOwner, repoName)];
                case 1:
                    pullRequests = _a.sent();
                    reviewedPRCount = 0;
                    _i = 0, pullRequests_1 = pullRequests;
                    _a.label = 2;
                case 2:
                    if (!(_i < pullRequests_1.length)) return [3 /*break*/, 5];
                    pr = pullRequests_1[_i];
                    return [4 /*yield*/, checkIfPullRequestReviewed(repoOwner, repoName, pr.number)];
                case 3:
                    isReviewed = _a.sent();
                    if (isReviewed) {
                        reviewedPRCount += 1;
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    totalPullRequests = pullRequests.length;
                    reviewPercentage = (reviewedPRCount / totalPullRequests) * 100;
                    console.log("Reviewed Pull Requests: ".concat(reviewedPRCount));
                    console.log("Total Pull Requests: ".concat(totalPullRequests));
                    console.log("Review Percentage: ".concat(reviewPercentage.toFixed(2), "%"));
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Error calculating review percentage:", error_3.message);
                    return [2 /*return*/, [-1, -1, -1]];
                case 7: return [2 /*return*/];
            }
        });
    });
}
var repoOwner = 'django'; // Example, replace with actual values
var repoName = 'django'; // Example, replace with actual values
calculateReviewPercentage(repoOwner, repoName);
function fetchPageOfPullRequests(repoOwner, repoName, page) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/pulls"), {
                        params: { state: 'closed', per_page: 100, page: page }
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.filter(function (pr) { return pr.merged_at; })];
            }
        });
    });
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
function searchMergedPullRequests(repoOwner, repoName, page) {
    return __awaiter(this, void 0, void 0, function () {
        var query, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    query = "repo:".concat(repoOwner, "/").concat(repoName, "+is:pr+is:merged");
                    return [4 /*yield*/, instance.get("search/issues", {
                            params: { q: query, per_page: 100, page: page }
                        })];
                case 1:
                    response = _a.sent();
                    // The Search API returns items within an object
                    return [2 /*return*/, response.data.items || []];
            }
        });
    });
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
