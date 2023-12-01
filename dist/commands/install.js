"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Install = exports.readFileAsync = void 0;
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const node_fs_1 = tslib_1.__importDefault(require("node:fs"));
const core_1 = require("@oclif/core");
const logger_1 = tslib_1.__importDefault(require("../logger"));
// import and configure dotenv
dotenv.config();
// read file asynchronously
async function readFileAsync(packagePath) {
    try {
        const data = await node_fs_1.default.promises.readFile(packagePath, 'utf8');
        logger_1.default.info('readFileAsync successful');
        return data;
    }
    catch (error) {
        if (error instanceof Error) {
            logger_1.default.debug(`Error reading file: ${error.message}`);
        }
        throw error; // Re-throw the error if needed
    }
}
exports.readFileAsync = readFileAsync;
class Install extends core_1.Command {
    // static description = 'Install dependecies'
    async run() {
        const packagePath = './package.json';
        try {
            const fileContent = await readFileAsync(packagePath);
            try {
                // Parse the JSON data
                const packageJson = JSON.parse(fileContent);
                // Access the dependencies object
                const { dependencies } = packageJson;
                // Get the number of dependencies
                const numDependencies = Object.keys(dependencies).length;
                this.log(`${numDependencies} dependencies installed...`);
            }
            catch (error) {
                this.error(`Error parsing package.json: ${error}`);
            }
        }
        catch (error) {
            if (error instanceof Error) {
                this.error(`Error reading file: ${error.message}`);
            }
        }
    }
}
exports.Install = Install;
