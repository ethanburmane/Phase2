"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const winston_1 = require("winston");
const dotenv = tslib_1.__importStar(require("dotenv"));
const { combine, timestamp, json, prettyPrint } = winston_1.format;
dotenv.config();
const logLevel = {
    1: 'info',
    2: 'debug',
};
const logger = (0, winston_1.createLogger)({
    silent: process.env.LOG_LEVEL === '0',
    format: combine(timestamp(), json(), prettyPrint()),
    transports: [
        new winston_1.transports.File({
            filename: `${process.env.LOG_FILE}`,
            level: logLevel[process.env.LOG_LEVEL || '0'],
        }),
    ],
});
logger.info('logger initialized');
exports.default = logger;
/*
// Usage: winston allows you to define a level property on each transport which specifies the maximum level of messages that a transport should log.
// Logger configuration is set in the logger.ts file using process.env. (e.g. if LOG_LEVEL=1 (i.e. info), then logger.debug() will not be logged)

if (process.env.LOG_LEVEL != 0) {
// if informational message:
    logger.info(message)
// if debug message:
    logger.debug(message)
}
*/
