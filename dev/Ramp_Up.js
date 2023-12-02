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
exports.calculateRampUpTime = void 0;
var logger_1 = require("../src/logger");
var utils = require("../src/middleware/utils");
var path = require("path");
var fs = require("fs");
// Ramp-up Time Calculations
function calculateRampUpTime(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, linesOfCode, repoName, localPath, repoUrl;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('Calculating Ramp Up Time');
                    return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    linesOfCode = 0;
                    if (!link) return [3 /*break*/, 3];
                    repoName = utils.parseGHRepoName(link);
                    localPath = '../src/middleware/cloned-repos';
                    // format local path name
                    if (repoName) {
                        localPath = path.join(localPath, repoName);
                    }
                    repoUrl = link;
                    if (!link.includes('.git')) {
                        repoUrl = "".concat(link, ".git");
                    }
                    return [4 /*yield*/, utils.cloneRepo(link, localPath, repoUrl)];
                case 2:
                    _b.sent();
                    utils.calcRepoLines(localPath, function (totalLines) {
                        linesOfCode = totalLines;
                        // console.log(totalLines)
                        logger_1["default"].debug("linesOfCode: ".concat(linesOfCode));
                        var rampUpScore = 0;
                        // console.log(linesOfCode)
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
                            rampUpScore = 0.3;
                        }
                        else if (linesOfCode <= 5000000) {
                            rampUpScore = 0.2;
                        }
                        return rampUpScore;
                    });
                    return [3 /*break*/, 4];
                case 3: return [2 /*return*/, function () { return 0; }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.calculateRampUpTime = calculateRampUpTime;
async;
get_num_files(pkg, Package);
{
    var UrlRepo = pkg.url;
    if (pkg.type !== 'unknown') {
        var repoPath = path.join(__dirname, 'clone'); // Specify the directory where you want to clone the repository
        try {
            var files = fs.readdirSync(repoPath);
            // Check if the directory is not empty
            if (files.length > 0) {
                // Clear the directory by removing all files and subdirectories
                for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
                    var file = files_1[_i];
                    var filePath = path.join(repoPath, file);
                    var stat = fs.statSync(filePath);
                    if (stat.isDirectory()) {
                        // Remove subdirectories and their contents
                        fs.rmSync(filePath, { recursive: true });
                    }
                    else {
                        // Remove files
                        fs.unlinkSync(filePath);
                    }
                }
            }
            // Clone the repository
            await execSync("git clone ".concat(UrlRepo, " ").concat(repoPath));
            //report the number of files in the directory
        }
        catch (error) {
            console.error("An error occurred: ".concat(error.message));
        }
        var fileCount = this.countFilesInDirectory(repoPath);
        console.log("fileCount", fileCount);
        return fileCount;
    }
}
