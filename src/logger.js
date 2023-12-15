"use strict";
exports.__esModule = true;
var winston_1 = require("winston");
var dotenv = require("dotenv");
var combine = winston_1.format.combine, timestamp = winston_1.format.timestamp, json = winston_1.format.json, prettyPrint = winston_1.format.prettyPrint;
dotenv.config();
var logLevel = {
    1: 'info',
    2: 'debug'
};
var logger = (0, winston_1.createLogger)({
    silent: process.env.LOG_LEVEL === '0',
    format: combine(timestamp(), json(), prettyPrint()),
    transports: [
        new winston_1.transports.File({
            filename: "".concat(process.env.LOG_FILE),
            level: logLevel[process.env.LOG_LEVEL || '0']
        }),
    ]
});
logger.info('logger initialized');
exports["default"] = logger;
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
