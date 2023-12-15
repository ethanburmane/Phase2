import axios from 'axios'
import logger from '../src/logger';
import { calculateLicenseCompliance } from '../src/middleware/metric-calculations';
import * as utils from '../src/middleware/utils';
export function FindMatch(fileContents: string): string[] {
    const licensePatterns: string[] = [
      'LGPLv2[. ]1',
      'GPLv2',
      'GPLv3',
      'MIT',
      'BSD',
      'Apache',
      'Expat',
      'zlib',
      'ISC',
    ];
    
  
    // Create a set to store found licenses
    const foundLicenses: Set<string> = new Set<string>();
  
    // Generate regex patterns for each license
    const regexPatterns: RegExp[] = licensePatterns.map((pattern) => {
      // Escape any special characters in the pattern
      const escapedPattern = pattern.replace(/[.*+?^${}()-|[\]\\]/g, '\\$&');
      return new RegExp(`[^\\w\\d]${escapedPattern}[^\\w\\d]`, 'i');
    });
  
    // Find matches using the generated regex patterns
    for (const regex of regexPatterns) {
      const matches = fileContents.match(regex);
      if (matches) {
        for (const match of matches) {
          // Clean up the match by removing surrounding non-alphanumeric characters
          const cleanedMatch = match.replace(/[^a-zA-Z0-9]+/g, '');
          //console.log('Pattern Matched:', match);
          foundLicenses.add(cleanedMatch);
        }
      }
    }
  
    // Convert the set to an array and return it
    console.log(Array.from(foundLicenses));
    return Array.from(foundLicenses);
  }

export async function CloneReadme(url: string) {
      try {
        // Get the README file content from the GitHub API.
        //logger.info("Requesting readme from github", {timestamp: new Date(), url: url});
        const response = await axios.get(url, {
          headers: {
            Authorization: `token ${process.env.GIT_TOKEN}`,
            Accept: 'application/vnd.github.VERSION.raw', // Use the raw content type
          },
        });
    
        // Return the README file content as a string.
        console.log(response.data);
        return response.data;
      } catch (error: any) {
            if (error.response)
            {
                logger.error("Error encountered when requesting readme", {timestamp: new Date(), url: url, message: error.message, response: error.response.data});
                throw new Error(error.response.data);
            }
            else
            {
                logger.error("Error encountered when requesting readme", {timestamp: new Date(), url: url, message: error.message});
                throw new Error(error.message);
            }
      }
  }

async function calculateLicense(url: string){
    let link = await utils.evaluateLink(url)
    if (link) {
        link = link?.split('github.com').pop() ?? null
        link = 'https://github.com' + link // eslint-disable-line prefer-template
    }
    console.log(link)
    const readme = await CloneReadme(url);
    const licenses = FindMatch(readme);

    if (licenses.length > 0)
    {
        console.log('true')
        return 1;
    }
    else
    {
        console.log('false')
        return 0;
    }

}
async function main(){
    console.log(await calculateLicenseCompliance('https://github.com/vuejs/vue'))
    await calculateLicense('https://www.npmjs.com/package/lodash')
}
main()
