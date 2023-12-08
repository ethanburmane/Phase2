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
exports.calculateReviewPercentage = exports.calculateDependency = exports.calculateLicenseCompliance = exports.calculateResponsiveness = exports.calculateRampUpTime = exports.calculateCorrectness = exports.calculateBusFactor = void 0;
// funciton imports
var utils = require("./utils");
var gh_service_1 = require("../services/gh-service");
var gh_api_1 = require("../services/gh-api");
var logger_1 = require("../logger");
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
// Bus Factor Calculations
function calculateBusFactor(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, data, criticalContrubitorCommits, totalCommits, criticalContributorPullRequests, totalPullRequests, commitWeight, prWeight, critBusFactor, totalBusFactor, busFactorScore;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Bus Factor');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    data = null;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, gh_service_1.getBusFactorData)(link)];
                case 2:
                    data = _b.sent();
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4:
                    criticalContrubitorCommits = data.criticalContrubitorCommits, totalCommits = data.totalCommits, criticalContributorPullRequests = data.criticalContributorPullRequests, totalPullRequests = data.totalPullRequests;
                    logger_1["default"].debug("criticalContrubitorCommits: ".concat(criticalContrubitorCommits, ", totalCommits: ").concat(totalCommits, ", criticalContributorPullRequests: ").concat(criticalContributorPullRequests, ", totalPullRequests: ").concat(totalPullRequests));
                    commitWeight = 0.4;
                    prWeight = 0.6;
                    critBusFactor = criticalContrubitorCommits * commitWeight +
                        criticalContributorPullRequests * prWeight;
                    totalBusFactor = totalCommits * commitWeight + totalPullRequests * prWeight;
                    busFactorScore = 1 - critBusFactor / totalBusFactor;
                    // round to 3 decimal places
                    busFactorScore = utils.round(busFactorScore, 3);
                    return [2 /*return*/, busFactorScore];
            }
        });
    });
}
exports.calculateBusFactor = calculateBusFactor;
// Correctness Calculations
function calculateCorrectness(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, data, closedIssues, openIssues, totalIssues, correctnessScore;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Correctness');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    data = null;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, gh_service_1.getCorrectnessData)(link)];
                case 2:
                    data = _b.sent();
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4:
                    closedIssues = data.closedIssues, openIssues = data.openIssues;
                    logger_1["default"].debug("closedIssues: ".concat(closedIssues, ", openIssues: ").concat(openIssues));
                    totalIssues = closedIssues + openIssues;
                    if (totalIssues === 0) {
                        return [2 /*return*/, 0];
                    }
                    correctnessScore = closedIssues / totalIssues;
                    // round to 3 decimal places
                    correctnessScore = utils.round(correctnessScore, 3);
                    return [2 /*return*/, correctnessScore];
            }
        });
    });
}
exports.calculateCorrectness = calculateCorrectness;
// // Ramp-up Time Calculations
function calculateRampUpTime(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, localPath, parts, repoName, files, linesOfCode, rampUpScore;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Ramp Up Time');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link;
                    }
                    else {
                        console.error('Invalid URL or unable to process the link.');
                        return [2 /*return*/, 0];
                    }
                    console.log("Processed link: ".concat(link));
                    localPath = 'dist/middleware/cloned-repos';
                    parts = url.split('/');
                    repoName = parts[parts.length - 1] || parts[parts.length - 2];
                    if (repoName) {
                        localPath = path.join(localPath, repoName);
                    }
                    try {
                        if (!fs.existsSync(localPath)) {
                            console.log("Creating directory: ".concat(localPath));
                            fs.mkdirSync(localPath, { recursive: true });
                            console.log("Attempting to clone repository into: ".concat(localPath));
                            (0, child_process_1.execSync)("git clone ".concat(link, " ").concat(localPath), { stdio: 'inherit' });
                        }
                        else {
                            console.log("Directory already exists: ".concat(localPath));
                            files = fs.readdirSync(localPath);
                            if (files.length === 0) {
                                console.log("Directory is empty. Cloning repository into: ".concat(localPath));
                                (0, child_process_1.execSync)("git clone ".concat(link, " ").concat(localPath), { stdio: 'inherit' });
                            }
                        }
                        console.log("Starting line count in: ".concat(localPath));
                        linesOfCode = utils.countLinesOfCode(localPath);
                        console.log("Total lines of code in the repository: ".concat(linesOfCode));
                        rampUpScore = 1;
                        if (linesOfCode <= 500) {
                            rampUpScore = 1;
                        }
                        else if (linesOfCode <= 1000) {
                            rampUpScore = 0.9;
                        }
                        else if (linesOfCode <= 5000) {
                            rampUpScore = 0.8;
                        }
                        else if (linesOfCode <= 10000) {
                            rampUpScore = 0.7;
                        }
                        else if (linesOfCode <= 50000) {
                            rampUpScore = 0.6;
                        }
                        else if (linesOfCode <= 100000) {
                            rampUpScore = 0.5;
                        }
                        else if (linesOfCode <= 500000) {
                            rampUpScore = 0.4;
                        }
                        else if (linesOfCode <= 1000000) {
                            rampUpScore = 0.1;
                        }
                        return [2 /*return*/, rampUpScore];
                    }
                    catch (error) {
                        console.error("An error occurred: ".concat(error.message));
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.calculateRampUpTime = calculateRampUpTime;
// export async function calculateRampUpTime(url: string) {
//   logger.info('Calculating Ramp Up Time')
//   // checks to see if link is a npm link and if so, converts it to a github link
//   let link = await utils.evaluateLink(url)
//   if (link) {
//     link = link?.split('github.com').pop() ?? null
//     link = 'https://github.com' + link // eslint-disable-line prefer-template
//   }
//   let linesOfCode = 0
//   // get data using ./services/gh-service.ts
//   if (link) {
//     // clones the repo into ./cloned-repos
//     const repoName = utils.parseGHRepoName(link)
//     let localPath = '../ece461-project/src/middleware/cloned-repos'
//     // format local path name
//     if (repoName) {
//       localPath = path.join(localPath, repoName)
//     }
//     // add .git to end of url
//     let repoUrl = link
//     if (!link.includes('.git')) {
//       repoUrl = `${link}.git`
//     }
//     await utils.cloneRepo(link, localPath, repoUrl)
//     utils.calcRepoLines(localPath, (totalLines) => {
//       linesOfCode = totalLines
//       // console.log(totalLines)
//       logger.debug(`linesOfCode: ${linesOfCode}`)
//       let rampUpScore = 0
//       // console.log(linesOfCode)
//       if (linesOfCode <= 500) {
//         rampUpScore = 1
//       } else if (linesOfCode <= 1000) {
//         rampUpScore = 0.9
//       } else if (linesOfCode <= 5000) {
//         rampUpScore = 0.8
//       } else if (linesOfCode <= 10_000) {
//         rampUpScore = 0.7
//       } else if (linesOfCode <= 50_000) {
//         rampUpScore = 0.6
//       } else if (linesOfCode <= 100_000) {
//         rampUpScore = 0.5
//       } else if (linesOfCode <= 500_000) {
//         rampUpScore = 0.4
//       } else if (linesOfCode <= 1_000_000) {
//         rampUpScore = 0.3
//       } else if (linesOfCode <= 5_000_000) {
//         rampUpScore = 0.2
//       }
//       return rampUpScore
//     })
//   } else {
//     return () => 0
//   }
// }
// Responsiveness Calculations
function calculateResponsiveness(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, data, monthlyCommitCount, annualCommitCount, maxMonthlyCommitCount, minMonthlyCommitCount, diffCommit;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Responsiveness');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    data = null;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, gh_service_1.getResponsivenessData)(link)];
                case 2:
                    data = _b.sent();
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4:
                    monthlyCommitCount = data.monthlyCommitCount, annualCommitCount = data.annualCommitCount;
                    maxMonthlyCommitCount = Math.max.apply(Math, monthlyCommitCount);
                    minMonthlyCommitCount = Math.min.apply(Math, monthlyCommitCount);
                    console.log('maxMonthlyCommitCount', maxMonthlyCommitCount);
                    console.log('minMonthlyCommitCount', minMonthlyCommitCount);
                    diffCommit = maxMonthlyCommitCount - minMonthlyCommitCount;
                    logger_1["default"].debug("maxMonthlyCommitCount: ".concat(maxMonthlyCommitCount, ", minMonthlyCommitCount: ").concat(minMonthlyCommitCount, ", diffCommit: ").concat(diffCommit));
                    /* eslint-disable no-implicit-coercion */
                    /* eslint-disable no-else-return */
                    // assign score based oon difference between max and min monthly commits
                    if (diffCommit < annualCommitCount * 0.1) {
                        return [2 /*return*/, 1];
                    }
                    else if (diffCommit < annualCommitCount * 0.2) {
                        return [2 /*return*/, 0.9];
                    }
                    else if (diffCommit < annualCommitCount * 0.3) {
                        return [2 /*return*/, 0.8];
                    }
                    else if (diffCommit < annualCommitCount * 0.4) {
                        return [2 /*return*/, 0.7];
                    }
                    else if (diffCommit < annualCommitCount * 0.5) {
                        return [2 /*return*/, 0.6];
                    }
                    else if (diffCommit < annualCommitCount * 0.6) {
                        return [2 /*return*/, 0.5];
                    }
                    else if (diffCommit < annualCommitCount * 0.7) {
                        return [2 /*return*/, 0.4];
                    }
                    else if (diffCommit < annualCommitCount * 0.8) {
                        return [2 /*return*/, 0.3];
                    }
                    else if (diffCommit < annualCommitCount * 0.9) {
                        return [2 /*return*/, 0.2];
                    }
                    else if (diffCommit < annualCommitCount * 1) {
                        return [2 /*return*/, 0.1];
                    }
                    else {
                        return [2 /*return*/, 0];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.calculateResponsiveness = calculateResponsiveness;
// License Compliance Calculations
function calculateLicenseCompliance(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, licenseCompliantScore, readme, licenses;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating License Compliance');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    licenseCompliantScore = 0;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, utils.CloneReadme(url)];
                case 2:
                    readme = _b.sent();
                    licenses = utils.FindMatch(readme);
                    if (licenses.length > 0) {
                        console.log('true');
                        return [2 /*return*/, 1];
                    }
                    else {
                        console.log('false');
                        return [2 /*return*/, 0];
                    }
                    logger_1["default"].debug("licenseCompliantScore: ".concat(licenseCompliantScore));
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4: return [2 /*return*/, licenseCompliantScore];
            }
        });
    });
}
exports.calculateLicenseCompliance = calculateLicenseCompliance;
function calculateDependency(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, data, dev, numDep, numPin, _i, dev_1, _b, key, value, version, pinned;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger_1["default"].info('Calculating Dependency');
                    console.log('Calculating Dependency');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _c.sent();
                    console.log('link', link);
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                        link = link.replace(/\.git$/, '');
                    }
                    console.log('link after', link);
                    data = null;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, gh_service_1.getDependencyData)(link)];
                case 2:
                    data = _c.sent();
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4:
                    dev = Object.entries(data);
                    numDep = dev.length;
                    numPin = 0;
                    for (_i = 0, dev_1 = dev; _i < dev_1.length; _i++) {
                        _b = dev_1[_i], key = _b[0], value = _b[1];
                        version = value;
                        pinned = utils.isPinned(version);
                        console.log("Dependency: ".concat(key, ", Version: ").concat(version));
                        console.log(utils.isPinned(version));
                        if (pinned) { // Check if the property is a direct property of the object
                            numPin += 1;
                        }
                    }
                    console.log('numPin', numPin);
                    console.log('length', dev.length);
                    // calculate difference between the max and min monthly commits
                    if (numPin === 0) {
                        return [2 /*return*/, 1.0];
                    }
                    else {
                        return [2 /*return*/, numPin / numDep];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.calculateDependency = calculateDependency;
function calculateReviewPercentage(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, reviewPercentage, repoOwner, repoName, pullRequests, reviewedPRCount, _i, pullRequests_1, pr, isReviewed, totalPullRequests, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating License Compliance');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    reviewPercentage = 0;
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    repoOwner = link ? link.split('/')[3] : '';
                    repoName = link ? link.split('/')[4] : '';
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, (0, gh_api_1.fetchAllPullRequests)(repoOwner, repoName)];
                case 3:
                    pullRequests = _b.sent();
                    reviewedPRCount = 0;
                    _i = 0, pullRequests_1 = pullRequests;
                    _b.label = 4;
                case 4:
                    if (!(_i < pullRequests_1.length)) return [3 /*break*/, 7];
                    pr = pullRequests_1[_i];
                    return [4 /*yield*/, (0, gh_api_1.checkIfPullRequestReviewed)(repoOwner, repoName, pr.number)];
                case 5:
                    isReviewed = _b.sent();
                    if (isReviewed) {
                        reviewedPRCount += 1;
                    }
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7:
                    if (reviewedPRCount == 0) {
                        return [2 /*return*/, 0];
                    }
                    totalPullRequests = pullRequests.length;
                    reviewPercentage = (reviewedPRCount / totalPullRequests) * 1.5;
                    //scale up 
                    if (reviewPercentage > 1) {
                        reviewPercentage = 1;
                    }
                    console.log("Reviewed Pull Requests: ".concat(reviewedPRCount));
                    console.log("Total Pull Requests: ".concat(totalPullRequests));
                    console.log("Review Percentage: ".concat(reviewPercentage.toFixed(2), "%"));
                    return [2 /*return*/, (1 - reviewPercentage)];
                case 8:
                    error_1 = _b.sent();
                    console.error("Error calculating review percentage:", error_1);
                    return [2 /*return*/, -1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.calculateReviewPercentage = calculateReviewPercentage;
