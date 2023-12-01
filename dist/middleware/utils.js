"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateLink = exports.calcRepoLines = exports.cloneRepo = exports.parseGHRepoName = exports.getLinesOfCode = exports.identifyLink = exports.round = void 0;
const tslib_1 = require("tslib");
/* eslint-disable no-console */
const fs = tslib_1.__importStar(require("node:fs"));
const url = tslib_1.__importStar(require("node:url"));
const node_child_process_1 = require("node:child_process");
const gh_service_1 = require("../services/gh-service");
const logger_1 = tslib_1.__importDefault(require("../logger"));
function round(value, decimals) {
    logger_1.default.info(`Rounding ${value} to ${decimals} decimal places`);
    // rounds number to specified decimal places
    return Number(value.toFixed(decimals));
}
exports.round = round;
function identifyLink(link) {
    logger_1.default.info(`Identifying link type for ${link}`);
    // link pattern for github
    const githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;
    // link pattern for npm
    const npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[\w.-]+/;
    if (githubPattern.test(link)) {
        return 'github';
    }
    if (npmPattern.test(link)) {
        return 'npm';
    }
    return null;
}
exports.identifyLink = identifyLink;
async function getLinesOfCode(filePath) {
    logger_1.default.info(`Getting lines of code for ${filePath}`);
    return new Promise((resolve, reject) => {
        let lineCount = 0;
        // open file stream
        const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
        // count the lines of code in file stream
        stream.on('data', (chunk) => {
            // Use the corrected regular expression to match newlines
            lineCount += (chunk.match(/(\r\n|\n|\r)/g) || []).length;
        });
        stream.on('end', () => {
            resolve(lineCount + 1); // Add 1 to account for the last line without a newline character
            logger_1.default.debug(`Lines of code: ${lineCount}`);
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}
exports.getLinesOfCode = getLinesOfCode;
function parseGHRepoName(repoUrl) {
    logger_1.default.info(`Parsing GitHub repository name from ${repoUrl}`);
    // Parse the URL
    const parsedUrl = url.parse(repoUrl);
    // Check if the URL is from github.com and has a valid path
    if (parsedUrl.hostname === 'github.com' &&
        parsedUrl.path &&
        parsedUrl.path.length > 1 // Ensure there's a path after the hostname
    ) {
        // Extract the repository name (removing leading slash if present)
        const pathComponents = parsedUrl.path.split('/');
        const repoName = pathComponents.pop(); // Get the last path component
        return repoName || null;
    }
    return null; // Not a valid GitHub repository URL
}
exports.parseGHRepoName = parseGHRepoName;
function cloneRepo(ghUrl, localPath, repoUrl) {
    logger_1.default.info(`Cloning GitHub repository from ${ghUrl}`);
    // clone repo
    return new Promise((resolve, reject) => {
        (0, node_child_process_1.exec)(`git clone ${repoUrl} ${localPath}`, (error) => {
            if (error) {
                logger_1.default.error(`Error cloning repo: ${error}`);
                reject(error);
            }
            else {
                logger_1.default.debug(`Cloned repo to ${localPath}`);
                resolve();
            }
        });
    });
}
exports.cloneRepo = cloneRepo;
function calcRepoLines(repoPath, callback) {
    logger_1.default.info(`Calculating lines of code for ${repoPath}`);
    const excludePatterns = [
        'node_modules', // Exclude the node_modules directory
        'dist', // Exclude the dist directory
        '.*\\.spec\\.ts', // Exclude TypeScript test files with .spec.ts extension
    ];
    // Construct the exclude arguments for cloc
    const excludeArgs = excludePatterns
        .map((pattern) => `--exclude-dir=${pattern}`)
        .join(' ');
    // Define the cloc command with the exclude arguments
    const clocCommand = `cloc ${repoPath} ${excludeArgs}`;
    let totalLines = 0;
    // Execute the cloc command
    (0, node_child_process_1.exec)(clocCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error: ${stderr}`);
            return;
        }
        const lines = stdout.split('\n');
        for (const line of lines) {
            if (line.startsWith('SUM:')) {
                const parts = line.trim().split(/\s+/);
                totalLines = Number.parseInt(parts.at(-1), 10);
                callback(totalLines);
                return;
            }
        }
    });
    return () => totalLines;
}
exports.calcRepoLines = calcRepoLines;
async function evaluateLink(link) {
    logger_1.default.info(`Evaluating link ${link}`);
    // checks whether the link is a github link or npm link
    const linkType = identifyLink(link);
    if (linkType === 'github') {
        return link;
    }
    if (linkType === 'npm') {
        return (0, gh_service_1.getGithubLinkFromNpm)(link);
    }
    return null;
}
exports.evaluateLink = evaluateLink;
