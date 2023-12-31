/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
import {Args, Command} from '@oclif/core'
import * as fs from 'node:fs'

export default class CheckUrl extends Command {
  static description = 'describe the command here'

  static args = {
    urls: Args.string({
      description: 'file path to URLs',
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(CheckUrl)
    const hiddenPath = './check_install'
    const fileContent = fs.readFileSync(hiddenPath, 'utf8')
    if (fileContent === 'yes\n') {
      const allFileContents = fs.readFileSync(args.urls, 'utf8')
      const urls = allFileContents
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '')
      let count = 0
      for (const url of urls) {
        // console.log(
        //   `{"URL": "${url}", "NET_SCORE":"${Metrics.NetScore}", "RAMP_UP_SCORE":${Metrics.RampUp}, "CORRECTNESS_SCORE":${Metrics.Correctness}, "BUS_FACTOR_SCORE":${Metrics.BusFactor}, 
        //   "RESPONSIVE_MAINTAINER_SCORE":${Metrics.Responsiveness}, "LICENSE_SCORE":${Metrics.License}}`,"DEPENDENCY_SCORE": ${Metrics.Dependencies}, "REVIEW_SCORE": ${Metrics.Review},
        // );
        count += 1;
      }

      if (count === urls.length) {
        return;
      }
    } else {
      console.log(
        'Dependencies not yet installed. Please run the following command:\n./run install',
      )
      process.exit(1)
    }
  }
}
