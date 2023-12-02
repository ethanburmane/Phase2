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
exports.calculateRampUpTime = exports.CloneReadme = void 0;
var logger_1 = require("../src/logger");
var utils = require("../src/middleware/utils");
var path = require("path");
var fs = require("fs");
var child_process_1 = require("child_process");
var axios_1 = require("axios");
function CloneReadme(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].get(url, {
                            headers: {
                                Authorization: "token ".concat(process.env.GIT_TOKEN),
                                Accept: 'application/vnd.github.VERSION.raw'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    // Return the README file content as a string.
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    throw new Error(error_1.response ? error_1.response.data : error_1.message);
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.CloneReadme = CloneReadme;
function countFilesInDirectory(dirPath) {
    var fileCount = 0;
    // Read the contents of the directory
    var contents = fs.readdirSync(dirPath);
    contents.forEach(function (item) {
        var itemPath = path.join(dirPath, item);
        // Check if it's a directory
        if (fs.statSync(itemPath).isDirectory()) {
            // If it's a directory, recursively count files in it
            fileCount += countFilesInDirectory(itemPath);
        }
        else {
            // If it's a file, increment the file count
            fileCount++;
        }
    });
    return fileCount;
}
function get_num_files(url, location) {
    return __awaiter(this, void 0, void 0, function () {
        var fileCount, repoPath, files, _i, files_1, file, filePath, stat, fileCount_1;
        return __generator(this, function (_a) {
            fileCount = 0;
            repoPath = location //path.join(__dirname, location); // Specify the directory where you want to clone the repository
            ;
            console.log('repoPath', repoPath);
            if (!fs.existsSync(repoPath)) {
                fs.mkdirSync(repoPath);
            }
            try {
                files = fs.readdirSync(repoPath);
                // Check if the directory is not empty
                if (files.length > 0) {
                    // Clear the directory by removing all files and subdirectories
                    for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                        file = files_1[_i];
                        console.log('removing file');
                        filePath = path.join(repoPath, file);
                        stat = fs.statSync(filePath);
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
                (0, child_process_1.execSync)("git clone ".concat(url, " ").concat(repoPath));
                console.log("repo cloned");
                fileCount_1 = countFilesInDirectory(repoPath);
                console.log("fileCount", fileCount_1);
                //report the number of files in the directory
            }
            catch (error) {
                console.error("An error occurred: ".concat(error.message));
            }
            return [2 /*return*/, fileCount];
        });
    });
}
// Ramp-up Time Calculations
function calculateRampUpTime(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, ReadMeLen, localPath, parts, repoName, README, num_files;
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
                    console.log('link', link);
                    ReadMeLen = 0;
                    if (!link) return [3 /*break*/, 4];
                    localPath = 'dist/middleware/cloned-repos';
                    parts = url.split('/');
                    repoName = parts[parts.length - 1] || parts[parts.length - 2];
                    console.log('repoName', repoName);
                    // format local path name
                    if (repoName) {
                        localPath = path.join(localPath, repoName);
                    }
                    // add .git to end of url
                    if (!link.endsWith('.git')) {
                        // Append '.git' if not present
                        link += '.git';
                    }
                    return [4 /*yield*/, CloneReadme(link)];
                case 2:
                    README = _b.sent();
                    ReadMeLen = README.length;
                    console.log('ReadMe cloned len: ', ReadMeLen);
                    return [4 /*yield*/, get_num_files(url, localPath)];
                case 3:
                    num_files = _b.sent();
                    console.log('num_files', num_files);
                    return [2 /*return*/, num_files];
                case 4: return [2 /*return*/, function () { return 0; }];
            }
        });
    });
}
exports.calculateRampUpTime = calculateRampUpTime;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var url, rs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://github.com/django/django';
                    return [4 /*yield*/, calculateRampUpTime(url)];
                case 1:
                    rs = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
