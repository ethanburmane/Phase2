import logger from '../src/logger'
import * as utils from '../src/middleware/utils'
import * as path from "path";
import * as fs from "fs";
import axios from 'axios';

export async function CloneReadme(url: string) {
  try {
    // Get the README file content from the GitHub API.
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${GIT_TOKEN}`,
        Accept: 'application/vnd.github.VERSION.raw', // Use the raw content type
      },
    });

    // Return the README file content as a string.
    return response.data;
  } catch (error: any) {
    throw new Error(error.response ? error.response.data : error.message);
  }
}

// Ramp-up Time Calculations
export async function calculateRampUpTime(url: string) {
  logger.info('Calculating Ramp Up Time')

  // checks to see if link is a npm link and if so, converts it to a github link
  let link = await utils.evaluateLink(url)
  if (link) {
    link = link?.split('github.com').pop() ?? null
    link = 'https://github.com' + link // eslint-disable-line prefer-template
  }

  let ReadMeLen = 0

  // get data using ./services/gh-service.ts
  if (link) {
    // clones the repo into ./cloned-repos
    const repoName = utils.parseGHRepoName(link)
    let localPath = '../src/middleware/cloned-repos'
    // format local path name
    if (repoName) {
      localPath = path.join(localPath, repoName)
    }

    // add .git to end of url
    let repoUrl = link
    if (!link.includes('.git')) {
      repoUrl = `${link}.git`
    }

    await CloneReadme(link, localPath, repoUrl)

    utils.calcRepoLines(localPath, (totalLines) => {
      linesOfCode = totalLines
      // console.log(totalLines)
      logger.debug(`linesOfCode: ${linesOfCode}`)

      let rampUpScore = 0
      // console.log(linesOfCode)
      if (linesOfCode <= 500) {
        rampUpScore = 1
      } else if (linesOfCode <= 1000) {
        rampUpScore = 0.9
      } else if (linesOfCode <= 5000) {
        rampUpScore = 0.8
      } else if (linesOfCode <= 10_000) {
        rampUpScore = 0.7
      } else if (linesOfCode <= 50_000) {
        rampUpScore = 0.6
      } else if (linesOfCode <= 100_000) {
        rampUpScore = 0.5
      } else if (linesOfCode <= 500_000) {
        rampUpScore = 0.4
      } else if (linesOfCode <= 1_000_000) {
        rampUpScore = 0.3
      } else if (linesOfCode <= 5_000_000) {
        rampUpScore = 0.2
      }

      return rampUpScore
    })
  } else {
    return () => 0
  }
}
















async  get_num_files(pkg: Package) {
    let UrlRepo = pkg.url;
    if (pkg.type !== 'unknown') {
        const repoPath = path.join(__dirname, 'clone'); // Specify the directory where you want to clone the repository
      
        try {
          const files = fs.readdirSync(repoPath);
      
          // Check if the directory is not empty
          if (files.length > 0) {
            // Clear the directory by removing all files and subdirectories
            for (const file of files) {
              const filePath = path.join(repoPath, file);
              const stat = fs.statSync(filePath);
      
              if (stat.isDirectory()) {
                // Remove subdirectories and their contents
                fs.rmSync(filePath, { recursive: true });
              } else {
                // Remove files
                fs.unlinkSync(filePath);
              }
            }
          }
      
          // Clone the repository
          await execSync(`git clone ${UrlRepo} ${repoPath}`);

          //report the number of files in the directory
          
        } catch (error : any) {
          console.error(`An error occurred: ${error.message}`);
        }
       
        const fileCount = this.countFilesInDirectory(repoPath);
        console.log("fileCount", fileCount);
        return fileCount;
      }
    
  
    
    }

    async function main() {
      const GITHUB_TOKEN = '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'
      console.log(GITHUB_TOKEN)

      time = calculateRampUpTime('')

    }