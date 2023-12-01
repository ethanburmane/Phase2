"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
const core_1 = require("@oclif/core");
const fs = tslib_1.__importStar(require("node:fs"));
const fill_models_1 = require("../middleware/fill-models");
class CheckUrl extends core_1.Command {
    async run() {
        const { args } = await this.parse(CheckUrl);
        const hiddenPath = './check_install';
        const fileContent = fs.readFileSync(hiddenPath, 'utf8');
        if (fileContent === 'yes\n') {
            const allFileContents = fs.readFileSync(args.urls, 'utf8');
            const urls = allFileContents
                .split(/\r?\n/)
                .filter((line) => line.trim() !== '');
            let count = 0;
            for (const url of urls) {
                (0, fill_models_1.assignMetrics)(url).then((Metrics) => {
                    console.log(`{"URL": "${url}", "NET_SCORE":${Metrics.NetScore}, "RAMP_UP_SCORE":${Metrics.RampUp}, "CORRECTNESS_SCORE":${Metrics.Correctness}, "BUS_FACTOR_SCORE":${Metrics.BusFactor}, "RESPONSIVE_MAINTAINER_SCORE":${Metrics.Responsiveness}, "LICENSE_SCORE":${Metrics.License}}`);
                    count += 1;
                });
            }
            if (count === urls.length) {
                process.exit(0);
            }
        }
        else {
            console.log('Dependencies not yet installed. Please run the following command:\n./run install');
            process.exit(1);
        }
    }
}
CheckUrl.description = 'describe the command here';
CheckUrl.args = {
    urls: core_1.Args.string({
        description: 'file path to URLs',
        required: true,
    }),
};
exports.default = CheckUrl;
