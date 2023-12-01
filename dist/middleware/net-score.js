"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateNetScore = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("./utils");
const metric_calculations_1 = require("./metric-calculations");
const logger_1 = tslib_1.__importDefault(require("../logger"));
// NetScore sub-category Calculations
async function calculateNetScore(url) {
    logger_1.default.info('Calculating Net Score');
    const busFactor = await (0, metric_calculations_1.calculateBusFactor)(url);
    const correctness = await (0, metric_calculations_1.calculateCorrectness)(url);
    // const rampUpTime = await calculateRampUpTime(url)
    const responsiveness = await (0, metric_calculations_1.calculateResponsiveness)(url);
    const licenseCompliance = await (0, metric_calculations_1.calculateLicenseCompliance)(url);
    /* eslint-disable no-template-curly-in-string */
    logger_1.default.debug('busFactor: ${busFactor}, correctness: ${correctness}, rampUpTime: ${rampUpTime}, responsiveness: ${responsiveness}, licenseCompliance: ${licenseCompliance}');
    /* eslint-enable no-template-curly-in-string */
    // Score weights
    const busFactorWeight = 0.4;
    const correctnessWeight = 0.15;
    // const rampUpTimeWeight = 0.15
    const responsivenessWeight = 0.3;
    // Calculate net score with weightings
    let netScore = licenseCompliance *
        (busFactor * busFactorWeight +
            correctness * correctnessWeight +
            // rampUpTime * rampUpTimeWeight +
            responsiveness * responsivenessWeight);
    netScore = (0, utils_1.round)(netScore, 3);
    return netScore;
}
exports.calculateNetScore = calculateNetScore;
