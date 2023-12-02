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
exports.calculateLicenseCompliance = exports.calculateResponsiveness = exports.calculateCorrectness = exports.calculateBusFactor = exports.calculateReviewPercentage = void 0;
// funciton imports
var utils = require("./utils");
var gh_service_1 = require("../services/gh-service");
var logger_1 = require("../logger");
//Code Review Pull Percentage Calculations
function calculateReviewPercentage(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, data, numPullRequests, numReviewedPullRequests;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Review Pull Percentage');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    data = null;
                    if (!link) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, gh_service_1.getReviewData)(link)];
                case 2:
                    data = _b.sent();
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4:
                    numPullRequests = data.numPullRequests, numReviewedPullRequests = data.numReviewedPullRequests;
                    console.log(numPullRequests);
                    console.log(numReviewedPullRequests);
                    logger_1["default"].debug("number of Pull Requests: ".concat(numPullRequests, ", Number of Reviewed Pull Requests: ").concat(numReviewedPullRequests));
                    //if there are no pull requests, return 0
                    if (numPullRequests === 0) {
                        return [2 /*return*/, 0];
                    }
                    //if there were no reviewed pull requests, return 0
                    else if (numReviewedPullRequests === 0) {
                        return [2 /*return*/, 0];
                    }
                    else
                        return [2 /*return*/, numReviewedPullRequests / numPullRequests
                            //return reviewed pull requests / total pull requests
                        ];
                    return [2 /*return*/];
            }
        });
    });
}
exports.calculateReviewPercentage = calculateReviewPercentage;
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
        var link, licenseCompliantScore;
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
                    return [4 /*yield*/, (0, gh_service_1.getLiscenseComplianceData)(link)];
                case 2:
                    licenseCompliantScore = _b.sent();
                    logger_1["default"].debug("licenseCompliantScore: ".concat(licenseCompliantScore));
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, 0];
                case 4: return [2 /*return*/, licenseCompliantScore];
            }
        });
    });
}
exports.calculateLicenseCompliance = calculateLicenseCompliance;
