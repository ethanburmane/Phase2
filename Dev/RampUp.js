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
var child_process_1 = require("child_process");
function countLinesOfCode(dirPath) {
    var codeExtensions = new Set([
        '.js', '.py', '.java', '.cs', '.php',
        '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx',
        '.ts', '.rb', '.swift', '.c',
        '.m', '.mm', '.scala', '.sh', '.bash',
        '.go', '.kt', '.kts', '.r', '.pl',
        '.rs', '.dart', '.lua', '.txt', '.env',
        '.config', '.xml', 'Makefile', '.md'
    ]);
    var ignoreDirs = new Set(['node_modules', 'data', 'vendor', 'build', 'test', 'tests', 'docs', 'assets']);
    logger_1["default"].info("Starting line count in directory: ".concat(dirPath));
    var lineCount = 0;
    var contents = fs.readdirSync(dirPath);
    contents.forEach(function (item) {
        var itemPath = path.join(dirPath, item);
        var itemStats = fs.statSync(itemPath);
        if (itemStats.isDirectory()) {
            // Check if the directory should be ignored
            if (!ignoreDirs.has(item)) {
                //console.log(`Traversing directory: ${itemPath}`);
                lineCount += countLinesOfCode(itemPath);
            }
        }
        else if (codeExtensions.has(path.extname(itemPath))) {
            try {
                var fileContent = fs.readFileSync(itemPath, 'utf-8');
                var fileLineCount = fileContent.split('\n').length;
                console.log("Counted ".concat(fileLineCount, " lines in file: ").concat(itemPath));
                lineCount += fileLineCount;
            }
            catch (error) {
                console.error("Error reading file ".concat(itemPath, ": ").concat(error.message));
            }
        }
    });
    logger_1["default"].info("Completed line count in directory: ".concat(dirPath));
    return lineCount;
}
function calculateRampUpTime(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, localPath, parts, repoName, rampUpScore, files, linesOfCode;
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
                    rampUpScore = 1;
                    if (repoName) {
                        localPath = path.join(localPath, repoName);
                    }
                    try {
                        if (!fs.existsSync(localPath)) {
                            console.log("Creating directory: ".concat(localPath));
                            fs.mkdirSync(localPath, { recursive: true });
                        }
                        else {
                            console.log("Directory already exists: ".concat(localPath));
                            files = fs.readdirSync(localPath);
                            if (files.length !== 0) {
                                console.log("Directory is not empty. Deleting contents of: ".concat(localPath));
                                fs.rmSync(localPath, { recursive: true, force: true });
                                fs.mkdirSync(localPath, { recursive: true });
                            }
                        }
                        console.log("Attempting to clone repository into: ".concat(localPath));
                        (0, child_process_1.execSync)("git clone --depth 1 ".concat(link, " ").concat(localPath), { stdio: 'inherit' });
                        // Additional steps for sparse checkout if needed
                        console.log("Starting line count in: ".concat(localPath));
                        linesOfCode = utils.countLinesOfCode(localPath);
                        console.log("Total lines of code in the repository: ".concat(linesOfCode));
                        // ... [rest of your scoring logic] ...
                    }
                    catch (error) {
                        console.error("An error occurred: ".concat(error.message));
                        return [2 /*return*/, 0];
                    }
                    finally {
                        // Cleanup: Delete the cloned directory
                        if (fs.existsSync(localPath)) {
                            console.log("Deleting directory: ".concat(localPath));
                            fs.rmSync(localPath, { recursive: true, force: true });
                        }
                    }
                    return [2 /*return*/, rampUpScore];
            }
        });
    });
}
exports.calculateRampUpTime = calculateRampUpTime;
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var url, linesOfCode;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = 'https://github.com/facebook/react';
                    console.log("Starting ramp-up time calculation for: ".concat(url));
                    return [4 /*yield*/, calculateRampUpTime(url)];
                case 1:
                    linesOfCode = _a.sent();
                    console.log("Result: ".concat(linesOfCode, " lines of code"));
                    return [2 /*return*/];
            }
        });
    });
}
main();
